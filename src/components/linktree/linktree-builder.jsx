import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Preview from "./preview";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { SEOMetadata } from "../seo-metadata";
import { v4 as uuidv4 } from 'uuid';
import { UrlState } from "@/context";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const LinkTreeBuilder = () => {
  const { user, loading: authLoading } = UrlState();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("links");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [linkTreeId, setLinkTreeId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [title, setTitle] = useState("Your Link Tree");
  const [is_active, setIsactive] = useState(true);
  const [views, setViews] = useState(0);
  const [linkTree, setLinkTree] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreateMode = searchParams.has('create');

  const [profile, setProfile] = useState({
    name: user?.name || "Your Name",
    bio: "Your Bio ✨",
    theme: "default",
    customColors: {
      background: "#1a1a1a",
      text: "#ffffff",
      button: "#ffffff20",
    },
  });

  const [links, setLinks] = useState([
    {
      id: uuidv4(),
      title: "Portfolio Website",
      url: "https://example.com",
      icon: "website",
    },
  ]);

  useEffect(() => {
    if (!authLoading && user) {
      loadLinkTree();
      // Update profile name when user is loaded
      setProfile(prev => ({
        ...prev,
        name: user.name || "Your Name"
      }));
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const loadLinkTree = async () => {
    if (!user?.id || isCreateMode) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch existing linktrees
      // For now, just set loading to false
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading LinkTree:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (saveSuccess || saveError) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
        setSaveError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, saveError]);

  const saveLinkTree = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    if (!user?.id) {
      setSaveError('Please sign in to save your LinkTree');
      setIsSaving(false);
      return;
    }

    // Generate UUIDs for links
    const linksWithUuid = links.map(link => ({
      ...link,
      id: link.id || uuidv4(),
    }));

    const linkTreeData = {
      profile,
      links: linksWithUuid,
      userId: user.id,
      title,
      isActive: is_active,
      views
    };

    try {
      // TODO: Implement actual API call to save linktree
      // For now, simulate success
      console.log('Saving LinkTree:', linkTreeData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setLinkTreeId(uuidv4());
      setSaveSuccess(true);
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="text-center p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Sign in Required</h2>
          <p className="text-zinc-400 mb-6">Please sign in to create your LinkTree</p>
          <button
            className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium transition-colors"
            onClick={() => navigate("/auth")}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOMetadata
        title="Create Your Link Tree | TrimLink"
        description="Build a personalized link tree to showcase all your important links in one place. Perfect for social media bio links and personal branding."
        canonical="https://trimlynk.com/link-tree"
        keywords="link in bio, link tree, bio link page, social media links, personal landing page, multiple links"
        author="TrimLink"
        language="en"
      />
      <div className="min-h-screen w-full bg-zinc-950">
        <main className="w-full flex gap-5 lg:p-2 h-full relative">
          <span className="absolute lg:hidden">
            <Plus
              size={24}
              className="fixed top-20 right-4 bg-zinc-800 p-1 rounded-md cursor-pointer hover:bg-zinc-700 transition-colors text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </span>
          <Sidebar
            profile={profile}
            setProfile={setProfile}
            links={links}
            setLinks={setLinks}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            saveLinkTree={saveLinkTree}
            saveError={saveError}
            saveSuccess={saveSuccess}
            isSaving={isSaving}
            linkTreeId={linkTreeId}
            setLinkTreeId={setLinkTreeId}
            userId={user?.id}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            title={title}
            setTitle={setTitle}
          />
          <Preview
            profile={profile}
            links={links}
            linkTree={linkTree}
            setProfile={setProfile}
            setLinks={setLinks}
          />
        </main>
      </div>
    </>
  );
};

export default LinkTreeBuilder;