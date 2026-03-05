import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Heart,
  Send,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  User,
  ShieldCheck,
  BadgeCheck,
  HelpCircle,
  Lightbulb,
  Bug,
  Rocket,
  Code2,
} from 'lucide-react';
import {
  getCommunityPosts,
  getCommunityPost,
  createCommunityPost,
  addCommunityReply,
  toggleCommunityLike,
  resolveCommunityPost,
  deleteCommunityPost,
  deleteCommunityReply,
} from '@/api/community';

/* ═══════════════ CONSTANTS ═══════════════ */
const CATEGORIES = [
  { value: 'general', label: 'General', icon: MessageSquare, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  { value: 'help', label: 'Help', icon: HelpCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { value: 'showcase', label: 'Showcase', icon: Rocket, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most Popular' },
];

function getCategoryMeta(value) {
  return CATEGORIES.find((c) => c.value === value) || CATEGORIES[0];
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/* ─── Avatar ─── */
function Avatar({ user, size = 'sm' }) {
  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  if (user?.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name} className={`${sizeClasses} rounded-full object-cover`} />;
  }
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className={`${sizeClasses} rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold`}>
      {initial}
    </div>
  );
}

/* ─── Category badge ─── */
function CategoryBadge({ category, small = false }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} font-medium rounded-full ${meta.bg} ${meta.border} border ${meta.color}`}>
      <Icon className={small ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {meta.label}
    </span>
  );
}

/* ─── User name badge ─── */
function UserBadge({ user }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-sm font-medium text-white">{user?.name || 'Anonymous'}</span>
      {user?.isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-red-400" title="Admin" />}
      {user?.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400" title="Verified" />}
    </span>
  );
}

/* ═══════════════════════════════════════════════════ */
/*   CREATE POST MODAL                                */
/* ═══════════════════════════════════════════════════ */
function CreatePostModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const post = await createCommunityPost({ title: title.trim(), content: content.trim(), category });
      onCreated(post);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-[hsl(230,12%,8%)] border border-[hsl(230,10%,18%)] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(230,10%,15%)]">
          <h3 className="text-lg font-semibold text-white">New Discussion</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[hsl(230,10%,15%)] text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Category selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    category === cat.value
                      ? `${cat.bg} ${cat.border} ${cat.color}`
                      : 'bg-[hsl(230,10%,10%)] border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="What's your question or topic?"
              className="w-full px-4 py-2.5 bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
            />
            <p className="text-[10px] text-slate-600 mt-1 text-right">{title.length}/200</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              rows={6}
              placeholder="Describe your question, idea, or topic in detail..."
              className="w-full px-4 py-2.5 bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post Discussion
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*   POST DETAIL VIEW                                 */
/* ═══════════════════════════════════════════════════ */
function PostDetail({ postId, user, onBack, onDeleted }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState('');

  const fetchPost = useCallback(async () => {
    try {
      const data = await getCommunityPost(postId);
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const reply = await addCommunityReply(postId, replyText.trim());
      setPost((prev) => ({
        ...prev,
        replies: [...prev.replies, reply],
        _count: { ...prev._count, replies: prev._count.replies + 1 },
      }));
      setReplyText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setReplying(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const { liked } = await toggleCommunityLike(postId);
      setPost((prev) => ({
        ...prev,
        likes: liked
          ? [...prev.likes, { userId: user.id }]
          : prev.likes.filter((l) => l.userId !== user.id),
        _count: { ...prev._count, likes: prev._count.likes + (liked ? 1 : -1) },
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveCommunityPost(postId, post.isResolved);
      setPost((prev) => ({ ...prev, isResolved: !prev.isResolved }));
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post and all its replies?')) return;
    try {
      await deleteCommunityPost(postId);
      onDeleted();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await deleteCommunityReply(replyId);
      setPost((prev) => ({
        ...prev,
        replies: prev.replies.filter((r) => r.id !== replyId),
        _count: { ...prev._count, replies: prev._count.replies - 1 },
      }));
    } catch (err) {
      console.error('Delete reply error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-slate-400">{error || 'Post not found'}</p>
        <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 mt-3">
          Go back
        </button>
      </div>
    );
  }

  const isAuthor = user && user.id === post.user?.id;
  const isAdmin = user?.isAdmin;
  const hasLiked = user && post.likes?.some((l) => l.userId === user.id);

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to discussions
      </button>

      {/* Post */}
      <div className="bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-3">
          <Avatar user={post.user} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <UserBadge user={post.user} />
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">{timeAgo(post.createdAt)}</span>
              <CategoryBadge category={post.category} small />
              {post.isResolved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                </span>
              )}
              {post.isPinned && (
                <span className="text-[10px] font-medium text-amber-400">📌 Pinned</span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white mb-3">{post.title}</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[hsl(230,10%,13%)]">
              <button
                onClick={handleLike}
                disabled={!user}
                className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
                  hasLiked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!user ? 'Sign in to like' : hasLiked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                {post._count.likes}
              </button>

              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <MessageSquare className="w-4 h-4" />
                {post._count.replies} {post._count.replies === 1 ? 'reply' : 'replies'}
              </span>

              {(isAuthor || isAdmin) && (
                <>
                  <button
                    onClick={handleResolve}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {post.isResolved ? 'Unresolve' : 'Mark Resolved'}
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-3 mb-6">
        {post.replies?.map((reply) => {
          const isReplyAuthor = user && user.id === reply.user?.id;
          return (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[hsl(230,10%,7%)] border border-[hsl(230,10%,13%)] rounded-xl p-4 ml-4 sm:ml-8"
            >
              <div className="flex items-start gap-3">
                <Avatar user={reply.user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <UserBadge user={reply.user} />
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{timeAgo(reply.createdAt)}</span>
                    {(isReplyAuthor || isAdmin) && (
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="ml-auto text-slate-600 hover:text-red-400 transition-colors"
                        title="Delete reply"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                    {reply.content}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {post.replies?.length === 0 && (
          <p className="text-center text-sm text-slate-600 py-6">No replies yet. Be the first to respond!</p>
        )}
      </div>

      {/* Reply form */}
      {user ? (
        <form onSubmit={handleReply} className="bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl p-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            maxLength={5000}
            rows={3}
            placeholder="Write a reply..."
            className="w-full px-3 py-2 bg-[hsl(230,10%,6%)] border border-[hsl(230,10%,15%)] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={replying || !replyText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all"
            >
              {replying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Reply
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl">
          <User className="w-6 h-6 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">
            <Link to="/auth" className="text-blue-400 hover:text-blue-300">Sign in</Link> to reply
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*   POST LIST ITEM                                   */
/* ═══════════════════════════════════════════════════ */
function PostListItem({ post, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(post.id)}
      className="w-full text-left bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,15%)] rounded-xl p-4 hover:bg-[hsl(230,10%,11%)] hover:border-[hsl(230,10%,20%)] transition-all group"
    >
      <div className="flex items-start gap-3">
        <Avatar user={post.user} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <UserBadge user={post.user} />
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-500">{timeAgo(post.createdAt)}</span>
            <CategoryBadge category={post.category} small />
            {post.isResolved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
              </span>
            )}
            {post.isPinned && (
              <span className="text-[10px] font-medium text-amber-400">📌</span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
            {post.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {post.content}
          </p>

          <div className="flex items-center gap-4 mt-2.5">
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
              <Heart className="w-3 h-3" /> {post._count?.likes || 0}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
              <MessageSquare className="w-3 h-3" /> {post._count?.replies || 0}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════ */
/*   MAIN DISCUSSION BOARD                            */
/* ═══════════════════════════════════════════════════ */
export default function DiscussionBoard({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCommunityPosts({
        category: activeCategory || undefined,
        search: searchQuery || undefined,
        sort: sortBy,
        page,
      });
      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery, sortBy]);

  const handlePostCreated = (newPost) => {
    // Add to top and refetch
    fetchPosts();
  };

  const handlePostDeleted = () => {
    setSelectedPostId(null);
    fetchPosts();
  };

  /* ─── Post detail view ─── */
  if (selectedPostId) {
    return (
      <PostDetail
        postId={selectedPostId}
        user={user}
        onBack={() => setSelectedPostId(null)}
        onDeleted={handlePostDeleted}
      />
    );
  }

  /* ─── List view ─── */
  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Discussions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {total} {total === 1 ? 'topic' : 'topics'} · Ask questions, share ideas, get help
          </p>
        </div>

        {user ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Discussion
          </button>
        ) : (
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold rounded-xl hover:bg-blue-600/30 transition-all shrink-0"
          >
            <User className="w-4 h-4" />
            Sign in to Post
          </Link>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            className="w-full pl-9 pr-4 py-2 bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,16%)] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2 bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,16%)] rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500/40 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setActiveCategory('')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            !activeCategory
              ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
              : 'bg-[hsl(230,10%,10%)] border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              activeCategory === cat.value
                ? `${cat.bg} ${cat.border} ${cat.color}`
                : 'bg-[hsl(230,10%,10%)] border-[hsl(230,10%,18%)] text-slate-500 hover:text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{error}</p>
          <button onClick={fetchPosts} className="text-sm text-blue-400 hover:text-blue-300 mt-3">
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-1">No discussions yet</p>
          <p className="text-xs text-slate-600">
            {user ? 'Be the first to start a conversation!' : 'Sign in to start the first discussion.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} onClick={setSelectedPostId} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,16%)] rounded-lg hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 bg-[hsl(230,10%,9%)] border border-[hsl(230,10%,16%)] rounded-lg hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handlePostCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
