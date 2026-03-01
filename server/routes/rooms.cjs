const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware, optionalAuth } = require('../middleware/auth.cjs');

const router = Router();

// ==============================
// PUBLIC ROUTES
// ==============================

// Get public room by slug
router.get('/public/:slug', async (req, res) => {
    try {
        const room = await prisma.room.findUnique({
            where: { slug: req.params.slug },
            include: {
                owner: { select: { id: true, name: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                },
                sharedUrls: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!room) return res.status(404).json({ error: 'Room not found' });
        if (!room.isPublic) return res.status(404).json({ error: 'Room not found' });

        res.json(room);
    } catch (error) {
        console.error('Error fetching public room:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});

// ==============================
// AUTHENTICATED ROUTES
// ==============================

router.use(authMiddleware);

// Get all rooms owned by user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const rooms = await prisma.room.findMany({
            where: { ownerId: userId },
            include: {
                _count: { select: { members: true, sharedUrls: true } },
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                    take: 5
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Get rooms user is a member of (joined rooms)
router.get('/joined', async (req, res) => {
    try {
        const userId = req.user.userId;
        const memberships = await prisma.roomMember.findMany({
            where: { userId },
            include: {
                room: {
                    include: {
                        owner: { select: { id: true, name: true, avatarUrl: true } },
                        _count: { select: { members: true, sharedUrls: true } }
                    }
                }
            }
        });
        res.json(memberships.map(m => ({ ...m.room, role: m.role, joinedAt: m.joinedAt })));
    } catch (error) {
        console.error('Error fetching joined rooms:', error);
        res.status(500).json({ error: 'Failed to fetch joined rooms' });
    }
});

// Get room by slug (authenticated - includes private rooms)
router.get('/slug/:slug', async (req, res) => {
    try {
        const userId = req.user.userId;
        const room = await prisma.room.findUnique({
            where: { slug: req.params.slug },
            include: {
                owner: { select: { id: true, name: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                },
                sharedUrls: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!room) return res.status(404).json({ error: 'Room not found' });

        // Check access: owner, member, or public
        const isMember = room.members.some(m => m.userId === userId);
        const isOwner = room.ownerId === userId;
        if (!room.isPublic && !isMember && !isOwner) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});

// Get room by ID
router.get('/:id', async (req, res) => {
    try {
        const room = await prisma.room.findUnique({
            where: { id: req.params.id },
            include: {
                owner: { select: { id: true, name: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                },
                sharedUrls: { orderBy: { createdAt: 'desc' } }
            }
        });
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const userId = req.user.userId;
        const isMember = room.members.some(m => m.userId === userId);
        const isOwner = room.ownerId === userId;
        if (!room.isPublic && !isMember && !isOwner) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});

// Create room
router.post('/', async (req, res) => {
    try {
        const { name, slug, description, isPublic } = req.body;
        const userId = req.user.userId;

        if (!name || !slug) {
            return res.status(400).json({ error: 'name and slug are required' });
        }

        // Check slug
        const existing = await prisma.room.findUnique({ where: { slug } });
        if (existing) return res.status(400).json({ error: 'Slug already taken' });

        const room = await prisma.room.create({
            data: {
                name,
                slug,
                description,
                isPublic: isPublic || false,
                ownerId: userId,
                members: {
                    create: { userId, role: 'admin' }
                }
            },
            include: {
                owner: { select: { id: true, name: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                },
                _count: { select: { sharedUrls: true } }
            }
        });

        res.status(201).json(room);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Update room
router.patch('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const existing = await prisma.room.findFirst({
            where: { id: req.params.id, ownerId: userId }
        });
        if (!existing) return res.status(404).json({ error: 'Room not found or not authorized' });

        const { name, description, isPublic } = req.body;
        const room = await prisma.room.update({
            where: { id: req.params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(isPublic !== undefined && { isPublic }),
            },
            include: {
                owner: { select: { id: true, name: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                },
                sharedUrls: { orderBy: { createdAt: 'desc' } }
            }
        });

        res.json(room);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Failed to update room' });
    }
});

// Delete room
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const existing = await prisma.room.findFirst({
            where: { id: req.params.id, ownerId: userId }
        });
        if (!existing) return res.status(404).json({ error: 'Room not found or not authorized' });

        await prisma.room.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

// ==============================
// MEMBERS MANAGEMENT
// ==============================

// Invite / add member by email
router.post('/:id/members', async (req, res) => {
    try {
        const userId = req.user.userId;
        const room = await prisma.room.findFirst({
            where: { id: req.params.id, ownerId: userId }
        });
        if (!room) return res.status(404).json({ error: 'Room not found or not authorized' });

        const { email, role } = req.body;
        if (!email) return res.status(400).json({ error: 'email is required' });

        const targetUser = await prisma.user.findUnique({ where: { email } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Check if already a member
        const existingMember = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId: req.params.id, userId: targetUser.id } }
        });
        if (existingMember) return res.status(400).json({ error: 'User is already a member' });

        const member = await prisma.roomMember.create({
            data: {
                roomId: req.params.id,
                userId: targetUser.id,
                role: role || 'member'
            },
            include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } }
        });

        // Create notification for the invited user
        await prisma.notification.create({
            data: {
                userId: targetUser.id,
                type: 'room_invite',
                title: 'Room Invitation',
                message: `You've been invited to join room "${room.name}"`,
                data: { roomId: room.id, roomSlug: room.slug, invitedBy: userId }
            }
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

// Remove member
router.delete('/:id/members/:memberId', async (req, res) => {
    try {
        const userId = req.user.userId;
        const room = await prisma.room.findFirst({
            where: { id: req.params.id, ownerId: userId }
        });
        if (!room) return res.status(404).json({ error: 'Room not found or not authorized' });

        await prisma.roomMember.delete({ where: { id: req.params.memberId } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

// Leave room (self-remove)
router.post('/:id/leave', async (req, res) => {
    try {
        const userId = req.user.userId;
        const membership = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId: req.params.id, userId } }
        });
        if (!membership) return res.status(404).json({ error: 'Not a member of this room' });

        await prisma.roomMember.delete({
            where: { roomId_userId: { roomId: req.params.id, userId } }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error leaving room:', error);
        res.status(500).json({ error: 'Failed to leave room' });
    }
});

// ==============================
// SHARED URLs
// ==============================

// Add a URL to a room
router.post('/:id/urls', async (req, res) => {
    try {
        const userId = req.user.userId;
        // Check membership
        const room = await prisma.room.findUnique({ where: { id: req.params.id } });
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const isMember = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId: req.params.id, userId } }
        });
        const isOwner = room.ownerId === userId;
        if (!isMember && !isOwner) return res.status(403).json({ error: 'Access denied' });

        const { title, url, shortUrl } = req.body;
        if (!title || !url) return res.status(400).json({ error: 'title and url are required' });

        const roomUrl = await prisma.roomUrl.create({
            data: {
                roomId: req.params.id,
                title,
                url,
                shortUrl,
                addedBy: userId
            }
        });
        res.status(201).json(roomUrl);
    } catch (error) {
        console.error('Error adding URL to room:', error);
        res.status(500).json({ error: 'Failed to add URL' });
    }
});

// Remove a URL from a room
router.delete('/:id/urls/:urlId', async (req, res) => {
    try {
        const userId = req.user.userId;
        const room = await prisma.room.findUnique({ where: { id: req.params.id } });
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const isOwner = room.ownerId === userId;
        const roomUrl = await prisma.roomUrl.findUnique({ where: { id: req.params.urlId } });
        if (!roomUrl) return res.status(404).json({ error: 'URL not found' });

        // Only owner or the person who added it can remove
        if (!isOwner && roomUrl.addedBy !== userId) {
            return res.status(403).json({ error: 'Not authorized to remove this URL' });
        }

        await prisma.roomUrl.delete({ where: { id: req.params.urlId } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing URL from room:', error);
        res.status(500).json({ error: 'Failed to remove URL' });
    }
});

module.exports = router;
