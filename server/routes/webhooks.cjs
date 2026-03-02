const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

router.use(authMiddleware);

const generateWebhookSecret = () => 'whsec_' + crypto.randomBytes(24).toString('hex');

const createSignature = (secret, timestamp, payload) => {
    return crypto.createHmac('sha256', secret).update(`${timestamp}.${JSON.stringify(payload)}`).digest('hex');
};

// Get all webhooks for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;

        const webhooks = await prisma.webhook.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
        const maskedWebhooks = webhooks.map(w => ({ ...w, secretMasked: '••••••••' + w.secret.slice(-8), secret: undefined }));
        res.json(maskedWebhooks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
});

// Create webhook
router.post('/', async (req, res) => {
    try {
        const { name, url, events } = req.body;
        const userId = req.user.userId;
        if (!name || !url) return res.status(400).json({ error: 'name and url are required' });

        const secret = generateWebhookSecret();
        const webhook = await prisma.webhook.create({ data: { name, url, secret, events: events || ['click'], userId } });

        res.status(201).json({ ...webhook, secretFull: secret, secretMasked: '••••••••' + secret.slice(-8) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create webhook' });
    }
});

// Update webhook
router.patch('/:id', async (req, res) => {
    try {
        const webhook = await prisma.webhook.update({ where: { id: req.params.id }, data: req.body });
        res.json(webhook);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update webhook' });
    }
});

// Toggle webhook
router.patch('/:id/toggle', async (req, res) => {
    try {
        const webhook = await prisma.webhook.update({ where: { id: req.params.id }, data: { isActive: req.body.isActive } });
        res.json(webhook);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle webhook' });
    }
});

// Delete webhook
router.delete('/:id', async (req, res) => {
    try {
        await prisma.webhook.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete webhook' });
    }
});

// Trigger webhooks for an event
router.post('/trigger', async (req, res) => {
    try {
        const { userId, event, payload } = req.body;
        if (!userId || !event || !payload) return res.status(400).json({ error: 'userId, event, and payload are required' });

        const webhooks = await prisma.webhook.findMany({ where: { userId, isActive: true, events: { has: event } } });

        const results = await Promise.allSettled(
            webhooks.map(async (webhook) => {
                const timestamp = Date.now();
                const signature = createSignature(webhook.secret, timestamp, payload);

                try {
                    const response = await fetch(webhook.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-TrimLink-Signature': signature, 'X-TrimLink-Timestamp': timestamp.toString(), 'X-TrimLink-Event': event },
                        body: JSON.stringify(payload)
                    });

                    await prisma.webhook.update({ where: { id: webhook.id }, data: { lastTriggeredAt: new Date(), failureCount: response.ok ? 0 : { increment: 1 } } });
                    return { webhookId: webhook.id, status: response.status, success: response.ok };
                } catch (error) {
                    await prisma.webhook.update({ where: { id: webhook.id }, data: { failureCount: { increment: 1 } } });
                    return { webhookId: webhook.id, error: error.message, success: false };
                }
            })
        );

        res.json({ triggered: webhooks.length, results });
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger webhooks' });
    }
});

// Test webhook
router.post('/:id/test', async (req, res) => {
    try {
        const webhook = await prisma.webhook.findUnique({ where: { id: req.params.id } });
        if (!webhook) return res.status(404).json({ error: 'Webhook not found' });

        const timestamp = Date.now();
        const testPayload = { event: 'test', timestamp: new Date().toISOString(), data: { message: 'Test webhook from TrimLink' } };
        const signature = createSignature(webhook.secret, timestamp, testPayload);

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-TrimLink-Signature': signature, 'X-TrimLink-Timestamp': timestamp.toString(), 'X-TrimLink-Event': 'test' },
                body: JSON.stringify(testPayload)
            });
            res.json({ success: response.ok, status: response.status, statusText: response.statusText });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to test webhook' });
    }
});

module.exports = router;
