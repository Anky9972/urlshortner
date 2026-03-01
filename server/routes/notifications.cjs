const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

const router = Router();

// Get notifications for current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: req.user.userId
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Create notification
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { type, title, message, data } = req.body;

        const notification = await prisma.notification.create({
            data: {
                userId: req.user.userId,
                type,
                title,
                message,
                data: data || null,
            }
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: {
                id: req.params.id,
                userId: req.user.userId
            },
            data: { isRead: true }
        });
        res.json(notification);
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all as read
router.patch('/read-all', authMiddleware, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.userId },
            data: { isRead: true }
        });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.notification.delete({
            where: {
                id: req.params.id,
                userId: req.user.userId
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

module.exports = router;
