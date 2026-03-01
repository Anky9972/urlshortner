const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { nanoid } = require('nanoid');
const { authMiddleware, optionalAuth } = require('../middleware/auth.cjs');

const router = Router();

// Get all URLs for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        const urls = await prisma.url.findMany({
            where: { userId },
            include: {
                _count: { select: { clicks: true } },
                folder: true,
                healthChecks: {
                    take: 1,
                    orderBy: { checkedAt: 'desc' },
                    select: { isHealthy: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(urls);
    } catch (error) {
        console.error('Error fetching URLs:', error);
        res.status(500).json({ error: 'Failed to fetch URLs' });
    }
});

// Get single URL
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const url = await prisma.url.findFirst({
            where: { id, userId },
            include: { clicks: true, targetingRules: true, folder: true }
        });

        if (!url) return res.status(404).json({ error: 'URL not found' });
        res.json(url);
    } catch (error) {
        console.error('Error fetching URL:', error);
        res.status(500).json({ error: 'Failed to fetch URL' });
    }
});

// Get URL by short code (for redirect)
router.get('/redirect/:shortUrl', async (req, res) => {
    try {
        const { shortUrl } = req.params;

        const url = await prisma.url.findFirst({
            where: { OR: [{ shortUrl }, { customUrl: shortUrl }] },
            include: { targetingRules: true }
        });

        if (!url) return res.status(404).json({ error: 'URL not found' });
        res.json(url);
    } catch (error) {
        console.error('Error fetching redirect URL:', error);
        res.status(500).json({ error: 'Failed to fetch URL' });
    }
});

// Create new URL
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, longUrl, customUrl, expirationDate, password, clickLimit, activatesAt, deactivatesAt, folderId, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, qrCode, isCloaked, pixels, isRotator, rotatorConfig } = req.body;

        if (!title || !longUrl) {
            return res.status(400).json({ error: 'title and longUrl are required' });
        }

        const shortUrl = nanoid(6);

        if (customUrl) {
            const existing = await prisma.url.findUnique({ where: { customUrl } });
            if (existing) return res.status(400).json({ error: 'Custom URL already taken' });
        }

        const url = await prisma.url.create({
            data: {
                title, originalUrl: longUrl, shortUrl, customUrl: customUrl || null, qrCode: qrCode || null,
                password: password || null, clickLimit: clickLimit ? parseInt(clickLimit) : null,
                activatesAt: activatesAt ? new Date(activatesAt) : null, deactivatesAt: deactivatesAt ? new Date(deactivatesAt) : null,
                expiresAt: expirationDate ? new Date(expirationDate) : null, folderId: folderId || null,
                utmSource, utmMedium, utmCampaign, utmTerm, utmContent, userId,
                isCloaked: isCloaked || false,
                isRotator: isRotator || false,
                pixels: pixels && pixels.length > 0 ? {
                    create: pixels.map(pixelId => ({ pixel: { connect: { id: pixelId } } }))
                } : undefined,
                splitDestinations: isRotator && rotatorConfig && rotatorConfig.destinations ? {
                    create: rotatorConfig.destinations.map(dest => ({
                        targetUrl: dest.targetUrl,
                        weight: dest.weight || 1,
                        name: dest.name || 'Variant'
                    }))
                } : undefined
            }
        });

        res.status(201).json([url]);
    } catch (error) {
        console.error('Error creating URL:', error);
        res.status(500).json({ error: 'Failed to create URL' });
    }
});


// Update URL
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // Verify ownership
        const existing = await prisma.url.findFirst({ where: { id, userId: req.user.userId } });
        if (!existing) return res.status(404).json({ error: 'URL not found' });
        const url = await prisma.url.update({ where: { id }, data: req.body });
        res.json(url);
    } catch (error) {
        console.error('Error updating URL:', error);
        res.status(500).json({ error: 'Failed to update URL' });
    }
});

// Delete URL
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const existing = await prisma.url.findFirst({ where: { id: req.params.id, userId: req.user.userId } });
        if (!existing) return res.status(404).json({ error: 'URL not found' });
        await prisma.url.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting URL:', error);
        res.status(500).json({ error: 'Failed to delete URL' });
    }
});

// Bulk delete URLs
router.post('/bulk-delete', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'ids array is required' });
        await prisma.url.deleteMany({ where: { id: { in: ids }, userId: req.user.userId } });
        res.json({ success: true, deleted: ids.length });
    } catch (error) {
        console.error('Error bulk deleting URLs:', error);
        res.status(500).json({ error: 'Failed to bulk delete URLs' });
    }
});

// Add targeting rule
router.post('/:id/targeting', authMiddleware, async (req, res) => {
    try {
        const { condition, targetUrl, priority } = req.body;
        const rule = await prisma.targetingRule.create({ data: { condition, targetUrl, priority: priority || 0, urlId: req.params.id } });
        res.status(201).json(rule);
    } catch (error) {
        console.error('Error adding targeting rule:', error);
        res.status(500).json({ error: 'Failed to add targeting rule' });
    }
});

// Get targeting rules
router.get('/:id/targeting', authMiddleware, async (req, res) => {
    try {
        const rules = await prisma.targetingRule.findMany({ where: { urlId: req.params.id }, orderBy: { priority: 'desc' } });
        res.json(rules);
    } catch (error) {
        console.error('Error fetching targeting rules:', error);
        res.status(500).json({ error: 'Failed to fetch targeting rules' });
    }
});

// Delete targeting rule
router.delete('/targeting/:ruleId', authMiddleware, async (req, res) => {
    try {
        await prisma.targetingRule.delete({ where: { id: req.params.ruleId } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting targeting rule:', error);
        res.status(500).json({ error: 'Failed to delete targeting rule' });
    }
});

module.exports = router;
