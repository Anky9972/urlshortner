const prisma = require('../lib/prisma.cjs');

/**
 * Creates an audit log entry.
 * @param {Object} params
 * @param {string} params.action - Action name (e.g. 'update_link')
 * @param {string} params.entityId - ID of the entity
 * @param {string} params.entityType - 'Url', 'Team', 'User'
 * @param {string} [params.userId] - User performing the action
 * @param {string} [params.teamId] - Team context
 * @param {Object} [params.details] - JSON details of change
 * @param {Object} [params.req] - Express request object (for IP/UserAgent)
 */
const logAudit = async ({ action, entityId, entityType, userId, teamId, details, req }) => {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                entityId,
                entityType,
                userId: userId || null,
                teamId: teamId || null,
                details: details || {},
                ipAddress: req?.ip || null,
                userAgent: req?.headers['user-agent'] || null
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw, just log error so main flow continues
    }
};

module.exports = { logAudit };
