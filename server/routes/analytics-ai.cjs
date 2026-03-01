const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

router.post('/query', async (req, res) => {
    try {
        const { question } = req.body;
        const userId = req.user.userId;

        if (!question || typeof question !== 'string') {
            return res.status(400).json({ error: 'A question is required' });
        }

        // Gather actual analytics data for context
        const [urlCount, totalClicks, recentClicks, topUrls] = await Promise.all([
            prisma.url.count({ where: { userId } }),
            prisma.click.count({ where: { url: { userId } } }),
            prisma.click.findMany({
                where: { url: { userId }, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                select: { createdAt: true, country: true, device: true, browser: true },
                orderBy: { createdAt: 'desc' },
                take: 500
            }),
            prisma.url.findMany({
                where: { userId },
                select: { title: true, shortUrl: true, currentClicks: true },
                orderBy: { currentClicks: 'desc' },
                take: 5
            })
        ]);

        // Build analytics summary
        const countryCounts = {};
        const deviceCounts = {};
        const dailyCounts = {};
        recentClicks.forEach(click => {
            if (click.country) countryCounts[click.country] = (countryCounts[click.country] || 0) + 1;
            if (click.device) deviceCounts[click.device] = (deviceCounts[click.device] || 0) + 1;
            const day = click.createdAt.toISOString().split('T')[0];
            dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        });

        const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);

        const summary = [
            `You have ${urlCount} links with ${totalClicks} total clicks.`,
            topUrls.length > 0 ? `Your top links: ${topUrls.map(u => `"${u.title}" (${u.currentClicks} clicks)`).join(', ')}.` : '',
            topCountries.length > 0 ? `Top countries (last 30 days): ${topCountries.map(([c, n]) => `${c} (${n})`).join(', ')}.` : '',
            topDevices.length > 0 ? `Device breakdown: ${topDevices.map(([d, n]) => `${d} (${n})`).join(', ')}.` : '',
            recentClicks.length > 0 ? `You received ${recentClicks.length} clicks in the last 30 days.` : 'No clicks recorded in the last 30 days.'
        ].filter(Boolean).join(' ');

        res.json({
            answer: summary,
            data: { urlCount, totalClicks, topUrls, topCountries: Object.fromEntries(topCountries), deviceBreakdown: deviceCounts, recentClickCount: recentClicks.length }
        });
    } catch (error) {
        console.error('Analytics query failed:', error);
        res.status(500).json({ error: 'Analytics query failed' });
    }
});

module.exports = router;
