const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

// Get health history for a URL
router.get('/url/:urlId', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const checks = await prisma.linkHealthCheck.findMany({
            where: { urlId: req.params.urlId },
            orderBy: { checkedAt: 'desc' },
            take: parseInt(limit)
        });
        res.json(checks);
    } catch (error) {
        console.error('Error fetching health history:', error);
        res.status(500).json({ error: 'Failed to fetch health history' });
    }
});

// Get latest health status for a URL
router.get('/url/:urlId/latest', async (req, res) => {
    try {
        const check = await prisma.linkHealthCheck.findFirst({
            where: { urlId: req.params.urlId },
            orderBy: { checkedAt: 'desc' }
        });
        res.json(check || { isHealthy: null, message: 'No health check performed yet' });
    } catch (error) {
        console.error('Error fetching latest health:', error);
        res.status(500).json({ error: 'Failed to fetch health status' });
    }
});

// Get all unhealthy links for a user
router.get('/unhealthy', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        // Get URLs belonging to user
        const urls = await prisma.url.findMany({
            where: { userId },
            select: { id: true, title: true, originalUrl: true, shortUrl: true }
        });
        const urlIds = urls.map(u => u.id);

        // Get latest health check for each URL
        const unhealthyUrls = [];
        for (const url of urls) {
            const latestCheck = await prisma.linkHealthCheck.findFirst({
                where: { urlId: url.id },
                orderBy: { checkedAt: 'desc' }
            });
            if (latestCheck && !latestCheck.isHealthy) {
                unhealthyUrls.push({
                    ...url,
                    healthCheck: latestCheck
                });
            }
        }

        res.json(unhealthyUrls);
    } catch (error) {
        console.error('Error fetching unhealthy links:', error);
        res.status(500).json({ error: 'Failed to fetch unhealthy links' });
    }
});

// Manually trigger health check for a URL
router.post('/check/:urlId', async (req, res) => {
    try {
        const url = await prisma.url.findUnique({
            where: { id: req.params.urlId },
            select: { id: true, originalUrl: true }
        });

        if (!url) return res.status(404).json({ error: 'URL not found' });

        // Perform health check
        const startTime = Date.now();
        let statusCode = null;
        let isHealthy = false;
        let errorMessage = null;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(url.originalUrl, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow',
                headers: {
                    'User-Agent': 'TrimLink-HealthChecker/1.0'
                }
            });

            clearTimeout(timeout);
            statusCode = response.status;
            isHealthy = statusCode >= 200 && statusCode < 400;
        } catch (error) {
            if (error.name === 'AbortError') {
                errorMessage = 'Request timeout (10s)';
            } else {
                errorMessage = error.message;
            }
        }

        const responseTime = Date.now() - startTime;

        // Record health check
        const check = await prisma.linkHealthCheck.create({
            data: {
                urlId: url.id,
                statusCode,
                isHealthy,
                responseTime,
                errorMessage
            }
        });

        res.json(check);
    } catch (error) {
        console.error('Error performing health check:', error);
        res.status(500).json({ error: 'Failed to perform health check' });
    }
});

// Bulk health check for all user URLs
router.post('/check-all', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const urls = await prisma.url.findMany({
            where: { userId },
            select: { id: true, originalUrl: true }
        });

        // Return immediately, checks will run in background
        res.json({
            message: `Health check initiated for ${urls.length} URLs`,
            count: urls.length
        });

        // Perform checks asynchronously
        for (const url of urls) {
            const startTime = Date.now();
            let statusCode = null;
            let isHealthy = false;
            let errorMessage = null;

            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(url.originalUrl, {
                    method: 'HEAD',
                    signal: controller.signal,
                    redirect: 'follow',
                    headers: {
                        'User-Agent': 'TrimLink-HealthChecker/1.0'
                    }
                });

                clearTimeout(timeout);
                statusCode = response.status;
                isHealthy = statusCode >= 200 && statusCode < 400;
            } catch (error) {
                if (error.name === 'AbortError') {
                    errorMessage = 'Request timeout (10s)';
                } else {
                    errorMessage = error.message;
                }
            }

            const responseTime = Date.now() - startTime;

            await prisma.linkHealthCheck.create({
                data: {
                    urlId: url.id,
                    statusCode,
                    isHealthy,
                    responseTime,
                    errorMessage
                }
            });
        }
    } catch (error) {
        console.error('Error in bulk health check:', error);
    }
});

// Get health summary for user
router.get('/summary', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const urls = await prisma.url.findMany({
            where: { userId },
            select: { id: true }
        });

        let healthy = 0;
        let unhealthy = 0;
        let unchecked = 0;

        for (const url of urls) {
            const latestCheck = await prisma.linkHealthCheck.findFirst({
                where: { urlId: url.id },
                orderBy: { checkedAt: 'desc' }
            });

            if (!latestCheck) {
                unchecked++;
            } else if (latestCheck.isHealthy) {
                healthy++;
            } else {
                unhealthy++;
            }
        }

        res.json({
            total: urls.length,
            healthy,
            unhealthy,
            unchecked,
            healthPercentage: urls.length > 0 ? ((healthy / urls.length) * 100).toFixed(1) : 100
        });
    } catch (error) {
        console.error('Error fetching health summary:', error);
        res.status(500).json({ error: 'Failed to fetch health summary' });
    }
});

module.exports = router;
