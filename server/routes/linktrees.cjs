const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware, optionalAuth } = require('../middleware/auth.cjs');
const bcrypt = require('bcryptjs');

const router = Router();

// ==============================
// HELPERS
// ==============================

// Rate-limit click recording: 1 unique click per IP+linkId per 5 minutes
const clickTracker = new Map();
const CLICK_WINDOW_MS = 5 * 60 * 1000;
setInterval(() => {
    const now = Date.now();
    for (const [k, exp] of clickTracker.entries()) {
        if (exp < now) clickTracker.delete(k);
    }
}, 10 * 60 * 1000);

// Detect device type from User-Agent string
function detectDevice(ua = '') {
    if (!ua) return 'unknown';
    const s = ua.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(s)) return 'tablet';
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(s)) return 'mobile';
    return 'desktop';
}

// Extract referrer domain (or null)
function extractReferrer(refHeader) {
    if (!refHeader) return null;
    try {
        const host = new URL(refHeader).hostname.replace(/^www\./, '').slice(0, 100);
        return host || null;
    } catch {
        return null;
    }
}

// Extract country from CDN headers
function extractCountry(req) {
    return req.headers['cf-ipcountry'] ||
        req.headers['x-vercel-ip-country'] ||
        req.headers['x-country'] ||
        null;
}

// Build slug from a title string + optional suffix
function slugify(title, suffix = '') {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50);
    return suffix ? `${base}-${suffix}` : base;
}

// Check if a tree's scheduled activation window is currently active
function isTreeScheduleActive(tree) {
    const now = new Date();
    if (tree.publishAt && new Date(tree.publishAt) > now) return false;   // Not yet published
    if (tree.unpublishAt && new Date(tree.unpublishAt) < now) return false; // Already unpublished
    return true;
}

// Apply A/B rotation to a list of links (server-side random pick per link)
function applyABRotation(links) {
    return links.map(link => {
        if (link.abVariantUrl && link.type === 'link') {
            const showVariant = Math.random() * 100 < (link.abWeight ?? 50);
            if (showVariant) {
                return { ...link, url: link.abVariantUrl, title: link.abVariantTitle || link.title, _ab: 'b' };
            }
        }
        return { ...link, _ab: 'a' };
    });
}

// Scheduling filter for public link items
function linkSchedulingFilter() {
    const now = new Date();
    return {
        isActive: true,
        OR: [
            { type: { not: 'link' } },
            {
                AND: [
                    { OR: [{ activatesAt: null }, { activatesAt: { lte: now } }] },
                    { OR: [{ deactivatesAt: null }, { deactivatesAt: { gte: now } }] },
                ]
            }
        ]
    };
}

// ==============================
// PUBLIC ROUTES (no auth needed)
// ==============================

// Check slug availability (no auth required)
router.get('/check-slug/:slug', async (req, res) => {
    try {
        const existing = await prisma.linkTree.findUnique({ where: { slug: req.params.slug } });
        res.json({ available: !existing });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check slug' });
    }
});

// Get a linktree by slug (public view)
router.get('/public/:slug', async (req, res) => {
    try {
        const tree = await prisma.linkTree.findUnique({
            where: { slug: req.params.slug },
            include: {
                links: {
                    where: linkSchedulingFilter(),
                    orderBy: { order: 'asc' }
                },
                user: { select: { name: true, avatarUrl: true, isVerified: true } }
            }
        });

        if (!tree) return res.status(404).json({ error: 'LinkTree not found' });
        if (!tree.isPublic) return res.status(404).json({ error: 'LinkTree not found' });

        // Scheduled activation check
        if (!isTreeScheduleActive(tree)) {
            return res.status(410).json({
                error: 'This LinkTree is not currently active',
                publishAt: tree.publishAt,
                unpublishAt: tree.unpublishAt,
            });
        }

        // Password protection — return gate info without full tree data
        if (tree.password) {
            return res.status(403).json({
                passwordRequired: true,
                id: tree.id,
                slug: tree.slug,
                title: tree.title,
                avatarUrl: tree.avatarUrl,
                user: tree.user,
            });
        }

        // Increment view count (fire-and-forget)
        prisma.linkTree.update({
            where: { id: tree.id },
            data: { viewCount: { increment: 1 } }
        }).catch(() => {});

        // Store view event for time-series analytics (fire-and-forget)
        prisma.linkTreeEvent.create({
            data: {
                linkTreeId: tree.id,
                eventType: 'view',
                device: detectDevice(req.headers['user-agent']),
                referrer: extractReferrer(req.headers['referer'] || req.headers['referrer']),
                country: extractCountry(req),
            }
        }).catch(() => {});

        // Strip password hash and apply A/B rotation before sending
        const { password: _pw, ...safeTree } = tree;
        safeTree.links = applyABRotation(safeTree.links);
        res.json(safeTree);
    } catch (error) {
        console.error('Error fetching public linktree:', error);
        res.status(500).json({ error: 'Failed to fetch linktree' });
    }
});

// Verify password for a password-protected linktree
router.post('/public/:slug/auth', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ error: 'password is required' });

        const tree = await prisma.linkTree.findUnique({
            where: { slug: req.params.slug },
            include: {
                links: { where: linkSchedulingFilter(), orderBy: { order: 'asc' } },
                user: { select: { name: true, avatarUrl: true, isVerified: true } }
            }
        });

        if (!tree || !tree.isPublic) return res.status(404).json({ error: 'LinkTree not found' });
        if (!tree.password) {
            const { password: _pw, ...safe } = tree;
            safe.links = applyABRotation(safe.links);
            return res.json(safe);
        }

        const valid = await bcrypt.compare(password, tree.password);
        if (!valid) return res.status(401).json({ error: 'Incorrect password' });

        // Track view event
        prisma.linkTree.update({ where: { id: tree.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
        prisma.linkTreeEvent.create({
            data: {
                linkTreeId: tree.id, eventType: 'view',
                device: detectDevice(req.headers['user-agent']),
                referrer: extractReferrer(req.headers['referer'] || req.headers['referrer']),
                country: extractCountry(req),
            }
        }).catch(() => {});

        const { password: _pw2, ...safeTree } = tree;
        safeTree.links = applyABRotation(safeTree.links);
        res.json(safeTree);
    } catch (error) {
        console.error('Error in linktree auth:', error);
        res.status(500).json({ error: 'Failed to authenticate' });
    }
});

// Get a linktree by custom domain host
router.get('/by-domain/:domain', async (req, res) => {
    try {
        const domainRecord = await prisma.customDomain.findUnique({
            where: { domain: req.params.domain }
        });
        if (!domainRecord || !domainRecord.verified)
            return res.status(404).json({ error: 'Domain not found or not verified' });

        const tree = await prisma.linkTree.findFirst({
            where: { customDomainId: domainRecord.id, isPublic: true },
            include: {
                links: { where: linkSchedulingFilter(), orderBy: { order: 'asc' } },
                user: { select: { name: true, avatarUrl: true, isVerified: true } }
            }
        });
        if (!tree) return res.status(404).json({ error: 'No active LinkTree for this domain' });
        if (!isTreeScheduleActive(tree)) return res.status(410).json({ error: 'Not currently active' });
        if (tree.password) {
            return res.status(403).json({ passwordRequired: true, id: tree.id, slug: tree.slug, title: tree.title });
        }

        prisma.linkTree.update({ where: { id: tree.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
        const { password: _pw, ...safeTree } = tree;
        safeTree.links = applyABRotation(safeTree.links);
        res.json(safeTree);
    } catch (error) {
        console.error('Error fetching by domain:', error);
        res.status(500).json({ error: 'Failed to fetch linktree' });
    }
});

// Increment link click count (public) — rate-limited per IP+linkId
router.post('/public/:slug/click/:linkId', async (req, res) => {
    const ip = req.ip || 'unknown';
    const key = `${ip}:${req.params.linkId}`;
    const now = Date.now();

    if (clickTracker.has(key) && clickTracker.get(key) > now) {
        // Throttled — return success silently so UI doesn't break
        return res.json({ success: true, throttled: true });
    }
    clickTracker.set(key, now + CLICK_WINDOW_MS);

    try {
        await prisma.linkTreeItem.update({
            where: { id: req.params.linkId },
            data: { clicks: { increment: 1 } }
        });

        // Store click event for rich analytics (fire-and-forget)
        // First resolve linkTreeId from the item
        prisma.linkTreeItem.findUnique({ where: { id: req.params.linkId }, select: { linkTreeId: true } })
            .then(item => {
                if (!item) return;
                return prisma.linkTreeEvent.create({
                    data: {
                        linkTreeId: item.linkTreeId,
                        linkItemId: req.params.linkId,
                        eventType: 'click',
                        device: detectDevice(req.headers['user-agent']),
                        referrer: extractReferrer(req.headers['referer'] || req.headers['referrer']),
                        country: extractCountry(req),
                    }
                });
            })
            .catch(() => {});

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record click' });
    }
});

// Get public linktrees gallery (paginated, schedule-aware)
router.get('/gallery', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '24', 10), 100);
        const cursor = req.query.cursor || undefined;
        const now = new Date();

        const trees = await prisma.linkTree.findMany({
            where: {
                isPublic: true,
                OR: [{ publishAt: null }, { publishAt: { lte: now } }],
                AND: [{ OR: [{ unpublishAt: null }, { unpublishAt: { gte: now } }] }],
            },
            include: {
                links: { where: { isActive: true }, orderBy: { order: 'asc' }, take: 5 },
                user: { select: { name: true, avatarUrl: true, isVerified: true } }
            },
            orderBy: { viewCount: 'desc' },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        const hasMore = trees.length > limit;
        const results = hasMore ? trees.slice(0, limit) : trees;
        // Don't expose password hash
        res.json({
            trees: results.map(({ password: _p, ...t }) => t),
            nextCursor: hasMore ? results[results.length - 1].id : null,
            hasMore,
        });
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// ==============================
// AUTHENTICATED ROUTES
// ==============================

router.use(authMiddleware);

// Get all linktrees for current user (including team linktrees the user is a member of)
router.get('/', async (req, res) => {
    try {
        // Find team IDs this user belongs to
        const memberships = await prisma.teamMember.findMany({
            where: { userId: req.user.userId },
            select: { teamId: true }
        });
        const teamIds = memberships.map(m => m.teamId);

        const trees = await prisma.linkTree.findMany({
            where: {
                OR: [
                    { userId: req.user.userId },
                    ...(teamIds.length ? [{ teamId: { in: teamIds } }] : [])
                ]
            },
            include: {
                links: { orderBy: { order: 'asc' } },
                _count: { select: { links: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(trees);
    } catch (error) {
        console.error('Error fetching linktrees:', error);
        res.status(500).json({ error: 'Failed to fetch linktrees' });
    }
});

// Get team linktrees
router.get('/team/:teamId', async (req, res) => {
    try {
        const isMember = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId: req.params.teamId, userId: req.user.userId } }
        });
        if (!isMember) return res.status(403).json({ error: 'Not a team member' });

        const trees = await prisma.linkTree.findMany({
            where: { teamId: req.params.teamId },
            include: { links: { orderBy: { order: 'asc' } }, _count: { select: { links: true } } },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(trees);
    } catch (error) {
        console.error('Error fetching team linktrees:', error);
        res.status(500).json({ error: 'Failed to fetch team linktrees' });
    }
});

// Get linktree analytics (viewCount + per-link clicks + CTR + time-series + device + referrer)
router.get('/:id/analytics', async (req, res) => {
    try {
        const tree = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId },
            include: { links: { orderBy: { order: 'asc' } } }
        });
        if (!tree) return res.status(404).json({ error: 'LinkTree not found' });

        const totalLinkClicks = tree.links.reduce((sum, l) => sum + (l.clicks || 0), 0);
        const linksWithCtr = tree.links.map(l => ({
            id: l.id, title: l.title, url: l.url, clicks: l.clicks || 0, type: l.type || 'link',
            ctr: tree.viewCount > 0 ? ((l.clicks || 0) / tree.viewCount * 100).toFixed(1) : '0.0'
        }));

        // --- Rich analytics from events (last 30 days) ---
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const events = await prisma.linkTreeEvent.findMany({
            where: { linkTreeId: tree.id, createdAt: { gte: thirtyDaysAgo } },
            select: { eventType: true, createdAt: true, device: true, referrer: true }
        });

        // Build per-day time-series filling in all 30 days
        const dayMap = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            dayMap[key] = { date: key, views: 0, clicks: 0 };
        }
        for (const e of events) {
            const key = e.createdAt.toISOString().slice(0, 10);
            if (dayMap[key]) {
                if (e.eventType === 'view') dayMap[key].views++;
                else if (e.eventType === 'click') dayMap[key].clicks++;
            }
        }
        const timeSeries = Object.values(dayMap);

        // Device breakdown
        const deviceMap = {};
        for (const e of events) {
            const d = e.device || 'unknown';
            deviceMap[d] = (deviceMap[d] || 0) + 1;
        }
        const deviceBreakdown = Object.entries(deviceMap).map(([device, count]) => ({ device, count }));

        // Referrer breakdown (top 10)
        const refMap = {};
        for (const e of events) {
            if (e.referrer) refMap[e.referrer] = (refMap[e.referrer] || 0) + 1;
        }
        const referrerBreakdown = Object.entries(refMap)
            .sort((a, b) => b[1] - a[1]).slice(0, 10)
            .map(([referrer, count]) => ({ referrer, count }));

        res.json({
            id: tree.id,
            title: tree.title,
            slug: tree.slug,
            viewCount: tree.viewCount,
            totalLinkClicks,
            links: linksWithCtr,
            timeSeries,
            deviceBreakdown,
            referrerBreakdown,
        });
    } catch (error) {
        console.error('Error fetching linktree analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get single linktree by ID (owner or team member)
router.get('/:id', async (req, res) => {
    try {
        const tree = await prisma.linkTree.findUnique({
            where: { id: req.params.id },
            include: { links: { orderBy: { order: 'asc' } } }
        });
        if (!tree) return res.status(404).json({ error: 'LinkTree not found' });

        // Access: owner OR team member
        if (tree.userId !== req.user.userId && tree.teamId) {
            const isMember = await prisma.teamMember.findUnique({
                where: { teamId_userId: { teamId: tree.teamId, userId: req.user.userId } }
            });
            if (!isMember) return res.status(404).json({ error: 'LinkTree not found' });
        } else if (tree.userId !== req.user.userId) {
            return res.status(404).json({ error: 'LinkTree not found' });
        }
        res.json(tree);
    } catch (error) {
        console.error('Error fetching linktree:', error);
        res.status(500).json({ error: 'Failed to fetch linktree' });
    }
});

// Create linktree
router.post('/', async (req, res) => {
    try {
        const {
            title, description, slug: rawSlug, theme, customCss, avatarUrl,
            backgroundColor, textColor, buttonStyle, isPublic, links,
            socialLinks, backgroundImage, fontFamily, seoTitle, seoDescription, seoImage,
            password: rawPassword, publishAt, unpublishAt, customDomainId, teamId
        } = req.body;

        if (!title) return res.status(400).json({ error: 'title is required' });

        // Auto-generate slug from title if not provided
        let slug = rawSlug ? rawSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '') : null;
        if (!slug) slug = slugify(title, Date.now().toString(36));

        // Ensure uniqueness
        let finalSlug = slug, attempt = 0;
        while (await prisma.linkTree.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${slug}-${++attempt}`;
        }
        slug = finalSlug;

        // Hash password if provided
        const passwordHash = rawPassword ? await bcrypt.hash(rawPassword, 10) : undefined;

        const tree = await prisma.linkTree.create({
            data: {
                title, description, slug,
                theme: theme || 'default', customCss, avatarUrl, backgroundColor, textColor,
                buttonStyle: buttonStyle || 'rounded',
                isPublic: isPublic !== false,
                userId: req.user.userId,
                ...(passwordHash !== undefined && { password: passwordHash }),
                ...(publishAt !== undefined && { publishAt: publishAt ? new Date(publishAt) : null }),
                ...(unpublishAt !== undefined && { unpublishAt: unpublishAt ? new Date(unpublishAt) : null }),
                ...(customDomainId !== undefined && { customDomainId }),
                ...(teamId !== undefined && { teamId }),
                ...(socialLinks !== undefined && { socialLinks }),
                ...(backgroundImage !== undefined && { backgroundImage }),
                ...(fontFamily !== undefined && { fontFamily }),
                ...(seoTitle !== undefined && { seoTitle }),
                ...(seoDescription !== undefined && { seoDescription }),
                ...(seoImage !== undefined && { seoImage }),
                links: links && links.length > 0 ? {
                    create: links.map((link, index) => ({
                        title: link.title,
                        url: link.url || '',
                        icon: link.icon,
                        thumbnail: link.thumbnail,
                        isActive: link.isActive !== false,
                        order: link.order ?? index,
                        type: link.type || 'link',
                        abVariantUrl: link.abVariantUrl || null,
                        abVariantTitle: link.abVariantTitle || null,
                        abWeight: link.abWeight ?? 50,
                        activatesAt: link.activatesAt ? new Date(link.activatesAt) : null,
                        deactivatesAt: link.deactivatesAt ? new Date(link.deactivatesAt) : null,
                    }))
                } : undefined
            },
            include: { links: { orderBy: { order: 'asc' } } }
        });

        const { password: _pw, ...safe } = tree;
        res.status(201).json(safe);
    } catch (error) {
        console.error('Error creating linktree:', error);
        res.status(500).json({ error: 'Failed to create linktree' });
    }
});

// Update linktree
router.patch('/:id', async (req, res) => {
    try {
        const existing = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId }
        });
        if (!existing) return res.status(404).json({ error: 'LinkTree not found' });

        const {
            title, description, slug, theme, customCss, avatarUrl,
            backgroundColor, textColor, buttonStyle, isPublic,
            socialLinks, backgroundImage, fontFamily, seoTitle, seoDescription, seoImage,
            password: rawPassword, publishAt, unpublishAt, customDomainId, teamId
        } = req.body;

        if (slug && slug !== existing.slug) {
            const slugExists = await prisma.linkTree.findUnique({ where: { slug } });
            if (slugExists) return res.status(400).json({ error: 'Slug already taken' });
        }

        // Hash new password, or null out if empty string passed, or keep existing if not provided
        let passwordUpdate = {};
        if (rawPassword !== undefined) {
            passwordUpdate = { password: rawPassword ? await bcrypt.hash(rawPassword, 10) : null };
        }

        const tree = await prisma.linkTree.update({
            where: { id: req.params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(slug !== undefined && { slug }),
                ...(theme !== undefined && { theme }),
                ...(customCss !== undefined && { customCss }),
                ...(avatarUrl !== undefined && { avatarUrl }),
                ...(backgroundColor !== undefined && { backgroundColor }),
                ...(textColor !== undefined && { textColor }),
                ...(buttonStyle !== undefined && { buttonStyle }),
                ...(isPublic !== undefined && { isPublic }),
                ...(socialLinks !== undefined && { socialLinks }),
                ...(backgroundImage !== undefined && { backgroundImage }),
                ...(fontFamily !== undefined && { fontFamily }),
                ...(seoTitle !== undefined && { seoTitle }),
                ...(seoDescription !== undefined && { seoDescription }),
                ...(seoImage !== undefined && { seoImage }),
                ...(publishAt !== undefined && { publishAt: publishAt ? new Date(publishAt) : null }),
                ...(unpublishAt !== undefined && { unpublishAt: unpublishAt ? new Date(unpublishAt) : null }),
                ...(customDomainId !== undefined && { customDomainId }),
                ...(teamId !== undefined && { teamId }),
                ...passwordUpdate,
            },
            include: { links: { orderBy: { order: 'asc' } } }
        });

        const { password: _pw, ...safe } = tree;
        res.json(safe);
    } catch (error) {
        console.error('Error updating linktree:', error);
        res.status(500).json({ error: 'Failed to update linktree' });
    }
});

// Delete linktree
router.delete('/:id', async (req, res) => {
    try {
        const existing = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId }
        });
        if (!existing) return res.status(404).json({ error: 'LinkTree not found' });

        await prisma.linkTree.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting linktree:', error);
        res.status(500).json({ error: 'Failed to delete linktree' });
    }
});

// ==============================
// LINK ITEMS MANAGEMENT
// ==============================

// Add a link to a linktree
router.post('/:id/links', async (req, res) => {
    try {
        const existing = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId }
        });
        if (!existing) return res.status(404).json({ error: 'LinkTree not found' });

        const { title, url, icon, thumbnail } = req.body;
        if (!title) return res.status(400).json({ error: 'title is required' });
        const linkType = req.body.type || 'link';
        if (linkType === 'link' && !url) return res.status(400).json({ error: 'url is required for link type' });

        // Get max order
        const maxOrder = await prisma.linkTreeItem.aggregate({
            where: { linkTreeId: req.params.id },
            _max: { order: true }
        });

        const link = await prisma.linkTreeItem.create({
            data: {
                linkTreeId: req.params.id,
                title,
                url: url || '',
                icon,
                thumbnail,
                order: (maxOrder._max.order ?? -1) + 1,
                type: linkType,
            }
        });

        res.status(201).json(link);
    } catch (error) {
        console.error('Error adding link:', error);
        res.status(500).json({ error: 'Failed to add link' });
    }
});

// Update a link item
router.patch('/:id/links/:linkId', async (req, res) => {
    try {
        const existing = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId }
        });
        if (!existing) return res.status(404).json({ error: 'LinkTree not found' });

        const { title, url, icon, thumbnail, isActive, order, type, activatesAt, deactivatesAt } = req.body;
        const link = await prisma.linkTreeItem.update({
            where: { id: req.params.linkId },
            data: {
                ...(title !== undefined && { title }),
                ...(url !== undefined && { url }),
                ...(icon !== undefined && { icon }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(isActive !== undefined && { isActive }),
                ...(order !== undefined && { order }),
                ...(type !== undefined && { type }),
                ...(activatesAt !== undefined && { activatesAt: activatesAt ? new Date(activatesAt) : null }),
                ...(deactivatesAt !== undefined && { deactivatesAt: deactivatesAt ? new Date(deactivatesAt) : null }),
            }
        });

        res.json(link);
    } catch (error) {
        console.error('Error updating link:', error);
        res.status(500).json({ error: 'Failed to update link' });
    }
});

// Delete a link item
router.delete('/:id/links/:linkId', async (req, res) => {
    try {
        const existing = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId }
        });
        if (!existing) return res.status(404).json({ error: 'LinkTree not found' });

        await prisma.linkTreeItem.delete({ where: { id: req.params.linkId } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

// Reorder links (batch update)
router.put('/:id/links/reorder', async (req, res) => {
    try {
        const existing = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId }
        });
        if (!existing) return res.status(404).json({ error: 'LinkTree not found' });

        const { orderedIds } = req.body; // Array of link IDs in desired order
        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ error: 'orderedIds array is required' });
        }

        await Promise.all(
            orderedIds.map((id, index) =>
                prisma.linkTreeItem.update({ where: { id }, data: { order: index } })
            )
        );

        const links = await prisma.linkTreeItem.findMany({
            where: { linkTreeId: req.params.id },
            orderBy: { order: 'asc' }
        });

        res.json(links);
    } catch (error) {
        console.error('Error reordering links:', error);
        res.status(500).json({ error: 'Failed to reorder links' });
    }
});

// Bulk update all links (replace all links at once)
router.put('/:id/links', async (req, res) => {
    try {
        const existing = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId }
        });
        if (!existing) return res.status(404).json({ error: 'LinkTree not found' });

        const { links } = req.body;
        if (!links || !Array.isArray(links)) {
            return res.status(400).json({ error: 'links array is required' });
        }

        // Delete all existing links and recreate
        await prisma.linkTreeItem.deleteMany({ where: { linkTreeId: req.params.id } });

        const created = await Promise.all(
            links.map((link, index) =>
                prisma.linkTreeItem.create({
                    data: {
                        linkTreeId: req.params.id,
                        title: link.title,
                        url: link.url || '',
                        icon: link.icon || null,
                        thumbnail: link.thumbnail || null,
                        isActive: link.isActive !== false,
                        order: link.order ?? index,
                        clicks: link.clicks || 0,
                        type: link.type || 'link',
                        abVariantUrl: link.abVariantUrl || null,
                        abVariantTitle: link.abVariantTitle || null,
                        abWeight: link.abWeight ?? 50,
                        activatesAt: link.activatesAt ? new Date(link.activatesAt) : null,
                        deactivatesAt: link.deactivatesAt ? new Date(link.deactivatesAt) : null,
                    }
                })
            )
        );

        res.json(created);
    } catch (error) {
        console.error('Error updating links:', error);
        res.status(500).json({ error: 'Failed to update links' });
    }
});

module.exports = router;
