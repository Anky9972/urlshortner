/**
 * Link Expiry Notifier
 * Runs every 6 hours to email users about links expiring within 24 hours.
 */

const prisma = require('./prisma.cjs');
const { sendEmail } = require('./email.cjs');
const APP_URL = (process.env.FRONTEND_URL || 'https://trimlynk.com').split(',')[0].trim();

const NOTIFY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;  // 6 hours

// Track which links we've already notified (in-memory; server restart resets)
const notifiedLinks = new Set();

async function checkExpiringLinks() {
    try {
        const now = new Date();
        const in24h = new Date(now.getTime() + NOTIFY_WINDOW_MS);

        // Find URLs expiring in the next 24h that haven't already expired
        const expiringUrls = await prisma.url.findMany({
            where: {
                isActive: true,
                expiresAt: { gte: now, lte: in24h }
            },
            include: {
                user: { select: { email: true, name: true } }
            }
        });

        const deactivatingUrls = await prisma.url.findMany({
            where: {
                isActive: true,
                deactivatesAt: { gte: now, lte: in24h }
            },
            include: {
                user: { select: { email: true, name: true } }
            }
        });

        const allExpiring = [...expiringUrls, ...deactivatingUrls];
        const toNotify = allExpiring.filter(url => !notifiedLinks.has(url.id));

        if (toNotify.length === 0) return;

        // Group by user email
        const byUser = {};
        for (const url of toNotify) {
            const email = url.user.email;
            if (!byUser[email]) byUser[email] = { user: url.user, urls: [] };
            byUser[email].urls.push(url);
        }

        for (const { user, urls } of Object.values(byUser)) {
            const linkRows = urls.map(u => {
                const expires = u.expiresAt || u.deactivatesAt;
                const expDate = new Date(expires).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const shortUrl = `${APP_URL}/${u.shortUrl || u.id}`;
                return `
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #1e2a3a;">
                    <p style="margin:0 0 3px;color:#f0f6fc;font-size:14px;font-weight:600;">${u.title || u.shortUrl || u.id}</p>
                    <p style="margin:0 0 3px;color:#60a5fa;font-size:13px;">${shortUrl}</p>
                    <p style="margin:0;color:#f59e0b;font-size:12px;">⏰ Expires: ${expDate}</p>
                  </td>
                </tr>`;
            }).join('');

            const year = new Date().getFullYear();
            const emailHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#080b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#080b12;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#0d1117;border-radius:16px;border:1px solid #1e2a3a;overflow:hidden;">
        <tr><td style="background:linear-gradient(90deg,#b45309,#d97706,#f59e0b);height:3px;font-size:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:36px 40px 28px;border-bottom:1px solid #1e2a3a;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td>
                <table cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="background:#1e40af;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:20px;font-weight:800;line-height:40px;">&nbsp;T&nbsp;</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Trim<span style="color:#60a5fa;">Link</span></span>
                  </td>
                </tr></table>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="background:#2a1e00;color:#f59e0b;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;border:1px solid #3a2e00;">⚠️ Expiry Alert</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#2a1e00;border:1px solid #3a2e00;border-radius:14px;width:56px;height:56px;text-align:center;vertical-align:middle;">
                  <span style="font-size:26px;line-height:56px;">⏰</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:0 0 10px;color:#f0f6fc;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
              ${urls.length} link${urls.length > 1 ? 's' : ''} expiring soon
            </h1>
            <p style="margin:0 0 28px;color:#8b949e;font-size:15px;line-height:1.6;">
              Hi ${user.name || 'there'}, the following link${urls.length > 1 ? 's are' : ' is'} expiring within 24 hours. Visit your dashboard to extend or update ${urls.length > 1 ? 'them' : 'it'} before ${urls.length > 1 ? 'they stop' : 'it stops'} working.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;background:#0f1e2e;border:1px solid #1e3a5f;border-radius:10px;overflow:hidden;">
              ${linkRows}
            </table>
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
              <tr>
                <td style="background:linear-gradient(135deg,#d97706,#f59e0b);border-radius:10px;">
                  <a href="${APP_URL}/dashboard" target="_blank" style="display:inline-block;padding:14px 36px;color:#000;font-size:15px;font-weight:700;text-decoration:none;">⚙️ &nbsp;Manage My Links</a>
                </td>
              </tr>
            </table>
            <p style="margin:0;color:#6e7681;font-size:12px;">
              Button not working? <a href="${APP_URL}/dashboard" style="color:#60a5fa;text-decoration:underline;">${APP_URL}/dashboard</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #161b22;">
            <p style="margin:0;color:#484f58;font-size:12px;line-height:1.6;">
              © ${year} TrimLink &nbsp;·&nbsp;
              <a href="${APP_URL}/privacy" style="color:#484f58;text-decoration:underline;">Privacy</a>
              &nbsp;·&nbsp;
              <a href="${APP_URL}/terms" style="color:#484f58;text-decoration:underline;">Terms</a>
              &nbsp;·&nbsp; You received this because expiry notifications are enabled for your account.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

            await sendEmail({
                to: user.email,
                subject: `⏰ ${urls.length} link${urls.length > 1 ? 's' : ''} expiring soon — TrimLink`,
                html: emailHtml,
            }).catch(err => console.warn('Expiry email failed:', err.message));

            // Mark as notified
            urls.forEach(u => notifiedLinks.add(u.id));
        }

        if (toNotify.length > 0) {
            console.log(`[ExpiryNotifier] Notified ${Object.keys(byUser).length} user(s) about ${toNotify.length} expiring link(s)`);
        }
    } catch (err) {
        console.error('[ExpiryNotifier] Error:', err.message);
    }
}

function startExpiryNotifier() {
    // Run immediately, then every 6 hours
    checkExpiringLinks();
    setInterval(checkExpiringLinks, CHECK_INTERVAL_MS);
    console.log('[ExpiryNotifier] Started — checking every 6 hours');
}

module.exports = { startExpiryNotifier };
