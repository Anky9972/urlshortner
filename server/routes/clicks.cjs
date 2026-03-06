const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth.cjs');
const { createNotification } = require('../lib/notifications.cjs');

const router = Router();

const botDetector = require('../middleware/botDetector.cjs');

// ─── IP Geolocation (ip-api.com free tier, no key needed) ───────────────────
const geoCache = new Map();
async function getGeo(rawIp) {
    if (!rawIp) return {};
    const ip = rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp;
    // Skip private / loopback addresses
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return {};
    if (geoCache.has(ip)) return geoCache.get(ip);
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const r = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName,countryCode`, { signal: controller.signal });
        clearTimeout(timer);
        const d = await r.json();
        const result = d.status === 'success'
            ? { country: d.country, city: d.city, region: d.regionName, countryCode: d.countryCode }
            : {};
        if (geoCache.size >= 5000) geoCache.delete(geoCache.keys().next().value);
        geoCache.set(ip, result);
        return result;
    } catch {
        return {};
    }
}

// Record a click
router.post('/', botDetector, async (req, res) => {
    try {
        const { urlId, ip, userAgent, referrer, country, city, device, browser, os } = req.body;
        if (!urlId) return res.status(400).json({ error: 'urlId is required' });

        // Get real client IP from proxy headers
        const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
            || req.headers['x-real-ip']
            || req.socket.remoteAddress
            || ip
            || '';
        const ipHash = clientIp ? crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16) : null;

        // Resolve geolocation if country/city not provided by client
        let geoCountry = country || null;
        let geoCity = city || null;
        let geoRegion = null;
        let geoCountryCode = null;
        if (!geoCountry || !geoCity) {
            const geo = await getGeo(clientIp);
            geoCountry = geoCountry || geo.country || null;
            geoCity = geoCity || geo.city || null;
            geoRegion = geo.region || null;
            geoCountryCode = geo.countryCode || null;
        }

        // Use bot detection result
        const isBot = req.isBot || false;

        const click = await prisma.click.create({
            data: {
                urlId, ipHash, userAgent, referrer,
                country: geoCountry, city: geoCity, region: geoRegion, countryCode: geoCountryCode,
                device, browser, os,
                isBot
            }
        });

        // Only increment click count if it's NOT a bot (or maybe we separate counters?)
        // For now, let's count everything but allow filtering in analytics
        const updatedUrl = await prisma.url.update({ where: { id: urlId }, data: { currentClicks: { increment: 1 } }, select: { currentClicks: true, userId: true, title: true, shortUrl: true } });

        // Click milestone notifications (non-blocking)
        const milestones = [10, 50, 100, 500, 1000, 5000, 10000];
        const count = updatedUrl.currentClicks;
        if (milestones.includes(count)) {
            createNotification({
                userId: updatedUrl.userId,
                type: 'click_milestone',
                title: `🎉 ${count} clicks on "${updatedUrl.title || updatedUrl.shortUrl}"`,
                message: `Your link "${updatedUrl.title || updatedUrl.shortUrl}" just reached ${count} clicks!`,
                data: { urlId, clickCount: count, shortUrl: updatedUrl.shortUrl }
            }).catch(() => {});
        }

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

        const clicksByDay = {}, deviceStats = {}, browserStats = {}, osStats = {}, countryStats = {}, countryCodeMap = {}, referrerStats = {}, hourStats = {};

        clicks.forEach(click => {
            const day = click.createdAt.toISOString().split('T')[0];
            clicksByDay[day] = (clicksByDay[day] || 0) + 1;
            deviceStats[click.device || 'unknown'] = (deviceStats[click.device || 'unknown'] || 0) + 1;
            browserStats[click.browser || 'unknown'] = (browserStats[click.browser || 'unknown'] || 0) + 1;
            osStats[click.os || 'unknown'] = (osStats[click.os || 'unknown'] || 0) + 1;
            const cName = click.country || 'Unknown';
            countryStats[cName] = (countryStats[cName] || 0) + 1;
            if (click.countryCode) countryCodeMap[cName] = click.countryCode;
            // Normalise referrer to domain only
            let ref = 'direct';
            if (click.referrer && click.referrer !== 'null' && click.referrer !== 'undefined') {
                try { ref = new URL(click.referrer).hostname || click.referrer; } catch { ref = click.referrer; }
            }
            referrerStats[ref] = (referrerStats[ref] || 0) + 1;
            hourStats[click.createdAt.getHours()] = (hourStats[click.createdAt.getHours()] || 0) + 1;
        });

        res.json({
            totalClicks, uniqueVisitors,
            clicksByDay: Object.entries(clicksByDay).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
            deviceStats: Object.entries(deviceStats).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count),
            browserStats: Object.entries(browserStats).map(([browser, count]) => ({ browser, count })).sort((a, b) => b.count - a.count),
            osStats: Object.entries(osStats).map(([os, count]) => ({ os, count })).sort((a, b) => b.count - a.count),
            countryStats: Object.entries(countryStats)
                .map(([country, count]) => ({ country, count, countryCode: countryCodeMap[country] || null }))
                .sort((a, b) => b.count - a.count),
            referrerStats: Object.entries(referrerStats).map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count),
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
