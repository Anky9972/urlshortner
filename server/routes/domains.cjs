const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

// List domains
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const domains = await prisma.customDomain.findMany({
            where: { userId }
        });
        res.json(domains);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch domains' });
    }
});

// Add domain
router.post('/', async (req, res) => {
    try {
        const { domain } = req.body;
        const userId = req.user.userId;

        // Simple regex valid
        if (!domain || !domain.includes('.')) return res.status(400).json({ error: 'Invalid domain' });

        const newDomain = await prisma.customDomain.create({
            data: {
                domain,
                userId,
                // Assign to team if specified in header? For now user-bound
            }
        });

        res.status(201).json(newDomain);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Domain already registered' });
        }
        res.status(500).json({ error: 'Failed to add domain' });
    }
});

// Verify domain via DNS TXT record lookup
router.post('/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const domainRecord = await prisma.customDomain.findUnique({ where: { id } });

        if (!domainRecord) return res.status(404).json({ error: 'Domain not found' });

        // Check that the user owns this domain
        if (domainRecord.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Real DNS TXT record verification
        const dns = require('dns').promises;
        let verified = false;
        try {
            const records = await dns.resolveTxt(`_trimlink.${domainRecord.domain}`);
            // Check if any TXT record contains our verification code
            verified = records.some(recordSet =>
                recordSet.some(txt => txt.includes(domainRecord.verificationCode))
            );
        } catch (dnsError) {
            // DNS lookup failed — record doesn't exist yet
            return res.status(400).json({
                error: 'DNS TXT record not found',
                instructions: `Add a TXT record for _trimlink.${domainRecord.domain} with value: ${domainRecord.verificationCode}`
            });
        }

        if (verified) {
            const updated = await prisma.customDomain.update({
                where: { id },
                data: { verified: true }
            });
            return res.json({ success: true, domain: updated });
        } else {
            return res.status(400).json({
                error: 'Verification code not found in DNS TXT record',
                instructions: `Add a TXT record for _trimlink.${domainRecord.domain} with value: ${domainRecord.verificationCode}`
            });
        }

    } catch (error) {
        console.error('Domain verification failed:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

module.exports = router;
