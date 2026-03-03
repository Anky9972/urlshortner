'use strict';

const { Resend } = require('resend');

// Lazy instantiation — avoids crashing on startup if env var is not set yet
let _resend = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY is not set — emails will not be sent.');
    return null;
  }
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL || 'TrimLink <noreply@trimlynk.com>';
const APP_URL = (process.env.FRONTEND_URL || 'https://trimlynk.com').split(',')[0].trim();

// ─────────────────────────────────────────────────────────────────────────────
// Shared base layout — works in Gmail, Outlook, Apple Mail, mobile clients
// ─────────────────────────────────────────────────────────────────────────────
function baseTemplate({ previewText, headerIcon, title, subtitle, bodyHtml, footerNote }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#080b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preview text (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;">${previewText}&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#080b12;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Email card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#0d1117;border-radius:16px;border:1px solid #1e2a3a;overflow:hidden;">

          <!-- Top gradient bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#1d4ed8,#3b82f6,#6366f1);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 28px;border-bottom:1px solid #1e2a3a;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:#1e40af;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-size:20px;font-weight:800;line-height:40px;">&nbsp;T&nbsp;</span>
                        </td>
                        <td style="padding-left:10px;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Trim<span style="color:#60a5fa;">Link</span></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="background:#1e2d45;color:#60a5fa;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;border:1px solid #1e3a5f;letter-spacing:0.3px;">trimlynk.com</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Icon circle -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#1e2d45;border:1px solid #1e3a5f;border-radius:14px;width:56px;height:56px;text-align:center;vertical-align:middle;">
                    <span style="font-size:26px;line-height:56px;">${headerIcon}</span>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h1 style="margin:0 0 10px;color:#f0f6fc;font-size:24px;font-weight:700;letter-spacing:-0.5px;line-height:1.2;">${title}</h1>
              <p style="margin:0 0 28px;color:#8b949e;font-size:15px;line-height:1.6;">${subtitle}</p>

              <!-- Dynamic body content -->
              ${bodyHtml}

              <!-- Fallback note -->
              ${footerNote ? `<p style="margin:28px 0 0;color:#6e7681;font-size:13px;line-height:1.6;">${footerNote}</p>` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #161b22;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;color:#484f58;font-size:12px;line-height:1.6;">
                      © ${new Date().getFullYear()} TrimLink &nbsp;·&nbsp;
                      <a href="${APP_URL}/privacy" style="color:#484f58;text-decoration:underline;">Privacy</a>
                      &nbsp;·&nbsp;
                      <a href="${APP_URL}/terms" style="color:#484f58;text-decoration:underline;">Terms</a>
                      &nbsp;·&nbsp;
                      <a href="${APP_URL}" style="color:#484f58;text-decoration:underline;">trimlynk.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Primary CTA button
function ctaButton(href, label) {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr>
      <td style="background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:10px;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.1px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

// Fallback link block
function fallbackLink(href) {
  return `
  <p style="margin:16px 0 0;color:#6e7681;font-size:12px;line-height:1.6;">
    Button not working?
    <a href="${href}" style="color:#60a5fa;text-decoration:underline;word-break:break-all;">${href}</a>
  </p>`;
}

// Info box (e.g. expiry warning)
function infoBox(text, color = '#1e3a5f') {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:#0f1e2e;border:1px solid ${color};border-radius:10px;padding:14px 18px;">
        <p style="margin:0;color:#8b949e;font-size:13px;line-height:1.6;">${text}</p>
      </td>
    </tr>
  </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Email: Verify Email
// ─────────────────────────────────────────────────────────────────────────────
async function sendVerificationEmail(to, token) {
  const resend = getResend();
  if (!resend) return;
  const link = `${APP_URL}/verify-email?token=${token}`;

  const bodyHtml = `
    ${infoBox('⏱️ This link expires in <strong style="color:#f0f6fc;">24 hours</strong>. Please verify your email before it expires.')}
    ${ctaButton(link, '✓ &nbsp;Verify Email Address')}
    ${fallbackLink(link)}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;border-top:1px solid #1e2a3a;">
      <tr>
        <td style="padding-top:24px;">
          <p style="margin:0 0 12px;color:#6e7681;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">What you unlock</p>
          <table cellpadding="0" cellspacing="0" border="0">
            ${['Unlimited link shortening & custom aliases', 'Real-time click analytics & geolocation data', 'QR code generator & LinkTree builder', 'Teams, folders & API access'].map(f => `
            <tr>
              <td style="padding:4px 0;">
                <table cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="color:#22c55e;font-size:13px;padding-right:8px;">✓</td>
                  <td style="color:#8b949e;font-size:13px;">${f}</td>
                </tr></table>
              </td>
            </tr>`).join('')}
          </table>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: '✉️ Verify your TrimLink email address',
    html: baseTemplate({
      previewText: 'One click and you\'re all set — verify your TrimLink email address.',
      headerIcon: '✉️',
      title: 'Confirm your email address',
      subtitle: 'Thanks for signing up! Click the button below to verify your email and activate your TrimLink account.',
      bodyHtml,
      footerNote: 'If you didn\'t create a TrimLink account, you can safely ignore this email.',
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Email: Password Reset
// ─────────────────────────────────────────────────────────────────────────────
async function sendPasswordResetEmail(to, token) {
  const resend = getResend();
  if (!resend) return;
  const link = `${APP_URL}/reset-password?token=${token}`;

  const bodyHtml = `
    ${infoBox('⏱️ This link is valid for <strong style="color:#f0f6fc;">1 hour</strong>. After that, you\'ll need to request a new reset link.', '#3a1e1e')}
    ${ctaButton(link, '🔑 &nbsp;Reset My Password')}
    ${fallbackLink(link)}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
      <tr>
        <td style="background:#0d1a0d;border:1px solid #1e3a1e;border-radius:10px;padding:14px 18px;">
          <p style="margin:0;color:#6e7681;font-size:13px;line-height:1.6;">
            🛡️ <strong style="color:#8b949e;">Security tip:</strong> TrimLink will never ask for your password via email. If you didn't request this reset, your account is safe — just ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: '🔑 Reset your TrimLink password',
    html: baseTemplate({
      previewText: 'Password reset requested — click to set a new password for your TrimLink account.',
      headerIcon: '🔐',
      title: 'Reset your password',
      subtitle: 'We received a request to reset the password for your TrimLink account. Click the button below to choose a new password.',
      bodyHtml,
      footerNote: 'If you didn\'t request a password reset, no action is needed. Your account is secure.',
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Email: Link Expiry Notification
// ─────────────────────────────────────────────────────────────────────────────
async function sendExpiryNotificationEmail(to, { shortCode, originalUrl, expiresAt, dashboardUrl }) {
  const resend = getResend();
  if (!resend) return;
  const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const shortUrl = `${APP_URL}/${shortCode}`;

  const bodyHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#0f1e2e;border:1px solid #1e3a5f;border-radius:10px;padding:16px 18px;">
          <p style="margin:0 0 6px;color:#6e7681;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Short Link</p>
          <p style="margin:0 0 12px;color:#60a5fa;font-size:15px;font-weight:600;">${shortUrl}</p>
          <p style="margin:0 0 6px;color:#6e7681;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Original URL</p>
          <p style="margin:0 0 12px;color:#8b949e;font-size:13px;word-break:break-all;">${originalUrl}</p>
          <p style="margin:0 0 6px;color:#6e7681;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Expires On</p>
          <p style="margin:0;color:#f59e0b;font-size:14px;font-weight:600;">${expiryDate}</p>
        </td>
      </tr>
    </table>
    ${ctaButton(dashboardUrl || `${APP_URL}/dashboard`, '⚙️ &nbsp;Manage This Link')}
    ${fallbackLink(dashboardUrl || `${APP_URL}/dashboard`)}
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Your link ${shortCode} is expiring soon`,
    html: baseTemplate({
      previewText: `Your TrimLink short link "${shortCode}" is about to expire — take action now.`,
      headerIcon: '⏰',
      title: 'Your link is expiring soon',
      subtitle: `One of your short links is about to expire. Visit your dashboard to extend or update it before it stops working.`,
      bodyHtml,
      footerNote: 'You received this email because you have expiry notifications enabled in your TrimLink account. You can manage your notification preferences in Settings.',
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Email: Welcome (post-verification)
// ─────────────────────────────────────────────────────────────────────────────
async function sendWelcomeEmail(to, name) {
  const resend = getResend();
  if (!resend) return;

  const bodyHtml = `
    <p style="margin:0 0 24px;color:#8b949e;font-size:15px;line-height:1.7;">
      Welcome to TrimLink, <strong style="color:#f0f6fc;">${name || 'there'}</strong>! 🎉 Your email is verified and your account is ready. Here's what you can do right now:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      ${[
        ['🔗', 'Shorten any URL', 'Create short, branded links with custom aliases and track every click.'],
        ['📊', 'View Analytics', 'See click counts, top countries, devices, and referrers in real time.'],
        ['🎨', 'Build a LinkTree', 'Create a beautiful bio page with all your important links.'],
        ['📷', 'Generate QR Codes', 'Create custom, branded QR codes for offline sharing.'],
      ].map(([icon, feat, desc]) => `
      <tr>
        <td style="padding:0 0 14px 0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="width:44px;vertical-align:top;padding-top:2px;">
                <span style="display:inline-block;width:36px;height:36px;background:#1e2d45;border-radius:9px;text-align:center;line-height:36px;font-size:18px;">${icon}</span>
              </td>
              <td style="vertical-align:top;padding-left:12px;">
                <p style="margin:0 0 2px;color:#f0f6fc;font-size:14px;font-weight:600;">${feat}</p>
                <p style="margin:0;color:#6e7681;font-size:13px;line-height:1.5;">${desc}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('')}
    </table>
    ${ctaButton(`${APP_URL}/dashboard`, '🚀 &nbsp;Go to Dashboard')}
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: '🎉 Welcome to TrimLink — you\'re all set!',
    html: baseTemplate({
      previewText: 'Your TrimLink account is verified and ready to use. Let\'s create your first short link!',
      headerIcon: '🎉',
      title: `Welcome to TrimLink!`,
      subtitle: 'Your account is verified and ready to go. Start creating short links, QR codes, and bio pages in seconds.',
      bodyHtml,
      footerNote: null,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic email sender — for custom notifications
// ─────────────────────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({ from: FROM, to, subject, html });
}

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendExpiryNotificationEmail,
  sendWelcomeEmail,
  sendEmail,
};
