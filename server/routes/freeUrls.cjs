const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');

const router = Router();

// Create a free short URL (no auth required)
router.post('/', async (req, res) => {
    try {
        const { originalUrl, clause, shortCode } = req.body;

        if (!originalUrl || !shortCode) {
            return res.status(400).json({ error: 'originalUrl and shortCode are required' });
        }

        // Check if clause already exists
        if (clause) {
            const existingClause = await prisma.freeService.findUnique({ where: { clause } });
            if (existingClause) {
                return res.status(409).json({ error: 'This custom clause is already in use' });
            }
        }

        // Check if shortCode already exists
        const existingShortCode = await prisma.freeService.findUnique({ where: { shortCode } });
        if (existingShortCode) {
            return res.status(409).json({ error: 'Short code collision, please try again' });
        }

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const freeService = await prisma.freeService.create({
            data: {
                originalUrl,
                shortCode,
                clause: clause || null,
                expiresAt,
            }
        });

        res.status(201).json(freeService);
    } catch (error) {
        console.error('Create free URL error:', error);
        res.status(500).json({ error: 'Failed to create short URL' });
    }
});

// Redirect lookup - get original URL by identifier (clause or shortCode)
router.get('/lookup/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;

        // Try to find by clause first
        let freeService = await prisma.freeService.findUnique({
            where: { clause: identifier }
        });

        // If not found by clause, try shortCode
        if (!freeService) {
            freeService = await prisma.freeService.findUnique({
                where: { shortCode: identifier }
            });
        }

        if (!freeService) {
            return res.status(404).json({ error: 'URL not found' });
        }

        // Check if expired
        if (freeService.expiresAt && new Date(freeService.expiresAt) < new Date()) {
            return res.status(410).json({ error: 'URL has expired' });
        }

        res.json({ originalUrl: freeService.originalUrl });
    } catch (error) {
        console.error('Lookup error:', error);
        res.status(500).json({ error: 'Failed to lookup URL' });
    }
});

module.exports = router;
