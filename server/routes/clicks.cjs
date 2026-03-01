const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

const botDetector = require('../middleware/botDetector.cjs');

// Record a click
router.post('/', botDetector, async (req, res) => {
    try {
        const { urlId, ip, userAgent, referrer, country, city, device, browser, os } = req.body;
        if (!urlId) return res.status(400).json({ error: 'urlId is required' });

        const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16) : null;

        // Use bot detection result
        const isBot = req.isBot || false;

        const click = await prisma.click.create({
            data: {
                urlId, ipHash, userAgent, referrer, country, city, device, browser, os,
                isBot
            }
        });

        // Only increment click count if it's NOT a bot (or maybe we separate counters?)
        // For now, let's count everything but allow filtering in analytics
        await prisma.url.update({ where: { id: urlId }, data: { currentClicks: { increment: 1 } } });
        res.status(201).json(click);
    } catch (error) {
        console.error('Error recording click:', error);
        res.status(500).json({ error: 'Failed to record click' });
    }
});

// Get clicks for a URL
router.get('/url/:urlId', authMiddleware, async (req, res) => {
    try {
        const clicks = await prisma.click.findMany({ where: { urlId: req.params.urlId }, orderBy: { createdAt: 'desc' } });
        res.json(clicks);
    } catch (error) {
        console.error('Error fetching clicks:', error);
        res.status(500).json({ error: 'Failed to fetch clicks' });
    }
});

// Get clicks for multiple URLs
router.post('/bulk', authMiddleware, async (req, res) => {
    try {
        const { urlIds } = req.body;
        if (!urlIds || !Array.isArray(urlIds)) return res.status(400).json({ error: 'urlIds array is required' });
        const clicks = await prisma.click.findMany({ where: { urlId: { in: urlIds } }, orderBy: { createdAt: 'desc' } });
        res.json(clicks);
    } catch (error) {
        console.error('Error fetching bulk clicks:', error);
        res.status(500).json({ error: 'Failed to fetch clicks' });
    }
});

// Get analytics for a URL
router.get('/analytics/:urlId', authMiddleware, async (req, res) => {
    try {
        const { urlId } = req.params;
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const clicks = await prisma.click.findMany({
            where: { urlId, createdAt: { gte: startDate } }, orderBy: { createdAt: 'asc' }
        });

        const totalClicks = clicks.length;
        const uniqueVisitors = new Set(clicks.map(c => c.ipHash)).size;

        const clicksByDay = {}, deviceStats = {}, browserStats = {}, countryStats = {}, referrerStats = {}, hourStats = {};

        clicks.forEach(click => {
            const day = click.createdAt.toISOString().split('T')[0];
            clicksByDay[day] = (clicksByDay[day] || 0) + 1;
            deviceStats[click.device || 'unknown'] = (deviceStats[click.device || 'unknown'] || 0) + 1;
            browserStats[click.browser || 'unknown'] = (browserStats[click.browser || 'unknown'] || 0) + 1;
            countryStats[click.country || 'unknown'] = (countryStats[click.country || 'unknown'] || 0) + 1;
            referrerStats[click.referrer || 'direct'] = (referrerStats[click.referrer || 'direct'] || 0) + 1;
            hourStats[click.createdAt.getHours()] = (hourStats[click.createdAt.getHours()] || 0) + 1;
        });

        res.json({
            totalClicks, uniqueVisitors,
            clicksByDay: Object.entries(clicksByDay).map(([date, count]) => ({ date, count })),
            deviceStats: Object.entries(deviceStats).map(([device, count]) => ({ device, count })),
            browserStats: Object.entries(browserStats).map(([browser, count]) => ({ browser, count })),
            countryStats: Object.entries(countryStats).map(([country, count]) => ({ country, count })),
            referrerStats: Object.entries(referrerStats).map(([referrer, count]) => ({ referrer, count })),
            hourStats: Object.entries(hourStats).map(([hour, count]) => ({ hour: parseInt(hour), count }))
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get dashboard analytics
router.get('/dashboard/:userId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const urls = await prisma.url.findMany({ where: { userId }, select: { id: true } });
        const urlIds = urls.map(u => u.id);

        const clicks = await prisma.click.findMany({
            where: { urlId: { in: urlIds }, createdAt: { gte: startDate } }
        });

        const totalLinks = urls.length;
        const totalClicks = clicks.length;
        const uniqueVisitors = new Set(clicks.map(c => c.ipHash)).size;

        const clicksByDay = {};
        clicks.forEach(click => {
            const day = click.createdAt.toISOString().split('T')[0];
            clicksByDay[day] = (clicksByDay[day] || 0) + 1;
        });

        res.json({
            totalLinks, totalClicks, uniqueVisitors,
            avgClicksPerLink: totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0,
            clicksByDay: Object.entries(clicksByDay).map(([date, count]) => ({ date, count }))
        });
    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
});

module.exports = router;
