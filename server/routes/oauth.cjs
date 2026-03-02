'use strict';
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middleware/auth.cjs');

const FRONTEND_URL = process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:5173';

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function issueToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function successRedirect(res, token) {
  res.redirect(`${FRONTEND_URL}/oauth-callback?token=${encodeURIComponent(token)}`);
}

function errorRedirect(res, message) {
  res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(message)}`);
}

async function findOrCreateOAuthUser({ email, name, avatarUrl, provider }) {
  if (!email) throw new Error('OAuth provider did not return an email address');

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Create new account — password is a random hash they can reset later
    const randomHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash: randomHash,
        avatarUrl: avatarUrl || null,
        emailVerified: true, // OAuth emails are pre-verified
      },
    });
  }
  return user;
}

// -----------------------------------------------------------------------
// GOOGLE OAuth
// -----------------------------------------------------------------------

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return errorRedirect(res, 'Google OAuth not configured');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.API_URL || 'http://localhost:3001'}/api/oauth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return errorRedirect(res, error || 'Google OAuth cancelled');

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${apiUrl}/api/oauth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Failed to get access token');

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    const user = await findOrCreateOAuthUser({
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      provider: 'google',
    });

    successRedirect(res, issueToken(user));
  } catch (e) {
    console.error('Google OAuth error:', e);
    errorRedirect(res, e.message || 'Google sign-in failed');
  }
});

// -----------------------------------------------------------------------
// GITHUB OAuth
// -----------------------------------------------------------------------

router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return errorRedirect(res, 'GitHub OAuth not configured');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.API_URL || 'http://localhost:3001'}/api/oauth/github/callback`,
    scope: 'user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/github/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return errorRedirect(res, error || 'GitHub OAuth cancelled');

  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: clientId, client_secret: clientSecret, code,
        redirect_uri: `${apiUrl}/api/oauth/github/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Failed to get GitHub access token');

    // Get user profile
    const [userRes, emailRes] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'TrimLink' },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'TrimLink' },
      }),
    ]);
    const ghUser = await userRes.json();
    const emails = await emailRes.json();
    const primaryEmail = (Array.isArray(emails) ? emails.find(e => e.primary)?.email : null)
      || ghUser.email;

    if (!primaryEmail) throw new Error('No email returned from GitHub. Please make sure your GitHub email is public or accessible.');

    const user = await findOrCreateOAuthUser({
      email: primaryEmail,
      name: ghUser.name || ghUser.login,
      avatarUrl: ghUser.avatar_url,
      provider: 'github',
    });

    successRedirect(res, issueToken(user));
  } catch (e) {
    console.error('GitHub OAuth error:', e);
    errorRedirect(res, e.message || 'GitHub sign-in failed');
  }
});

module.exports = router;
