const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

// Get all tags
router.get('/', async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({
            include: { _count: { select: { urls: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// Create tag
router.post('/', async (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });

        // Check if tag already exists
        const existing = await prisma.tag.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ error: 'Tag with this name already exists' });

        const tag = await prisma.tag.create({
            data: { name, color: color || '#6B7280' }
        });
        res.status(201).json(tag);
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

// Update tag
router.patch('/:id', async (req, res) => {
    try {
        const { name, color } = req.body;
        const tag = await prisma.tag.update({
            where: { id: req.params.id },
            data: { name, color }
        });
        res.json(tag);
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({ error: 'Failed to update tag' });
    }
});

// Delete tag
router.delete('/:id', async (req, res) => {
    try {
        await prisma.tagOnUrl.deleteMany({ where: { tagId: req.params.id } });
        await prisma.tag.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});

// Add tag to URL
router.post('/add-to-url', async (req, res) => {
    try {
        const { urlId, tagId } = req.body;
        if (!urlId || !tagId) return res.status(400).json({ error: 'urlId and tagId are required' });

        const existing = await prisma.tagOnUrl.findUnique({
            where: { urlId_tagId: { urlId, tagId } }
        });
        if (existing) return res.json({ message: 'Tag already added' });

        const relation = await prisma.tagOnUrl.create({ data: { urlId, tagId } });
        res.status(201).json(relation);
    } catch (error) {
        console.error('Error adding tag to URL:', error);
        res.status(500).json({ error: 'Failed to add tag to URL' });
    }
});

// Remove tag from URL
router.delete('/remove-from-url', async (req, res) => {
    try {
        const { urlId, tagId } = req.body;
        if (!urlId || !tagId) return res.status(400).json({ error: 'urlId and tagId are required' });

        await prisma.tagOnUrl.delete({
            where: { urlId_tagId: { urlId, tagId } }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing tag from URL:', error);
        res.status(500).json({ error: 'Failed to remove tag from URL' });
    }
});

// Get URLs by tag
router.get('/:tagId/urls', async (req, res) => {
    try {
        const { userId } = req.query;
        const urls = await prisma.url.findMany({
            where: {
                userId,
                tags: { some: { tagId: req.params.tagId } }
            },
            include: {
                _count: { select: { clicks: true } },
                folder: true,
                tags: { include: { tag: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(urls);
    } catch (error) {
        console.error('Error fetching URLs by tag:', error);
        res.status(500).json({ error: 'Failed to fetch URLs by tag' });
    }
});

module.exports = router;
