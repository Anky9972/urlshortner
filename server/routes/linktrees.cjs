const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware, optionalAuth } = require('../middleware/auth.cjs');

const router = Router();

// ==============================
// PUBLIC ROUTES (no auth needed)
// ==============================

// Get a linktree by slug (public view)
router.get('/public/:slug', async (req, res) => {
    try {
        const tree = await prisma.linkTree.findUnique({
            where: { slug: req.params.slug },
            include: {
                links: { where: { isActive: true }, orderBy: { order: 'asc' } },
                user: { select: { name: true, avatarUrl: true } }
            }
        });

        if (!tree) return res.status(404).json({ error: 'LinkTree not found' });
        if (!tree.isPublic) return res.status(404).json({ error: 'LinkTree not found' });

        // Increment view count
        await prisma.linkTree.update({
            where: { id: tree.id },
            data: { viewCount: { increment: 1 } }
        });

        res.json(tree);
    } catch (error) {
        console.error('Error fetching public linktree:', error);
        res.status(500).json({ error: 'Failed to fetch linktree' });
    }
});

// Increment link click count (public)
router.post('/public/:slug/click/:linkId', async (req, res) => {
    try {
        await prisma.linkTreeItem.update({
            where: { id: req.params.linkId },
            data: { clicks: { increment: 1 } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record click' });
    }
});

// Get all public linktrees (gallery)
router.get('/gallery', async (req, res) => {
    try {
        const trees = await prisma.linkTree.findMany({
            where: { isPublic: true },
            include: {
                links: { where: { isActive: true }, orderBy: { order: 'asc' }, take: 5 },
                user: { select: { name: true, avatarUrl: true } }
            },
            orderBy: { viewCount: 'desc' },
            take: 50
        });
        res.json(trees);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// ==============================
// AUTHENTICATED ROUTES
// ==============================

router.use(authMiddleware);

// Get all linktrees for current user
router.get('/', async (req, res) => {
    try {
        const trees = await prisma.linkTree.findMany({
            where: { userId: req.user.userId },
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

// Get single linktree by ID
router.get('/:id', async (req, res) => {
    try {
        const tree = await prisma.linkTree.findFirst({
            where: { id: req.params.id, userId: req.user.userId },
            include: {
                links: { orderBy: { order: 'asc' } }
            }
        });
        if (!tree) return res.status(404).json({ error: 'LinkTree not found' });
        res.json(tree);
    } catch (error) {
        console.error('Error fetching linktree:', error);
        res.status(500).json({ error: 'Failed to fetch linktree' });
    }
});

// Create linktree
router.post('/', async (req, res) => {
    try {
        const { title, description, slug, theme, customCss, avatarUrl, backgroundColor, textColor, buttonStyle, isPublic, links } = req.body;

        if (!title || !slug) {
            return res.status(400).json({ error: 'title and slug are required' });
        }

        // Check slug uniqueness
        const existing = await prisma.linkTree.findUnique({ where: { slug } });
        if (existing) return res.status(400).json({ error: 'Slug already taken' });

        const tree = await prisma.linkTree.create({
            data: {
                title,
                description,
                slug,
                theme: theme || 'default',
                customCss,
                avatarUrl,
                backgroundColor,
                textColor,
                buttonStyle: buttonStyle || 'rounded',
                isPublic: isPublic !== false,
                userId: req.user.userId,
                links: links && links.length > 0 ? {
                    create: links.map((link, index) => ({
                        title: link.title,
                        url: link.url,
                        icon: link.icon,
                        thumbnail: link.thumbnail,
                        isActive: link.isActive !== false,
                        order: link.order ?? index,
                    }))
                } : undefined
            },
            include: { links: { orderBy: { order: 'asc' } } }
        });

        res.status(201).json(tree);
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

        const { title, description, slug, theme, customCss, avatarUrl, backgroundColor, textColor, buttonStyle, isPublic } = req.body;

        // Check slug uniqueness if changing
        if (slug && slug !== existing.slug) {
            const slugExists = await prisma.linkTree.findUnique({ where: { slug } });
            if (slugExists) return res.status(400).json({ error: 'Slug already taken' });
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
            },
            include: { links: { orderBy: { order: 'asc' } } }
        });

        res.json(tree);
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
        if (!title || !url) return res.status(400).json({ error: 'title and url are required' });

        // Get max order
        const maxOrder = await prisma.linkTreeItem.aggregate({
            where: { linkTreeId: req.params.id },
            _max: { order: true }
        });

        const link = await prisma.linkTreeItem.create({
            data: {
                linkTreeId: req.params.id,
                title,
                url,
                icon,
                thumbnail,
                order: (maxOrder._max.order ?? -1) + 1
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

        const { title, url, icon, thumbnail, isActive, order } = req.body;
        const link = await prisma.linkTreeItem.update({
            where: { id: req.params.linkId },
            data: {
                ...(title !== undefined && { title }),
                ...(url !== undefined && { url }),
                ...(icon !== undefined && { icon }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(isActive !== undefined && { isActive }),
                ...(order !== undefined && { order }),
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
                        url: link.url,
                        icon: link.icon || null,
                        thumbnail: link.thumbnail || null,
                        isActive: link.isActive !== false,
                        order: link.order ?? index,
                        clicks: link.clicks || 0,
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
