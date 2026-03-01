import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  ChevronUp,
  ChevronDown,
  Instagram,
  Twitter,
  Github,
  Globe,
  Youtube,
  Link as LinkIcon,
  Settings,
  Share2,
  Eye,
  Edit3,
  Save,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react";
import { getMyLinkTrees, createLinkTree, updateLinkTree, bulkUpdateLinks } from "../api/linktrees";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Social icons mapping
const socialIcons = {
  instagram: Instagram,
  twitter: Twitter,
  github: Github,
  youtube: Youtube,
  website: Globe,
  default: LinkIcon,
};

const defaultThemes = {
  modern: {
    background: "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900",
    buttonStyle: "bg-white/10 backdrop-blur-md border border-white/20",
    textColor: "text-white",
    hoverEffect: "hover:bg-white/20",
  },
  minimal: {
    background: "bg-white",
    buttonStyle: "bg-slate-50 border border-slate-200",
    textColor: "text-slate-800",
    hoverEffect: "hover:bg-slate-100",
  },
  neon: {
    background: "bg-black",
    buttonStyle: "bg-black border border-neon-pink",
    textColor: "text-neon-pink",
    hoverEffect: "hover:bg-neon-pink hover:text-black",
  },
};

const LinkTreeBuilder = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [activeTab, setActiveTab] = useState("links");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkTreeId, setLinkTreeId] = useState(null);
  const [profile, setProfile] = useState({
    name: "Your Name",
    bio: "Your Bio ✨",
    theme: "modern",
    customColors: {
      background: "#1a1a1a",
      text: "#ffffff",
      button: "#ffffff20",
    },
  });

  const [links, setLinks] = useState([
    {
      id: "1",
      title: "Portfolio Website",
      url: "https://example.com",
      icon: "website",
      isActive: true,
      customStyle: {
        color: "#ffffff",
        background: "#ffffff20",
      },
    },
  ]);

  // Add new link
  const addLink = () => {
    const newLink = {
      id: Date.now().toString(),
      title: "New Link",
      url: "https://",
      icon: "default",
      isActive: true,
      customStyle: {
        color: "#ffffff",
        background: "#ffffff20",
      },
    };
    setLinks([...links, newLink]);
  };
  // Load existing LinkTree data if available
  useEffect(() => {
    const loadLinkTree = async () => {
      try {
        const trees = await getMyLinkTrees();
        if (trees && trees.length > 0) {
          const tree = trees[0];
          setLinkTreeId(tree.id);
          setProfile({
            name: tree.title || 'Your Name',
            bio: tree.description || 'Your Bio ✨',
            theme: tree.theme || 'modern',
            customColors: {
              background: tree.backgroundColor || '#1a1a1a',
              text: tree.textColor || '#ffffff',
              button: '#ffffff20',
            },
          });
          if (tree.links && tree.links.length > 0) {
            setLinks(tree.links.map(link => ({
              id: link.id,
              title: link.title,
              url: link.url,
              icon: link.icon || 'default',
              isActive: link.isActive,
              customStyle: { color: '#ffffff', background: '#ffffff20' },
            })));
          }
        }
      } catch (error) {
        console.error('Failed to load linktree:', error);
      }
    };

    loadLinkTree();
  }, []);

  // Save LinkTree to server
  const saveLinkTree = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const treeData = {
        title: profile.name,
        description: profile.bio,
        slug: profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        theme: profile.theme,
        backgroundColor: profile.customColors?.background,
        textColor: profile.customColors?.text,
      };

      if (linkTreeId) {
        // Update existing
        await updateLinkTree(linkTreeId, treeData);
        // Update links
        await bulkUpdateLinks(linkTreeId, links.map((link, index) => ({
          title: link.title,
          url: link.url,
          icon: link.icon,
          isActive: link.isActive,
          order: index,
        })));
      } else {
        // Create new
        const result = await createLinkTree({
          ...treeData,
          links: links.map((link, index) => ({
            title: link.title,
            url: link.url,
            icon: link.icon,
            isActive: link.isActive,
            order: index,
          })),
        });
        setLinkTreeId(result.id);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Share Dialog Component
  const ShareDialog = () => {
    const shareUrl = `${window.location.origin}/share/${linkTreeId}`;

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    };
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your LinkTree</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <Twitter size={20} />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <LinkIcon size={20} />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  // Add SaveStatus component to Sidebar
  const SaveStatus = () => (
    <div className="fixed bottom-4 left-4 right-4">
      {saveError && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
      {saveSuccess && (
        <Alert className="mb-2 bg-green-50 text-green-700 border-green-200">
          <AlertDescription>Changes saved successfully!</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2">
        <Button
          onClick={saveLinkTree}
          className="w-full gap-2"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        {linkTreeId && <ShareDialog />}
      </div>
    </div>
  );

  // Sidebar Component
  const Sidebar = () => (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 bg-white h-screen fixed left-0 top-0 shadow-xl border-r border-slate-200 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-slate-800">LinkTree Builder</h1>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <Eye size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {["links", "appearance", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                activeTab === tab
                  ? "bg-[hsl(230,12%,9%)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {activeTab === "links" && (
              <div className="space-y-4">
                {links.map((link, index) => (
                  <motion.div
                    key={link.id}
                    layout
                    className="bg-slate-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 hover:bg-slate-200 rounded-lg">
                          <ChevronUp size={16} className="text-slate-600" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-200 rounded-lg">
                          <ChevronDown size={16} className="text-slate-600" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          setLinks(links.filter((l) => l.id !== link.id))
                        }
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-3" >
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index].title = e.target.value;
                          setLinks(newLinks);
                        }}
                        className="w-full px-3 py-2 text-slate-600 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Link Title"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index].url = e.target.value;
                          setLinks(newLinks);
                        }}
                        className="w-full px-3 py-2 text-slate-600 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="URL"
                      />

                      <select
                        value={link.icon}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index].icon = e.target.value;
                          setLinks(newLinks);
                        }}
                        className="w-full px-3 py-2 text-slate-600 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.keys(socialIcons).map((icon) => (
                          <option key={icon} value={icon}>
                            {icon.charAt(0).toUpperCase() + icon.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={addLink}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-gray-400 hover:text-slate-600 flex items-center justify-center space-x-2"
                >
                  <PlusCircle size={20} />
                  <span>Add New Link</span>
                </button>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(defaultThemes).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setProfile({ ...profile, theme })}
                        className={`p-4 rounded-xl border ${
                          profile.theme === theme
                            ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-sm font-medium capitalize text-slate-600 ">
                          {theme}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Custom Colors
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-600">
                        Background
                      </label>
                      <input
                        type="color"
                        value={profile.customColors.background}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            customColors: {
                              ...profile.customColors,
                              background: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">
                        Button Style
                      </label>
                      <input
                        type="color"
                        value={profile.customColors.button}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            customColors: {
                              ...profile.customColors,
                              button: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-slate-600 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className="w-full px-3 py-2 text-slate-600 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <SaveStatus />
    </motion.div>
  );

  // Preview Component
  const Preview = () => {
    const theme = defaultThemes[profile.theme];

    return (
      <div className={`min-h-screen w-full ${theme.background}`}>
        <button
          onClick={() => setIsEditing(true)}
          className="fixed top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl"
        >
          <Edit3 size={20} />
        </button>

        <div className="max-w-md mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-slate-100">
              <img
                src="/api/placeholder/96/96"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className={`text-2xl font-bold ${theme.textColor} mb-2`}>
              {profile.name}
            </h1>
            <p className="text-slate-400">{profile.bio}</p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="space-y-4"
          >
            {links.map((link) => {
              const Icon = socialIcons[link.icon] || socialIcons.default;

              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${theme.buttonStyle} ${theme.textColor} ${theme.hoverEffect} 
                    flex items-center justify-between py-3 px-6 rounded-xl font-medium 
                    transition-all duration-200 backdrop-blur-sm`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {link.title}
                  </span>
                  <Share2
                    size={18}
                    className="opacity-0 group-hover:opacity-100"
                  />
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full">
      {isEditing && <Sidebar />}
      <main
        className={`${
          isEditing ? "ml-80" : ""
        } h-full transition-all duration-300`}
      >
        <Preview />
      </main>
    </div>
  );
};

export default LinkTreeBuilder;
