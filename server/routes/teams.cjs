const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');
const { logAudit } = require('../lib/auditLogger.cjs');

const router = Router();

// Middleware to check if user is authentication
router.use(authMiddleware);

// Get all teams for the current user (owned or member)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find teams where user is owner
        const owned = await prisma.team.findMany({
            where: { ownerId: userId },
            include: { _count: { select: { members: true, urls: true } } }
        });

        // Find teams where user is member
        const memberships = await prisma.teamMember.findMany({
            where: { userId },
            include: {
                team: {
                    include: { _count: { select: { members: true, urls: true } } }
                }
            }
        });

        res.json({
            owned,
            member: memberships.map(m => ({ ...m.team, role: m.role, joinedAt: m.joinedAt }))
        });
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Create a new team
router.post('/', async (req, res) => {
    try {
        const { name, slug } = req.body;
        const userId = req.user.userId;

        if (!name || !slug) return res.status(400).json({ error: 'Name and slug required' });

        const existing = await prisma.team.findUnique({ where: { slug } });
        if (existing) return res.status(409).json({ error: 'Team slug already taken' });

        const team = await prisma.team.create({
            data: {
                name,
                slug,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: 'owner'
                    }
                }
            }
        });

        await logAudit({
            action: 'create_team',
            entityId: team.id,
            entityType: 'Team',
            userId,
            teamId: team.id,
            details: { name, slug },
            req
        });

        res.status(201).json(team);
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ error: 'Failed to create team' });
    }
});

// Add member to team
router.post('/:teamId/members', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email, role = 'member' } = req.body;
        const userId = req.user.userId;

        // Verify requester is admin/owner
        const requester = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId } }
        });

        if (!requester || !['owner', 'admin'].includes(requester.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Find user to add
        const userToAdd = await prisma.user.findUnique({ where: { email } });
        if (!userToAdd) return res.status(404).json({ error: 'User not found' });

        // Add
        const member = await prisma.teamMember.create({
            data: {
                teamId,
                userId: userToAdd.id,
                role
            }
        });

        await logAudit({
            action: 'add_team_member',
            entityId: userToAdd.id,
            entityType: 'User',
            userId,
            teamId,
            details: { email, role },
            req
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

module.exports = router;
