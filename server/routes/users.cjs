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

// Get notification preferences
router.get('/me/notification-preferences', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { notificationPreferences: true } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const defaults = { emailOnClick: false, emailOnLinkExpiry: true, emailOnClickLimit: true, weeklyReport: true };
        res.json({ ...defaults, ...(user.notificationPreferences || {}) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
});

// Update notification preferences
router.patch('/me/notification-preferences', async (req, res) => {
    try {
        const { emailOnClick, emailOnLinkExpiry, emailOnClickLimit, weeklyReport } = req.body;
        const prefs = {};
        if (emailOnClick !== undefined) prefs.emailOnClick = !!emailOnClick;
        if (emailOnLinkExpiry !== undefined) prefs.emailOnLinkExpiry = !!emailOnLinkExpiry;
        if (emailOnClickLimit !== undefined) prefs.emailOnClickLimit = !!emailOnClickLimit;
        if (weeklyReport !== undefined) prefs.weeklyReport = !!weeklyReport;

        const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { notificationPreferences: true } });
        const current = user?.notificationPreferences || {};
        const merged = { ...current, ...prefs };

        await prisma.user.update({
            where: { id: req.user.userId },
            data: { notificationPreferences: merged }
        });
        res.json(merged);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification preferences' });
    }
});

// Delete own account
router.delete('/me', async (req, res) => {
    try {
        const userId = req.user.userId;
        // All related data is cascade-deleted via onDelete: Cascade in schema
        await prisma.user.delete({ where: { id: userId } });
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
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
