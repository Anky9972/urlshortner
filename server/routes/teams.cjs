const { Router } = require('express');
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');
const { logAudit } = require('../lib/auditLogger.cjs');

const router = Router();

router.use(authMiddleware);

// Helper: check if user is a team member and return their membership
async function getTeamMembership(teamId, userId) {
    return prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } }
    });
}

// Get all teams for the current user (owned or member)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;

        const owned = await prisma.team.findMany({
            where: { ownerId: userId },
            include: {
                _count: { select: { members: true, urls: true, folders: true, linkTrees: true } },
                owner: { select: { id: true, name: true, email: true, profile_pic: true } }
            }
        });

        const memberships = await prisma.teamMember.findMany({
            where: { userId },
            include: {
                team: {
                    include: {
                        _count: { select: { members: true, urls: true, folders: true, linkTrees: true } },
                        owner: { select: { id: true, name: true, email: true, profile_pic: true } }
                    }
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

// Get single team detail
router.get('/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.userId;

        const membership = await getTeamMembership(teamId, userId);
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this team' });
        }

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                owner: { select: { id: true, name: true, email: true, profile_pic: true } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true, profile_pic: true } }
                    },
                    orderBy: { joinedAt: 'asc' }
                },
                _count: { select: { members: true, urls: true, folders: true, linkTrees: true } }
            }
        });

        if (!team) return res.status(404).json({ error: 'Team not found' });

        res.json({ ...team, currentUserRole: membership.role });
    } catch (error) {
        console.error('Get team detail error:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// Get team URLs
router.get('/:teamId/urls', async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.userId;

        const membership = await getTeamMembership(teamId, userId);
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this team' });
        }

        const urls = await prisma.url.findMany({
            where: { teamId },
            include: {
                _count: { select: { clicks: true } },
                user: { select: { id: true, name: true, email: true, profile_pic: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(urls);
    } catch (error) {
        console.error('Get team URLs error:', error);
        res.status(500).json({ error: 'Failed to fetch team URLs' });
    }
});

// Create a new team
router.post('/', async (req, res) => {
    try {
        const { name, slug, description } = req.body;
        const userId = req.user.userId;

        if (!name || !slug) return res.status(400).json({ error: 'Name and slug required' });

        // Validate slug format
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
        }

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
            },
            include: {
                _count: { select: { members: true, urls: true, folders: true, linkTrees: true } },
                owner: { select: { id: true, name: true, email: true, profile_pic: true } }
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

// Update team details (owner/admin only)
router.patch('/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, slug } = req.body;
        const userId = req.user.userId;

        const membership = await getTeamMembership(teamId, userId);
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // If changing slug, check uniqueness
        if (slug) {
            if (!/^[a-z0-9-]+$/.test(slug)) {
                return res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
            }
            const existing = await prisma.team.findUnique({ where: { slug } });
            if (existing && existing.id !== teamId) {
                return res.status(409).json({ error: 'Team slug already taken' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (slug) updateData.slug = slug;

        const team = await prisma.team.update({
            where: { id: teamId },
            data: updateData,
            include: {
                owner: { select: { id: true, name: true, email: true, profile_pic: true } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true, profile_pic: true } }
                    }
                },
                _count: { select: { members: true, urls: true, folders: true, linkTrees: true } }
            }
        });

        await logAudit({
            action: 'update_team',
            entityId: team.id,
            entityType: 'Team',
            userId,
            teamId: team.id,
            details: updateData,
            req
        });

        res.json(team);
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// Delete team (owner only)
router.delete('/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.userId;

        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (!team) return res.status(404).json({ error: 'Team not found' });
        if (team.ownerId !== userId) {
            return res.status(403).json({ error: 'Only the team owner can delete the team' });
        }

        await prisma.team.delete({ where: { id: teamId } });

        await logAudit({
            action: 'delete_team',
            entityId: teamId,
            entityType: 'Team',
            userId,
            details: { name: team.name, slug: team.slug },
            req
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

// Add member to team
router.post('/:teamId/members', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email, role = 'member' } = req.body;
        const userId = req.user.userId;

        const requester = await getTeamMembership(teamId, userId);
        if (!requester || !['owner', 'admin'].includes(requester.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        if (!['admin', 'member', 'viewer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Use admin, member, or viewer' });
        }

        const userToAdd = await prisma.user.findUnique({ where: { email } });
        if (!userToAdd) return res.status(404).json({ error: 'User not found with that email' });

        // Check if already a member
        const existingMember = await getTeamMembership(teamId, userToAdd.id);
        if (existingMember) {
            return res.status(409).json({ error: 'User is already a member of this team' });
        }

        const member = await prisma.teamMember.create({
            data: {
                teamId,
                userId: userToAdd.id,
                role
            },
            include: {
                user: { select: { id: true, name: true, email: true, profile_pic: true } }
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

// Update member role (owner/admin only)
router.patch('/:teamId/members/:memberId', async (req, res) => {
    try {
        const { teamId, memberId } = req.params;
        const { role } = req.body;
        const userId = req.user.userId;

        if (!['admin', 'member', 'viewer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Use admin, member, or viewer' });
        }

        const requester = await getTeamMembership(teamId, userId);
        if (!requester || !['owner', 'admin'].includes(requester.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const targetMember = await prisma.teamMember.findUnique({ where: { id: memberId } });
        if (!targetMember || targetMember.teamId !== teamId) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Can't change the owner's role
        if (targetMember.role === 'owner') {
            return res.status(400).json({ error: 'Cannot change the owner\'s role' });
        }

        // Admins can't promote to admin
        if (requester.role === 'admin' && role === 'admin') {
            return res.status(403).json({ error: 'Only the owner can promote to admin' });
        }

        const updated = await prisma.teamMember.update({
            where: { id: memberId },
            data: { role },
            include: {
                user: { select: { id: true, name: true, email: true, profile_pic: true } }
            }
        });

        await logAudit({
            action: 'update_team_member_role',
            entityId: targetMember.userId,
            entityType: 'User',
            userId,
            teamId,
            details: { memberId, oldRole: targetMember.role, newRole: role },
            req
        });

        res.json(updated);
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ error: 'Failed to update member role' });
    }
});

// Remove member from team (owner/admin only)
router.delete('/:teamId/members/:memberId', async (req, res) => {
    try {
        const { teamId, memberId } = req.params;
        const userId = req.user.userId;

        const requester = await getTeamMembership(teamId, userId);
        if (!requester || !['owner', 'admin'].includes(requester.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const targetMember = await prisma.teamMember.findUnique({ where: { id: memberId } });
        if (!targetMember || targetMember.teamId !== teamId) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Can't remove the owner
        if (targetMember.role === 'owner') {
            return res.status(400).json({ error: 'Cannot remove the team owner' });
        }

        // Admins can't remove other admins
        if (requester.role === 'admin' && targetMember.role === 'admin') {
            return res.status(403).json({ error: 'Only the owner can remove admins' });
        }

        await prisma.teamMember.delete({ where: { id: memberId } });

        await logAudit({
            action: 'remove_team_member',
            entityId: targetMember.userId,
            entityType: 'User',
            userId,
            teamId,
            details: { memberId, role: targetMember.role },
            req
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

// Leave team (any member except owner)
router.post('/:teamId/leave', async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.userId;

        const membership = await getTeamMembership(teamId, userId);
        if (!membership) {
            return res.status(404).json({ error: 'Not a member of this team' });
        }

        if (membership.role === 'owner') {
            return res.status(400).json({ error: 'Owner cannot leave. Transfer ownership or delete the team instead.' });
        }

        await prisma.teamMember.delete({ where: { id: membership.id } });

        await logAudit({
            action: 'leave_team',
            entityId: userId,
            entityType: 'User',
            userId,
            teamId,
            details: { role: membership.role },
            req
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Leave team error:', error);
        res.status(500).json({ error: 'Failed to leave team' });
    }
});

// Transfer ownership (owner only)
router.post('/:teamId/transfer', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { newOwnerId } = req.body;
        const userId = req.user.userId;

        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (!team) return res.status(404).json({ error: 'Team not found' });
        if (team.ownerId !== userId) {
            return res.status(403).json({ error: 'Only the owner can transfer ownership' });
        }

        const newOwnerMembership = await getTeamMembership(teamId, newOwnerId);
        if (!newOwnerMembership) {
            return res.status(404).json({ error: 'Target user is not a member of this team' });
        }

        // Update team owner, update member roles
        await prisma.$transaction([
            prisma.team.update({ where: { id: teamId }, data: { ownerId: newOwnerId } }),
            prisma.teamMember.update({ where: { id: newOwnerMembership.id }, data: { role: 'owner' } }),
            prisma.teamMember.update({
                where: { teamId_userId: { teamId, userId } },
                data: { role: 'admin' }
            })
        ]);

        await logAudit({
            action: 'transfer_team_ownership',
            entityId: teamId,
            entityType: 'Team',
            userId,
            teamId,
            details: { previousOwner: userId, newOwner: newOwnerId },
            req
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Transfer ownership error:', error);
        res.status(500).json({ error: 'Failed to transfer ownership' });
    }
});

module.exports = router;
