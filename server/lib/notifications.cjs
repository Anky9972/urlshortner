'use strict';

const prisma = require('./prisma.cjs');
const { sendEmail } = require('./email.cjs');

const APP_URL = (process.env.FRONTEND_URL || 'https://trimlynk.com').split(',')[0].trim();

// ─────────────────────────────────────────────────────────────────────────────
// Create an in-app notification
// ─────────────────────────────────────────────────────────────────────────────
async function createNotification({ userId, type, title, message, data = null }) {
    try {
        return await prisma.notification.create({
            data: { userId, type, title, message, data }
        });
    } catch (err) {
        console.error('[notifications] Failed to create notification:', err.message);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Notify multiple users at once (skips a given excludeUserId)
// ─────────────────────────────────────────────────────────────────────────────
async function notifyMany({ userIds, excludeUserId, type, title, message, data = null }) {
    const targets = userIds.filter(id => id !== excludeUserId);
    if (!targets.length) return;
    try {
        await prisma.notification.createMany({
            data: targets.map(userId => ({ userId, type, title, message, data }))
        });
    } catch (err) {
        console.error('[notifications] Failed to create bulk notifications:', err.message);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email templates for team events
// ─────────────────────────────────────────────────────────────────────────────

function teamEmailHtml({ headerIcon, title, subtitle, bodyLines, ctaLabel, ctaHref }) {
    const bodyContent = bodyLines.map(l =>
        `<p style="margin:0 0 8px;color:#8b949e;font-size:14px;line-height:1.6;">${l}</p>`
    ).join('');

    const ctaBtn = ctaLabel ? `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
      <tr>
        <td style="background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:10px;">
          <a href="${ctaHref}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${ctaLabel}</a>
        </td>
      </tr>
    </table>` : '';

    // Minimal inline template — same dark aesthetic as other emails
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#080b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#080b12;"><tr><td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#0d1117;border-radius:16px;border:1px solid #1e2a3a;overflow:hidden;">
  <tr><td style="background:linear-gradient(90deg,#1d4ed8,#3b82f6,#6366f1);height:3px;font-size:0;">&nbsp;</td></tr>
  <tr><td style="padding:36px 40px 20px;border-bottom:1px solid #1e2a3a;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background:#1e40af;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;"><span style="color:#fff;font-size:20px;font-weight:800;line-height:40px;">&nbsp;T&nbsp;</span></td>
      <td style="padding-left:10px;vertical-align:middle;"><span style="color:#fff;font-size:18px;font-weight:700;">Trim<span style="color:#60a5fa;">Link</span></span></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;"><tr>
      <td style="background:#1e2d45;border:1px solid #1e3a5f;border-radius:14px;width:50px;height:50px;text-align:center;vertical-align:middle;"><span style="font-size:24px;line-height:50px;">${headerIcon}</span></td>
    </tr></table>
    <h1 style="margin:0 0 10px;color:#f0f6fc;font-size:22px;font-weight:700;">${title}</h1>
    <p style="margin:0 0 20px;color:#8b949e;font-size:15px;line-height:1.6;">${subtitle}</p>
    ${bodyContent}
    ${ctaBtn}
  </td></tr>
  <tr><td style="padding:16px 40px 24px;border-top:1px solid #161b22;">
    <p style="margin:0;color:#484f58;font-size:12px;">&copy; ${new Date().getFullYear()} TrimLink &middot; <a href="${APP_URL}" style="color:#484f58;text-decoration:underline;">trimlynk.com</a></p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

// ── Team-specific email senders ──────────────────────────────────────────────

async function sendTeamAddedEmail(to, { teamName, role, inviterName }) {
    await sendEmail({
        to,
        subject: `👥 You've been added to "${teamName}" on TrimLink`,
        html: teamEmailHtml({
            headerIcon: '👥',
            title: `You joined ${teamName}`,
            subtitle: `${inviterName} added you as a <strong style="color:#60a5fa;">${role}</strong> to the team.`,
            bodyLines: [
                'You can now collaborate on links, folders, and LinkTrees with your team.',
            ],
            ctaLabel: '🚀  View Team',
            ctaHref: `${APP_URL}/teams`,
        }),
    });
}

async function sendTeamRemovedEmail(to, { teamName, removerName }) {
    await sendEmail({
        to,
        subject: `You were removed from "${teamName}" on TrimLink`,
        html: teamEmailHtml({
            headerIcon: '👤',
            title: `Removed from ${teamName}`,
            subtitle: `${removerName} removed you from the team "${teamName}".`,
            bodyLines: [
                'You no longer have access to the team\'s links and resources.',
                'If you believe this was a mistake, contact the team owner.',
            ],
            ctaLabel: '📋  View Your Teams',
            ctaHref: `${APP_URL}/teams`,
        }),
    });
}

async function sendTeamRoleChangedEmail(to, { teamName, newRole, changerName }) {
    await sendEmail({
        to,
        subject: `Your role changed in "${teamName}"`,
        html: teamEmailHtml({
            headerIcon: '🔄',
            title: `Role updated in ${teamName}`,
            subtitle: `${changerName} changed your role to <strong style="color:#60a5fa;">${newRole}</strong>.`,
            bodyLines: [
                'Your permissions have been updated accordingly.',
            ],
            ctaLabel: '👀  View Team',
            ctaHref: `${APP_URL}/teams`,
        }),
    });
}

async function sendOwnershipTransferEmail(to, { teamName, previousOwnerName }) {
    await sendEmail({
        to,
        subject: `🎉 You are now the owner of "${teamName}"`,
        html: teamEmailHtml({
            headerIcon: '👑',
            title: `Ownership transferred to you`,
            subtitle: `${previousOwnerName} transferred ownership of "<strong style="color:#f0f6fc;">${teamName}</strong>" to you.`,
            bodyLines: [
                'As the new owner, you have full control over the team\'s settings, members, and resources.',
            ],
            ctaLabel: '⚙️  Manage Team',
            ctaHref: `${APP_URL}/teams`,
        }),
    });
}

async function sendTeamDeletedEmail(to, { teamName, ownerName }) {
    await sendEmail({
        to,
        subject: `Team "${teamName}" has been deleted`,
        html: teamEmailHtml({
            headerIcon: '🗑️',
            title: `${teamName} was deleted`,
            subtitle: `${ownerName} deleted the team "${teamName}".`,
            bodyLines: [
                'All team links and resources have been unlinked. Your personal links are not affected.',
            ],
            ctaLabel: null,
            ctaHref: null,
        }),
    });
}

module.exports = {
    createNotification,
    notifyMany,
    sendTeamAddedEmail,
    sendTeamRemovedEmail,
    sendTeamRoleChangedEmail,
    sendOwnershipTransferEmail,
    sendTeamDeletedEmail,
};
