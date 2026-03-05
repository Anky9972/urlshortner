/**
 * Community Discussion Board API
 * ─────────────────────────────────────
 * GET    /api/community            – list posts (paginated, filterable)
 * GET    /api/community/:id        – single post with replies
 * POST   /api/community            – create post   (auth required)
 * POST   /api/community/:id/reply  – add reply     (auth required)
 * POST   /api/community/:id/like   – toggle like   (auth required)
 * PATCH  /api/community/:id/resolve – mark resolved (author or admin)
 * DELETE /api/community/:id        – delete post   (author or admin)
 * DELETE /api/community/reply/:id  – delete reply  (author or admin)
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma.cjs');
const authMiddleware = require('../middleware/auth.cjs');

// ──────────── helpers ────────────
const CATEGORIES = ['general', 'help', 'feature', 'showcase', 'bug'];
const PAGE_SIZE = 20;

// ──────────── LIST POSTS ────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, sort = 'latest', page = 1 } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * PAGE_SIZE;

    const where = {};
    if (category && CATEGORIES.includes(category)) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy;
    switch (sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'popular': orderBy = { likes: { _count: 'desc' } }; break;
      default: orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        orderBy,
        skip,
        take: PAGE_SIZE,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, isVerified: true, isAdmin: true } },
          _count: { select: { replies: true, likes: true } },
        },
      }),
      prisma.communityPost.count({ where }),
    ]);

    res.json({ posts, total, page: Number(page), pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (err) {
    console.error('Community list error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ──────────── SINGLE POST + REPLIES ────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, isVerified: true, isAdmin: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, isVerified: true, isAdmin: true } },
          },
        },
        likes: { select: { userId: true } },
        _count: { select: { replies: true, likes: true } },
      },
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Community get error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ──────────── CREATE POST ────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, category = 'general' } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({ error: 'Title must be under 200 characters' });
    }
    if (content.trim().length > 10000) {
      return res.status(400).json({ error: 'Content must be under 10,000 characters' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }

    const post = await prisma.communityPost.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, isVerified: true, isAdmin: true } },
        _count: { select: { replies: true, likes: true } },
      },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error('Community create error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ──────────── ADD REPLY ────────────
router.post('/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Reply content is required' });
    if (content.trim().length > 5000) return res.status(400).json({ error: 'Reply must be under 5,000 characters' });

    const postExists = await prisma.communityPost.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!postExists) return res.status(404).json({ error: 'Post not found' });

    const reply = await prisma.communityReply.create({
      data: {
        content: content.trim(),
        postId: req.params.id,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, isVerified: true, isAdmin: true } },
      },
    });

    res.status(201).json(reply);
  } catch (err) {
    console.error('Community reply error:', err);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// ──────────── TOGGLE LIKE ────────────
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId: req.params.id, userId: req.user.id } },
    });

    if (existing) {
      await prisma.communityLike.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    }

    await prisma.communityLike.create({
      data: { postId: req.params.id, userId: req.user.id },
    });
    res.json({ liked: true });
  } catch (err) {
    // Handle case where post doesn't exist
    if (err.code === 'P2003') return res.status(404).json({ error: 'Post not found' });
    console.error('Community like error:', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// ──────────── MARK RESOLVED ────────────
router.patch('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({ where: { id: req.params.id }, select: { userId: true } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Only author or admin can resolve
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { isAdmin: true } });
    if (post.userId !== req.user.id && !user?.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: { isResolved: !req.body.isResolved ? true : false },
    });

    res.json(updated);
  } catch (err) {
    console.error('Community resolve error:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// ──────────── DELETE POST ────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({ where: { id: req.params.id }, select: { userId: true } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { isAdmin: true } });
    if (post.userId !== req.user.id && !user?.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.communityPost.delete({ where: { id: req.params.id } });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Community delete error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ──────────── DELETE REPLY ────────────
router.delete('/reply/:id', authMiddleware, async (req, res) => {
  try {
    const reply = await prisma.communityReply.findUnique({ where: { id: req.params.id }, select: { userId: true } });
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { isAdmin: true } });
    if (reply.userId !== req.user.id && !user?.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.communityReply.delete({ where: { id: req.params.id } });
    res.json({ message: 'Reply deleted' });
  } catch (err) {
    console.error('Community reply delete error:', err);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

module.exports = router;
