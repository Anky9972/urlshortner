'use strict';
const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

// Alias
const requireAuth = authMiddleware;

// Generate a random short code
function generateCode(len = 7) {
  return Math.random().toString(36).slice(2, 2 + len);
}

// GET all dynamic QRs for current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await prisma.dynamicQr.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create a new dynamic QR
router.post('/', requireAuth, async (req, res) => {
  const { targetUrl, title } = req.body;
  if (!targetUrl) return res.status(400).json({ error: 'targetUrl is required' });
  try {
    let shortCode;
    let exists = true;
    while (exists) {
      shortCode = generateCode();
      exists = await prisma.dynamicQr.findUnique({ where: { shortCode } });
    }
    const item = await prisma.dynamicQr.create({
      data: { shortCode, targetUrl, title: title || null, userId: req.user.id },
    });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update target URL or title
router.put('/:id', requireAuth, async (req, res) => {
  const { targetUrl, title } = req.body;
  try {
    const item = await prisma.dynamicQr.findUnique({ where: { id: req.params.id } });
    if (!item || item.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.dynamicQr.update({
      where: { id: req.params.id },
      data: { ...(targetUrl && { targetUrl }), ...(title !== undefined && { title }) },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE a dynamic QR
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const item = await prisma.dynamicQr.findUnique({ where: { id: req.params.id } });
    if (!item || item.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    await prisma.dynamicQr.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public redirect: GET /qr/:shortCode — tracks scan and redirects
router.get('/redirect/:shortCode', async (req, res) => {
  try {
    const item = await prisma.dynamicQr.findUnique({ where: { shortCode: req.params.shortCode } });
    if (!item) return res.status(404).send('QR code not found');
    await prisma.dynamicQr.update({ where: { id: item.id }, data: { scans: item.scans + 1 } });
    res.redirect(item.targetUrl);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
