'use strict';
/**
 * Admin API Routes — /api/admin
 * All routes require a valid JWT + isAdmin = true.
 * Fixed: N+1 chart queries, teams DELETE, user suspend/unsuspend,
 *        force-verify email, domains tab, audit log, broadcast, CSV export.
 */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

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
      totalApiKeys,
      totalPixels,
      totalDomains,
      suspendedUsers,
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
      prisma.apiKey.count(),
      prisma.retargetingPixel.count(),
      prisma.customDomain.count(),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true, email: true, name: true,
          createdAt: true, isAdmin: true, emailVerified: true, isSuspended: true,
        },
      }),
    ]);

    // Fixed N+1: use single SQL query per chart via $queryRaw
    const [clicksChart, usersChart] = await Promise.all([
      clicksPerDayRaw(14),
      usersPerDayRaw(14),
    ]);

    res.json({
      stats: {
        totalUsers, usersToday,
        totalUrls, urlsToday, activeUrls,
        totalClicks, clicksToday,
        totalLinktrees, totalRooms, totalTeams,
        totalApiKeys, totalPixels, totalDomains,
        suspendedUsers,
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
    const allowedSorts = ['createdAt', 'email', 'name'];
    const safeSort = allowedSorts.includes(sort) ? sort : 'createdAt';
    const safeOrder = order === 'asc' ? 'asc' : 'desc';
    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] }
      : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [safeSort]: safeOrder },
        select: {
          id: true, email: true, name: true, avatarUrl: true,
          createdAt: true, emailVerified: true, isAdmin: true, isSuspended: true,
          twoFactorEnabled: true,
          _count: { select: { urls: true } },
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
        createdAt: true, updatedAt: true, emailVerified: true,
        isAdmin: true, isSuspended: true, twoFactorEnabled: true,
        urls: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true, title: true, shortUrl: true, originalUrl: true,
            currentClicks: true, createdAt: true, isActive: true,
          },
        },
        _count: { select: { urls: true, apiKeys: true } },
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
    const { isAdmin, emailVerified, name, isSuspended } = req.body;
    // Prevent self-demotion or self-suspension
    if (req.params.id === req.user.userId && (isAdmin === false || isSuspended === true)) {
      return res.status(400).json({ error: 'You cannot demote or suspend yourself' });
    }
    const data = {};
    if (isAdmin !== undefined) data.isAdmin = isAdmin;
    if (emailVerified !== undefined) data.emailVerified = emailVerified;
    if (name !== undefined) data.name = name;
    if (isSuspended !== undefined) data.isSuspended = isSuspended;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true, email: true, name: true,
        isAdmin: true, emailVerified: true, isSuspended: true,
      },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
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
    const allowedSorts = ['createdAt', 'currentClicks', 'title'];
    const safeSort = allowedSorts.includes(sort) ? sort : 'createdAt';
    const safeOrder = order === 'asc' ? 'asc' : 'desc';
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
        orderBy: { [safeSort]: safeOrder },
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
    const where = search
      ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }] }
      : {};
    const [linktrees, total] = await Promise.all([
      prisma.linkTree.findMany({
        where, skip, take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, slug: true, isPublic: true, createdAt: true,
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { links: true } },
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
        where, skip, take: Number(limit),
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

// Teams now support DELETE
router.delete('/teams/:id', async (req, res) => {
  try {
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ message: 'Team deleted' });
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
        where, skip, take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, slug: true, isPublic: true, createdAt: true,
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
// DOMAINS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/domains', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search ? { domain: { contains: search, mode: 'insensitive' } } : {};
    const [domains, total] = await Promise.all([
      prisma.customDomain.findMany({
        where, skip, take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, domain: true, verified: true, isActive: true, createdAt: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.customDomain.count({ where }),
    ]);
    res.json({ domains, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/domains/:id', async (req, res) => {
  try {
    await prisma.customDomain.delete({ where: { id: req.params.id } });
    res.json({ message: 'Domain deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS (system-wide admin view)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, action: true, entityType: true, entityId: true,
          details: true, ipAddress: true, createdAt: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.auditLog.count(),
    ]);
    res.json({ logs, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// BROADCAST NOTIFICATION (send to all users)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, type = 'admin_broadcast' } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message are required' });

    const users = await prisma.user.findMany({ select: { id: true } });

    const BATCH = 200;
    let created = 0;
    for (let i = 0; i < users.length; i += BATCH) {
      const batch = users.slice(i, i + BATCH);
      const result = await prisma.notification.createMany({
        data: batch.map(u => ({ userId: u.id, type, title, message })),
      });
      created += result.count;
    }
    res.json({ message: `Notification sent to ${created} users` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CSV EXPORT
// ─────────────────────────────────────────────────────────────────────────────
router.get('/export/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true,
        emailVerified: true, isAdmin: true, isSuspended: true, createdAt: true,
        _count: { select: { urls: true } },
      },
    });
    const header = 'id,email,name,emailVerified,isAdmin,isSuspended,urls,createdAt';
    const rows = users.map(u =>
      [u.id, csvEscape(u.email), csvEscape(u.name || ''),
       u.emailVerified, u.isAdmin, u.isSuspended,
       u._count.urls, u.createdAt.toISOString()].join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send([header, ...rows].join('\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/urls', async (req, res) => {
  try {
    const urls = await prisma.url.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, shortUrl: true, originalUrl: true,
        currentClicks: true, isActive: true, createdAt: true, expiresAt: true,
        user: { select: { email: true } },
      },
    });
    const header = 'id,title,shortUrl,originalUrl,clicks,isActive,owner,createdAt,expiresAt';
    const rows = urls.map(u =>
      [u.id, csvEscape(u.title), u.shortUrl, csvEscape(u.originalUrl),
       u.currentClicks, u.isActive, csvEscape(u.user?.email || ''),
       u.createdAt.toISOString(), u.expiresAt ? u.expiresAt.toISOString() : ''].join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="urls.csv"');
    res.send([header, ...rows].join('\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function startOf(unit) {
  const d = new Date();
  if (unit === 'day') d.setHours(0, 0, 0, 0);
  return d;
}

/** Single SQL query replaces 14 sequential Prisma calls (N+1 fix) */
async function clicksPerDayRaw(days) {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  const rows = await prisma.$queryRaw`
    SELECT DATE_TRUNC('day', "createdAt") AS date, COUNT(*)::int AS count
    FROM "Click"
    WHERE "createdAt" >= ${from}
    GROUP BY 1 ORDER BY 1
  `;
  return fillDateGaps(rows, days);
}

async function usersPerDayRaw(days) {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  const rows = await prisma.$queryRaw`
    SELECT DATE_TRUNC('day', "createdAt") AS date, COUNT(*)::int AS count
    FROM "User"
    WHERE "createdAt" >= ${from}
    GROUP BY 1 ORDER BY 1
  `;
  return fillDateGaps(rows, days);
}

function fillDateGaps(rows, days) {
  const map = {};
  for (const row of rows) {
    const key = new Date(row.date).toISOString().slice(0, 10);
    map[key] = Number(row.count);
  }
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map[key] || 0 });
  }
  return result;
}

function csvEscape(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

module.exports = router;
