import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authLinktree } from "../../api/linktrees";
import Preview from "./preview";
import { Loader2, Link2, Lock, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SharedLinkTree = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'schedule' | 'notfound' | null
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState(null);
  const [treeId, setTreeId] = useState(null);

  // Password gate
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const populateTree = (tree) => {
    setTreeId(tree.id);
    setProfile({
      name: tree.title,
      bio: tree.description || "",
      theme: tree.theme || "default",
      isVerified: tree.user?.isVerified || false,
      customColors: {
        background: tree.backgroundColor || "#1a1a2e",
        text: tree.textColor || "#ffffff",
      },
      socialLinks: tree.socialLinks || {},
      backgroundImage: tree.backgroundImage || "",
      fontFamily: tree.fontFamily || "sans",
      avatarUrl: tree.avatarUrl || tree.user?.avatarUrl || "",
      buttonStyle: tree.buttonStyle || "rounded",
    });
    setLinks(
      (tree.links || []).map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        icon: l.icon || "default",
        clicks: l.clicks || 0,
        type: l.type || "link",
        activatesAt: l.activatesAt || null,
        deactivatesAt: l.deactivatesAt || null,
      }))
    );
  };

  useEffect(() => {
    const loadSharedLinkTree = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setErrorType(null);
        setPasswordRequired(false);

        const res = await fetch(`${API_URL}/api/linktrees/public/${id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.status === 403 && data.passwordRequired) {
          setPasswordRequired(true);
          return;
        }
        if (res.status === 410) {
          setErrorType("schedule");
          setError(data.error || "This LinkTree is not currently active");
          return;
        }
        if (!res.ok) {
          setErrorType("notfound");
          setError(data.error || "LinkTree not found");
          return;
        }
        populateTree(data);
      } catch (err) {
        console.error("Error loading shared LinkTree:", err);
        setErrorType("notfound");
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadSharedLinkTree();
  }, [id]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const tree = await authLinktree(id, passwordInput);
      setPasswordRequired(false);
      populateTree(tree);
    } catch (err) {
      setAuthError(err.message || "Incorrect password");
    } finally {
      setAuthLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
        <div className="text-center p-6 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] max-w-sm w-full">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Password Required</h2>
          <p className="text-slate-400 text-sm mb-5">This LinkTree is password‑protected.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-[hsl(230,10%,22%)] bg-[hsl(230,10%,14%)] text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none text-sm"
            />
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading || !passwordInput}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {authLoading ? "Checking…" : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error && errorType === "schedule") {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
        <div className="text-center p-6 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] max-w-md">
          <div className="w-12 h-12 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Not Active Right Now</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
        <div className="text-center p-6 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] max-w-md">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Not Found</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile || !links) {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
        <div className="text-center p-6 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] max-w-md">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Not Found</h2>
          <p className="text-slate-400 text-sm">This LinkTree doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(230,15%,5%)] flex justify-center p-4">
      <div className="w-full max-w-md">
        <Preview profile={profile} links={links} treeId={treeId} />
      </div>
    </div>
  );
};

export default SharedLinkTree;