const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

// Get current user profile
router.get('/me', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user
router.patch('/:id', async (req, res) => {
    try {
        // Only allow updating own profile
        if (req.params.id !== req.user.userId) {
            return res.status(403).json({ error: 'Can only update your own profile' });
        }
        const { name, avatarUrl } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { ...(name !== undefined && { name }), ...(avatarUrl !== undefined && { avatarUrl }) }
        });
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Get user stats
router.get('/:id/stats', async (req, res) => {
    try {
        const [urlCount, totalClicks, folderCount] = await Promise.all([
            prisma.url.count({ where: { userId: req.params.id } }),
            prisma.click.count({ where: { url: { userId: req.params.id } } }),
            prisma.folder.count({ where: { userId: req.params.id } })
        ]);
        res.json({ totalUrls: urlCount, totalClicks, totalFolders: folderCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

// Get user dashboard data
router.get('/:id/dashboard', async (req, res) => {
    try {
        const userId = req.params.id;
        const [urls, folders, recentClicks] = await Promise.all([
            prisma.url.findMany({
                where: { userId },
                select: { id: true, title: true, shortUrl: true, currentClicks: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),
            prisma.folder.findMany({ where: { userId }, include: { _count: { select: { urls: true } } } }),
            prisma.click.findMany({
                where: { url: { userId } },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: { createdAt: true, country: true, device: true }
            })
        ]);
        res.json({ recentUrls: urls, folders, recentClicks });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

module.exports = router;
