const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

// Get all folders for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const folders = await prisma.folder.findMany({
            where: { userId }, include: { _count: { select: { urls: true } } }, orderBy: { createdAt: 'desc' }
        });
        res.json(folders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});

// Create folder
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, description, color } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const folder = await prisma.folder.create({
            data: { name, description, color: color || '#3B82F6', userId },
            include: { _count: { select: { urls: true } } }
        });
        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// Update folder
router.patch('/:id', async (req, res) => {
    try {
        const folder = await prisma.folder.update({ where: { id: req.params.id }, data: req.body });
        res.json(folder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update folder' });
    }
});

// Delete folder
router.delete('/:id', async (req, res) => {
    try {
        await prisma.url.updateMany({ where: { folderId: req.params.id }, data: { folderId: null } });
        await prisma.folder.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

// Move URL to folder
router.post('/move-url', async (req, res) => {
    try {
        const { urlId, folderId } = req.body;
        if (!urlId) return res.status(400).json({ error: 'urlId is required' });
        const url = await prisma.url.update({ where: { id: urlId }, data: { folderId: folderId || null } });
        res.json(url);
    } catch (error) {
        res.status(500).json({ error: 'Failed to move URL' });
    }
});

// Get all tags
router.get('/tags', async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({ include: { _count: { select: { urls: true } } }, orderBy: { name: 'asc' } });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// Create tag
router.post('/tags', async (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const tag = await prisma.tag.create({ data: { name, color: color || '#6B7280' } });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

// Delete tag
router.delete('/tags/:id', async (req, res) => {
    try {
        await prisma.tagOnUrl.deleteMany({ where: { tagId: req.params.id } });
        await prisma.tag.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});

// Add tag to URL
router.post('/tags/add-to-url', async (req, res) => {
    try {
        const { urlId, tagId } = req.body;
        if (!urlId || !tagId) return res.status(400).json({ error: 'urlId and tagId are required' });
        const existing = await prisma.tagOnUrl.findUnique({ where: { urlId_tagId: { urlId, tagId } } });
        if (existing) return res.json({ message: 'Tag already added' });
        const relation = await prisma.tagOnUrl.create({ data: { urlId, tagId } });
        res.status(201).json(relation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add tag' });
    }
});

// Remove tag from URL
router.delete('/tags/remove-from-url', async (req, res) => {
    try {
        const { urlId, tagId } = req.body;
        await prisma.tagOnUrl.delete({ where: { urlId_tagId: { urlId, tagId } } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove tag' });
    }
});

module.exports = router;
