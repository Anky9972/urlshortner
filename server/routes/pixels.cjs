const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

// Get all pixels for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;

        const pixels = await prisma.retargetingPixel.findMany({
            where: { userId },
            include: { _count: { select: { urls: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(pixels);
    } catch (error) {
        console.error('Error fetching pixels:', error);
        res.status(500).json({ error: 'Failed to fetch pixels' });
    }
});

// Get single pixel
router.get('/:id', async (req, res) => {
    try {
        const pixel = await prisma.retargetingPixel.findUnique({
            where: { id: req.params.id },
            include: { urls: { include: { url: true } } }
        });
        if (!pixel) return res.status(404).json({ error: 'Pixel not found' });
        res.json(pixel);
    } catch (error) {
        console.error('Error fetching pixel:', error);
        res.status(500).json({ error: 'Failed to fetch pixel' });
    }
});

// Create pixel
router.post('/', async (req, res) => {
    try {
        const { userId, name, type, pixelId } = req.body;
        if (!userId || !name || !type || !pixelId) {
            return res.status(400).json({ error: 'userId, name, type, and pixelId are required' });
        }

        const pixel = await prisma.retargetingPixel.create({
            data: { userId, name, type, pixelId }
        });
        res.status(201).json(pixel);
    } catch (error) {
        console.error('Error creating pixel:', error);
        res.status(500).json({ error: 'Failed to create pixel' });
    }
});

// Update pixel
router.patch('/:id', async (req, res) => {
    try {
        const { name, type, pixelId, isActive } = req.body;
        const pixel = await prisma.retargetingPixel.update({
            where: { id: req.params.id },
            data: { name, type, pixelId, isActive }
        });
        res.json(pixel);
    } catch (error) {
        console.error('Error updating pixel:', error);
        res.status(500).json({ error: 'Failed to update pixel' });
    }
});

// Delete pixel
router.delete('/:id', async (req, res) => {
    try {
        await prisma.pixelOnUrl.deleteMany({ where: { pixelId: req.params.id } });
        await prisma.retargetingPixel.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting pixel:', error);
        res.status(500).json({ error: 'Failed to delete pixel' });
    }
});

// Attach pixel to URL
router.post('/attach', async (req, res) => {
    try {
        const { urlId, pixelId } = req.body;
        if (!urlId || !pixelId) return res.status(400).json({ error: 'urlId and pixelId are required' });

        const existing = await prisma.pixelOnUrl.findUnique({
            where: { urlId_pixelId: { urlId, pixelId } }
        });
        if (existing) return res.json({ message: 'Pixel already attached' });

        const relation = await prisma.pixelOnUrl.create({ data: { urlId, pixelId } });
        res.status(201).json(relation);
    } catch (error) {
        console.error('Error attaching pixel:', error);
        res.status(500).json({ error: 'Failed to attach pixel' });
    }
});

// Detach pixel from URL
router.delete('/detach', async (req, res) => {
    try {
        const { urlId, pixelId } = req.body;
        if (!urlId || !pixelId) return res.status(400).json({ error: 'urlId and pixelId are required' });

        await prisma.pixelOnUrl.delete({
            where: { urlId_pixelId: { urlId, pixelId } }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error detaching pixel:', error);
        res.status(500).json({ error: 'Failed to detach pixel' });
    }
});

// Get pixels for a URL
router.get('/url/:urlId', async (req, res) => {
    try {
        const pixelRelations = await prisma.pixelOnUrl.findMany({
            where: { urlId: req.params.urlId },
            include: { pixel: true }
        });
        res.json(pixelRelations.map(r => r.pixel));
    } catch (error) {
        console.error('Error fetching URL pixels:', error);
        res.status(500).json({ error: 'Failed to fetch URL pixels' });
    }
});

module.exports = router;
