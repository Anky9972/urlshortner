const { Router } = require('express');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

// GET /api/2fa/status — return current 2FA status for logged-in user
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { twoFactorEnabled: true }
        });
        res.json({ enabled: user?.twoFactorEnabled || false });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch 2FA status' });
    }
});

// POST /api/2fa/setup — generate a new TOTP secret and return QR code data URL
router.post('/setup', authMiddleware, async (req, res) => {
    try {
        const secret = authenticator.generateSecret();

        // Store temp secret (not yet confirmed)
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { twoFactorTempSecret: secret }
        });

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { email: true }
        });

        const otpauth = authenticator.keyuri(user.email, 'TrimLink', secret);
        const qrDataUrl = await QRCode.toDataURL(otpauth);

        res.json({ secret, qrDataUrl, otpauth });
    } catch (err) {
        console.error('2FA setup error:', err);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
});

// POST /api/2fa/verify — verify the first TOTP token to confirm and enable 2FA
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { twoFactorTempSecret: true }
        });

        if (!user?.twoFactorTempSecret) {
            return res.status(400).json({ error: 'Run /setup first' });
        }

        const isValid = authenticator.verify({ token, secret: user.twoFactorTempSecret });
        if (!isValid) return res.status(400).json({ error: 'Invalid code' });

        await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                twoFactorEnabled: true,
                twoFactorSecret: user.twoFactorTempSecret,
                twoFactorTempSecret: null
            }
        });

        res.json({ message: '2FA enabled successfully' });
    } catch (err) {
        console.error('2FA verify error:', err);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// POST /api/2fa/disable — disable 2FA (requires valid TOTP token)
router.post('/disable', authMiddleware, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { twoFactorSecret: true, twoFactorEnabled: true }
        });

        if (!user?.twoFactorEnabled) {
            return res.status(400).json({ error: '2FA is not enabled' });
        }

        const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
        if (!isValid) return res.status(400).json({ error: 'Invalid code' });

        await prisma.user.update({
            where: { id: req.user.userId },
            data: { twoFactorEnabled: false, twoFactorSecret: null }
        });

        res.json({ message: '2FA disabled' });
    } catch (err) {
        console.error('2FA disable error:', err);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

// POST /api/2fa/login — called when login returns twoFactorRequired; validates TOTP and issues JWT
router.post('/login', async (req, res) => {
    try {
        const { userId, token } = req.body;
        if (!userId || !token) return res.status(400).json({ error: 'Missing userId or token' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, name: true, avatarUrl: true,
                emailVerified: true, twoFactorSecret: true, twoFactorEnabled: true,
                createdAt: true
            }
        });

        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            return res.status(400).json({ error: 'Invalid 2FA state' });
        }

        const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
        if (!isValid) return res.status(400).json({ error: 'Invalid 2FA code' });

        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth.cjs');

        const jwtToken = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        const COOKIE_OPTIONS = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/'
        };

        res.cookie('auth_token', jwtToken, COOKIE_OPTIONS);
        const { twoFactorSecret: _, ...safeUser } = user;
        res.json({ token: jwtToken, user: safeUser });
    } catch (err) {
        console.error('2FA login error:', err);
        res.status(500).json({ error: '2FA login failed' });
    }
});

module.exports = router;
