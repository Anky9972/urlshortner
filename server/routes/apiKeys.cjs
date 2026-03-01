const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

const generateApiKey = () => 'tk_' + crypto.randomBytes(32).toString('hex');

// Get all API keys for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;

        const keys = await prisma.apiKey.findMany({
            where: { userId },
            select: { id: true, name: true, description: true, key: true, permissions: true, rateLimit: true, lastUsedAt: true, expiresAt: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });

        const maskedKeys = keys.map(k => ({ ...k, keyMasked: '••••••••' + k.key.slice(-8), key: undefined }));
        res.json(maskedKeys);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
});

// Create API key
router.post('/', async (req, res) => {
    try {
        const { userId, name, description, permissions, rateLimit, expiresAt } = req.body;
        if (!userId || !name) return res.status(400).json({ error: 'userId and name are required' });

        const key = generateApiKey();
        const apiKey = await prisma.apiKey.create({
            data: { key, name, description, userId, permissions: permissions || ['read', 'write'], rateLimit: rateLimit || 1000, expiresAt: expiresAt ? new Date(expiresAt) : null }
        });

        res.status(201).json({ ...apiKey, keyFull: key, keyMasked: '••••••••' + key.slice(-8) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create API key' });
    }
});

// Toggle API key
router.patch('/:id/toggle', async (req, res) => {
    try {
        const key = await prisma.apiKey.update({ where: { id: req.params.id }, data: { isActive: req.body.isActive } });
        res.json(key);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle API key' });
    }
});

// Delete API key
router.delete('/:id', async (req, res) => {
    try {
        await prisma.apiKey.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete API key' });
    }
});

// Validate API key
router.post('/validate', async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) return res.status(400).json({ valid: false, error: 'key is required' });

        const apiKey = await prisma.apiKey.findUnique({ where: { key }, include: { user: { select: { id: true, email: true, name: true } } } });

        if (!apiKey) return res.json({ valid: false, error: 'Invalid API key' });
        if (!apiKey.isActive) return res.json({ valid: false, error: 'API key is disabled' });
        if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return res.json({ valid: false, error: 'API key has expired' });

        await prisma.apiKey.update({ where: { key }, data: { lastUsedAt: new Date() } });
        res.json({ valid: true, user: apiKey.user, permissions: apiKey.permissions, rateLimit: apiKey.rateLimit });
    } catch (error) {
        res.status(500).json({ valid: false, error: 'Validation error' });
    }
});

module.exports = router;
