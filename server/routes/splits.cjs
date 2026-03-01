const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

// Get split destinations for a URL
router.get('/url/:urlId', async (req, res) => {
    try {
        const splits = await prisma.splitDestination.findMany({
            where: { urlId: req.params.urlId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(splits);
    } catch (error) {
        console.error('Error fetching splits:', error);
        res.status(500).json({ error: 'Failed to fetch split destinations' });
    }
});

// Create split destination
router.post('/', async (req, res) => {
    try {
        const { urlId, name, targetUrl, weight } = req.body;
        if (!urlId || !targetUrl) {
            return res.status(400).json({ error: 'urlId and targetUrl are required' });
        }

        // Validate weight
        const existingSplits = await prisma.splitDestination.findMany({
            where: { urlId, isActive: true }
        });
        const totalWeight = existingSplits.reduce((sum, s) => sum + s.weight, 0);
        const newWeight = weight || 50;

        if (totalWeight + newWeight > 100) {
            return res.status(400).json({
                error: `Total weight would exceed 100%. Current: ${totalWeight}%, Requested: ${newWeight}%`
            });
        }

        const split = await prisma.splitDestination.create({
            data: { urlId, name, targetUrl, weight: newWeight }
        });
        res.status(201).json(split);
    } catch (error) {
        console.error('Error creating split:', error);
        res.status(500).json({ error: 'Failed to create split destination' });
    }
});

// Update split destination
router.patch('/:id', async (req, res) => {
    try {
        const { name, targetUrl, weight, isActive } = req.body;

        // If updating weight, validate total
        if (weight !== undefined) {
            const split = await prisma.splitDestination.findUnique({
                where: { id: req.params.id }
            });
            if (!split) return res.status(404).json({ error: 'Split not found' });

            const otherSplits = await prisma.splitDestination.findMany({
                where: { urlId: split.urlId, isActive: true, id: { not: req.params.id } }
            });
            const otherWeight = otherSplits.reduce((sum, s) => sum + s.weight, 0);

            if (otherWeight + weight > 100) {
                return res.status(400).json({
                    error: `Total weight would exceed 100%. Other splits: ${otherWeight}%, Requested: ${weight}%`
                });
            }
        }

        const updated = await prisma.splitDestination.update({
            where: { id: req.params.id },
            data: { name, targetUrl, weight, isActive }
        });
        res.json(updated);
    } catch (error) {
        console.error('Error updating split:', error);
        res.status(500).json({ error: 'Failed to update split destination' });
    }
});

// Delete split destination
router.delete('/:id', async (req, res) => {
    try {
        await prisma.splitDestination.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting split:', error);
        res.status(500).json({ error: 'Failed to delete split destination' });
    }
});

// Record click on a split (called during redirect)
router.post('/:id/click', async (req, res) => {
    try {
        await prisma.splitDestination.update({
            where: { id: req.params.id },
            data: { clicks: { increment: 1 } }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error recording split click:', error);
        res.status(500).json({ error: 'Failed to record click' });
    }
});

// Get redirect destination (Split or Rotator)
router.get('/url/:urlId/redirect', async (req, res) => {
    try {
        const { urlId } = req.params;

        // Fetch URL to check configuration
        const url = await prisma.url.findUnique({
            where: { id: urlId },
            include: { splitDestinations: { where: { isActive: true }, orderBy: { createdAt: 'asc' } } }
        });

        if (!url) return res.status(404).json({ error: 'URL not found' });

        const splits = url.splitDestinations;

        if (splits.length === 0) {
            return res.json({ useSplit: false });
        }

        // ROTATOR LOGIC: Check if it's strictly a rotator (Sequential)
        if (url.isRotator) {
            // Sequential Round Robin
            // We use currentClicks as the pointer, modulo the number of destinations
            const index = url.currentClicks % splits.length;
            const target = splits[index];

            return res.json({
                useSplit: true,
                splitId: target.id,
                targetUrl: target.targetUrl,
                name: target.name
            });
        }

        // A/B TESTING LOGIC: Weighted Random
        const totalWeight = splits.reduce((sum, s) => sum + s.weight, 0);
        if (totalWeight === 0) return res.json({ useSplit: false });

        const random = Math.random() * totalWeight;
        let cumulative = 0;

        for (const split of splits) {
            cumulative += split.weight;
            if (random <= cumulative) {
                return res.json({
                    useSplit: true,
                    splitId: split.id,
                    targetUrl: split.targetUrl,
                    name: split.name
                });
            }
        }

        // Fallback
        res.json({
            useSplit: true,
            splitId: splits[0].id,
            targetUrl: splits[0].targetUrl,
            name: splits[0].name
        });
    } catch (error) {
        console.error('Error getting redirect split:', error);
        res.status(500).json({ error: 'Failed to get redirect destination' });
    }
});

// Get split statistics for a URL
router.get('/url/:urlId/stats', async (req, res) => {
    try {
        const splits = await prisma.splitDestination.findMany({
            where: { urlId: req.params.urlId }
        });

        const totalClicks = splits.reduce((sum, s) => sum + s.clicks, 0);
        const stats = splits.map(split => ({
            id: split.id,
            name: split.name,
            targetUrl: split.targetUrl,
            weight: split.weight,
            clicks: split.clicks,
            percentage: totalClicks > 0 ? ((split.clicks / totalClicks) * 100).toFixed(1) : 0,
            isActive: split.isActive
        }));

        res.json({ totalClicks, splits: stats });
    } catch (error) {
        console.error('Error fetching split stats:', error);
        res.status(500).json({ error: 'Failed to fetch split statistics' });
    }
});

module.exports = router;
