/**
 * Link Expiry Notifier
 * Runs every 6 hours to email users about links expiring within 24 hours.
 */

const prisma = require('./prisma.cjs');
const { sendEmail } = require('./email.cjs');

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
            const urlList = urls.map(u => {
                const expires = u.expiresAt || u.deactivatesAt;
                return `• <strong>${u.title || u.shortUrl}</strong> — expires ${new Date(expires).toLocaleString()}`;
            }).join('<br/>');

            await sendEmail({
                to: user.email,
                subject: `⏰ ${urls.length} link${urls.length > 1 ? 's' : ''} expiring soon — TrimLink`,
                html: `
                    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#0f1117;color:#e2e8f0;border-radius:12px;">
                        <h2 style="color:#60a5fa;margin-top:0">Links Expiring Soon</h2>
                        <p>Hi ${user.name || 'there'},</p>
                        <p>The following link${urls.length > 1 ? 's are' : ' is'} expiring within 24 hours:</p>
                        <div style="background:#1e2433;padding:16px;border-radius:8px;margin:16px 0;">${urlList}</div>
                        <p>Log in to <a href="${(process.env.FRONTEND_URL || 'https://trimlynk.com').split(',')[0].trim()}" style="color:#60a5fa">TrimLink</a> to update or extend your links.</p>
                    </div>
                `
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
