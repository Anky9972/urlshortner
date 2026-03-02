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
const APP_URL = process.env.FRONTEND_URL || 'https://trimlynk.com';

/**
 * Send a password-reset email with a one-click link.
 */
async function sendPasswordResetEmail(to, token) {
  const resend = getResend();
  if (!resend) return;
  const link = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your TrimLink password',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0d1117;color:#e6edf3;border-radius:12px">
        <div style="margin-bottom:24px">
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0">Reset your password</h1>
          <p style="margin:8px 0 0;color:#8b949e;font-size:14px">Click the button below within 1 hour to set a new password for your TrimLink account.</p>
        </div>
        <a href="${link}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;font-weight:600;font-size:15px;text-decoration:none;border-radius:8px">
          Reset Password
        </a>
        <p style="margin-top:24px;color:#8b949e;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        <p style="margin-top:8px;color:#8b949e;font-size:12px;word-break:break-all">Or copy this link: ${link}</p>
      </div>
    `,
  });
}

/**
 * Send an email-verification link to a new user.
 */
async function sendVerificationEmail(to, token) {
  const resend = getResend();
  if (!resend) return;
  const link = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Verify your TrimLink email address',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0d1117;color:#e6edf3;border-radius:12px">
        <div style="margin-bottom:24px">
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0">Confirm your email</h1>
          <p style="margin:8px 0 0;color:#8b949e;font-size:14px">One click and you're all set! Verify your email address for TrimLink.</p>
        </div>
        <a href="${link}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;font-weight:600;font-size:15px;text-decoration:none;border-radius:8px">
          Verify Email
        </a>
        <p style="margin-top:24px;color:#8b949e;font-size:13px">If you didn't create a TrimLink account, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail };
