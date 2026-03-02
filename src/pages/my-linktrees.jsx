import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ExternalLink, Pencil, Trash2, TreePine, Eye, Loader2 } from 'lucide-react';
import { getMyLinkTrees, deleteLinkTree } from '@/api/linktrees';
import { toast } from 'sonner';
import { SEOMetadata } from '@/components/seo-metadata';
import RequireAuth from '@/components/require-auth';

function MyLinkTrees() {
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      const data = await getMyLinkTrees();
      setTrees(data || []);
    } catch {
      toast.error('Failed to load your link trees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteLinkTree(id);
      setTrees(prev => prev.filter(t => t.id !== id));
      toast.success('Link tree deleted');
    } catch {
      toast.error('Failed to delete link tree');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <SEOMetadata title="My Link Trees | TrimLink" description="Manage all your TrimLink link trees." />

      <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/10 border border-blue-500/20 flex items-center justify-center">
                <TreePine className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">My Link Trees</h1>
                <p className="text-slate-500 text-sm">{trees.length} tree{trees.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/linktree?create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> New Tree
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 mx-auto animate-spin" />
            </div>
          ) : trees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[hsl(230,10%,18%)] p-12 text-center space-y-4">
              <TreePine className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-medium">You don't have any link trees yet</p>
              <button
                onClick={() => navigate('/linktree?create')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" /> Create your first tree
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {trees.map((tree) => (
                <div
                  key={tree.id}
                  className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4 flex items-center gap-4"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/15 to-violet-600/10 border border-blue-500/10 flex items-center justify-center shrink-0">
                    <TreePine className="w-5 h-5 text-blue-400" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm truncate">{tree.title || 'Untitled'}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{tree.viewCount || 0} views</span>
                      <span>{tree.links?.length || 0} links</span>
                      {tree.isPublic === false && <span className="text-amber-400">Private</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`/view/${tree.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[hsl(230,10%,14%)] transition-colors"
                      title="View public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => navigate(`/edit/${tree.id}`)}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-600/10 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tree.id, tree.title)}
                      disabled={deleting === tree.id}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === tree.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default function MyLinkTreesPage() {
  return (
    <RequireAuth>
      <MyLinkTrees />
    </RequireAuth>
  );
}
