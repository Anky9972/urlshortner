import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Preview from "./preview";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { SEOMetadata } from "../seo-metadata";
import { v4 as uuidv4 } from 'uuid';
import { UrlState } from "@/context";
import { getMyLinkTrees, getLinkTree, createLinkTree, updateLinkTree, bulkUpdateLinks } from "@/api/linktrees";

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
      const trees = await getMyLinkTrees();
      if (trees && trees.length > 0) {
        const tree = await getLinkTree(trees[0].id);
        setLinkTreeId(tree.id);
        setTitle(tree.title || "Your Link Tree");
        setIsactive(tree.isPublic !== false);
        setViews(tree.viewCount || 0);
        setProfile({
          name: tree.title || user?.name || "Your Name",
          bio: tree.description || "Your Bio ✨",
          theme: tree.theme || "default",
          socialLinks: tree.socialLinks || {},
          backgroundImage: tree.backgroundImage || '',
          fontFamily: tree.fontFamily || 'sans',
          avatarUrl: tree.avatarUrl || '',
          buttonStyle: tree.buttonStyle || 'rounded',
          seoTitle: tree.seoTitle || '',
          seoDescription: tree.seoDescription || '',
          seoImage: tree.seoImage || '',
          customColors: {
            background: tree.backgroundColor || "#1a1a1a",
            text: tree.textColor || "#ffffff",
            button: "#ffffff20",
          },
        });
        if (tree.links && tree.links.length > 0) {
          setLinks(tree.links.map(l => ({
            id: l.id,
            title: l.title,
            url: l.url,
            icon: l.icon || "website",
            type: l.type || 'link',
            activatesAt: l.activatesAt || null,
            deactivatesAt: l.deactivatesAt || null,
          })));
        }
      }
    } catch (error) {
      console.error("Error loading LinkTree:", error);
    } finally {
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

    const linksWithUuid = links.map(link => ({
      ...link,
      id: link.id || uuidv4(),
    }));

    try {
      if (linkTreeId) {
        // Update existing
        await updateLinkTree(linkTreeId, {
          title: profile.name || title,
          description: profile.bio,
          theme: profile.theme,
          backgroundColor: profile.customColors?.background,
          textColor: profile.customColors?.text,
          isPublic: is_active,
          socialLinks: profile.socialLinks || {},
          backgroundImage: profile.backgroundImage || null,
          fontFamily: profile.fontFamily || 'sans',
          avatarUrl: profile.avatarUrl || null,
          buttonStyle: profile.buttonStyle || 'rounded',
          seoTitle: profile.seoTitle || null,
          seoDescription: profile.seoDescription || null,
          seoImage: profile.seoImage || null,
        });
        await bulkUpdateLinks(linkTreeId, linksWithUuid.map((l, i) => ({
          id: typeof l.id === 'string' && l.id.includes('-') ? l.id : undefined,
          title: l.title,
          url: l.url || '',
          icon: l.icon,
          order: i,
          type: l.type || 'link',
          activatesAt: l.activatesAt || null,
          deactivatesAt: l.deactivatesAt || null,
        })));
      } else {
        // Create new
        const created = await createLinkTree({
          title: profile.name || title,
          description: profile.bio,
          theme: profile.theme,
          backgroundColor: profile.customColors?.background,
          textColor: profile.customColors?.text,
          isPublic: is_active,
          socialLinks: profile.socialLinks || {},
          backgroundImage: profile.backgroundImage || null,
          fontFamily: profile.fontFamily || 'sans',
          avatarUrl: profile.avatarUrl || null,
          buttonStyle: profile.buttonStyle || 'rounded',
          seoTitle: profile.seoTitle || null,
          seoDescription: profile.seoDescription || null,
          seoImage: profile.seoImage || null,
        });
        setLinkTreeId(created.id);
        if (linksWithUuid.length > 0) {
          await bulkUpdateLinks(created.id, linksWithUuid.map((l, i) => ({
            title: l.title,
            url: l.url || '',
            icon: l.icon,
            order: i,
            type: l.type || 'link',
            activatesAt: l.activatesAt || null,
            deactivatesAt: l.deactivatesAt || null,
          })));
        }
      }
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
      <div className="min-h-screen w-full flex items-center justify-center bg-[hsl(230,15%,5%)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[hsl(230,15%,5%)]">
        <div className="text-center p-8 rounded-2xl bg-[hsl(230,12%,9%)]/50 border border-[hsl(230,10%,15%)] max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Sign in Required</h2>
          <p className="text-slate-400 mb-6">Please sign in to create your LinkTree</p>
          <button
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
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
        canonical={`${import.meta.env.VITE_APP_URL || 'https://trimlynk.com'}/link-tree`}
        keywords="link in bio, link tree, bio link page, social media links, personal landing page, multiple links"
        author="TrimLink"
        language="en"
      />
      <div className="min-h-screen w-full bg-[hsl(230,15%,5%)]">
        <main className="w-full flex gap-5 lg:p-2 h-full relative">
          <span className="absolute lg:hidden">
            <Plus
              size={24}
              className="fixed top-20 right-4 bg-[hsl(230,10%,14%)] p-1 rounded-md cursor-pointer hover:bg-[hsl(230,10%,20%)] transition-colors text-white"
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