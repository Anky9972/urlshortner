const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth.cjs');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../lib/email.cjs');

const router = Router();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/'
};

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create verification token
        const emailVerifyToken = crypto.randomBytes(32).toString('hex');

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name: name || null,
                emailVerifyToken,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                emailVerified: true,
                createdAt: true
            }
        });

        // Send verification email (non-blocking)
        sendVerificationEmail(email, emailVerifyToken).catch((err) => {
            console.error('Failed to send verification email:', err.message);
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Set HTTP-only cookie
        res.cookie('auth_token', token, COOKIE_OPTIONS);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // If 2FA is enabled, return a challenge instead of the full JWT
        if (user.twoFactorEnabled) {
            return res.json({ twoFactorRequired: true, userId: user.id });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Set HTTP-only cookie
        res.cookie('auth_token', token, COOKIE_OPTIONS);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                emailVerified: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token', { path: '/' });
    res.json({ message: 'Logged out successfully' });
});

// Update profile
router.patch('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, avatarUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: { name, avatarUrl },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true
            }
        });

        res.json({ user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { passwordHash }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// =============================================
// FORGOT PASSWORD — generates reset link
// =============================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await prisma.user.findUnique({ where: { email } });
        // Always respond with 200 so we don't leak whether email exists
        if (!user) return res.json({ message: 'If that email is registered you will receive a reset link.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { email },
            data: { passwordResetToken: token, passwordResetExpiry: expiry }
        });

        await sendPasswordResetEmail(email, token);

        res.json({ message: 'If that email is registered you will receive a reset link.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// =============================================
// RESET PASSWORD — validates token, sets new pw
// =============================================
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpiry: { gt: new Date() }
            }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null }
        });

        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// =============================================
// VERIFY EMAIL — marks email as verified
// =============================================
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
        if (!user) return res.status(400).json({ error: 'Invalid or already-used verification token' });

        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, emailVerifyToken: null }
        });

        res.json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});

// =============================================
// RESEND VERIFICATION EMAIL
// =============================================
router.post('/resend-verification', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.emailVerified) return res.status(400).json({ error: 'Email is already verified' });

        const emailVerifyToken = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken } });
        await sendVerificationEmail(user.email, emailVerifyToken);

        res.json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification email' });
    }
});

module.exports = router;
