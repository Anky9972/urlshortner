const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

// Unified search across URLs and LinkTrees
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json({ urls: [], linktrees: [] });
        }

        const userId = req.user.userId;
        const query = q.trim();

        const [urls, linktrees] = await Promise.all([
            prisma.url.findMany({
                where: {
                    userId,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { originalUrl: { contains: query, mode: 'insensitive' } },
                        { shortUrl: { contains: query, mode: 'insensitive' } },
                        { customUrl: { contains: query, mode: 'insensitive' } },
                    ]
                },
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { clicks: true } } }
            }),
            prisma.linkTree.findMany({
                where: {
                    userId,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { slug: { contains: query, mode: 'insensitive' } },
                    ]
                },
                take: 5,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        res.json({ urls, linktrees });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
