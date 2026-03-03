'use strict';
/**
 * Admin API Routes — /api/admin
 * All routes require a valid JWT + isAdmin = true.
 */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');
const authMiddleware = require('../middleware/auth.cjs');

// ─── Require Admin middleware ───────────────────────────────────────────────
const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

router.use(authMiddleware, requireAdmin);

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      usersToday,
      totalUrls,
      urlsToday,
      totalClicks,
      clicksToday,
      activeUrls,
      totalLinktrees,
      totalRooms,
      totalTeams,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOf('day') } } }),
      prisma.url.count(),
      prisma.url.count({ where: { createdAt: { gte: startOf('day') } } }),
      prisma.click.count(),
      prisma.click.count({ where: { createdAt: { gte: startOf('day') } } }),
      prisma.url.count({ where: { isActive: true } }),
      prisma.linkTree.count(),
      prisma.room.count(),
      prisma.team.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, email: true, name: true, createdAt: true, isAdmin: true, emailVerified: true },
      }),
    ]);

    // Clicks per day for last 14 days
    const clicksChart = await clicksPerDay(14);

    // Users joined per day for last 14 days
    const usersChart = await usersPerDay(14);

    res.json({
      stats: {
        totalUsers, usersToday,
        totalUrls, urlsToday, activeUrls,
        totalClicks, clicksToday,
        totalLinktrees, totalRooms, totalTeams,
      },
      recentUsers,
      clicksChart,
      usersChart,
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] }
      : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sort]: order },
        select: {
          id: true, email: true, name: true, avatarUrl: true,
          createdAt: true, emailVerified: true, isAdmin: true,
          twoFactorEnabled: true,
          _count: { select: { urls: true, clicks: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, avatarUrl: true,
        createdAt: true, updatedAt: true, emailVerified: true, isAdmin: true,
        twoFactorEnabled: true,
        urls: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, title: true, shortUrl: true, originalUrl: true, currentClicks: true, createdAt: true, isActive: true },
        },
        _count: { select: { urls: true, clicks: true, apiKeys: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { isAdmin, emailVerified, name } = req.body;
    const data = {};
    if (isAdmin !== undefined) data.isAdmin = isAdmin;
    if (emailVerified !== undefined) data.emailVerified = emailVerified;
    if (name !== undefined) data.name = name;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, name: true, isAdmin: true, emailVerified: true },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account via admin panel' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// URLS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/urls', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { originalUrl: { contains: search, mode: 'insensitive' } },
            { shortUrl: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sort]: order },
        select: {
          id: true, title: true, shortUrl: true, originalUrl: true,
          currentClicks: true, isActive: true, createdAt: true, expiresAt: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.url.count({ where }),
    ]);
    res.json({ urls, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/urls/:id', async (req, res) => {
  try {
    const { isActive } = req.body;
    const url = await prisma.url.update({
      where: { id: req.params.id },
      data: { isActive },
      select: { id: true, isActive: true, shortUrl: true },
    });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/urls/:id', async (req, res) => {
  try {
    await prisma.url.delete({ where: { id: req.params.id } });
    res.json({ message: 'URL deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LINK TREES
// ─────────────────────────────────────────────────────────────────────────────
router.get('/linktrees', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }] } : {};
    const [linktrees, total] = await Promise.all([
      prisma.linkTree.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, slug: true, isPublished: true, createdAt: true,
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.linkTree.count({ where }),
    ]);
    res.json({ linktrees, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/linktrees/:id', async (req, res) => {
  try {
    await prisma.linkTree.delete({ where: { id: req.params.id } });
    res.json({ message: 'LinkTree deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TEAMS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/teams', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, createdAt: true,
          owner: { select: { id: true, email: true, name: true } },
          _count: { select: { members: true, urls: true } },
        },
      }),
      prisma.team.count({ where }),
    ]);
    res.json({ teams, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROOMS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/rooms', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, slug: true, isPrivate: true, createdAt: true,
          owner: { select: { id: true, email: true, name: true } },
          _count: { select: { members: true } },
        },
      }),
      prisma.room.count({ where }),
    ]);
    res.json({ rooms, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/rooms/:id', async (req, res) => {
  try {
    await prisma.room.delete({ where: { id: req.params.id } });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function startOf(unit) {
  const d = new Date();
  if (unit === 'day') { d.setHours(0, 0, 0, 0); }
  return d;
}

async function clicksPerDay(days) {
  const rows = [];
  for (let i = days - 1; i >= 0; i--) {
    const from = new Date(); from.setDate(from.getDate() - i); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setHours(23, 59, 59, 999);
    const count = await prisma.click.count({ where: { createdAt: { gte: from, lte: to } } });
    rows.push({ date: from.toISOString().slice(0, 10), count });
  }
  return rows;
}

async function usersPerDay(days) {
  const rows = [];
  for (let i = days - 1; i >= 0; i--) {
    const from = new Date(); from.setDate(from.getDate() - i); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setHours(23, 59, 59, 999);
    const count = await prisma.user.count({ where: { createdAt: { gte: from, lte: to } } });
    rows.push({ date: from.toISOString().slice(0, 10), count });
  }
  return rows;
}

module.exports = router;
