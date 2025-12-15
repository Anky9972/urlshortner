import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import {
  Filter,
  Link as LinkIcon,
  MousePointerClick,
  TrendingUp,
  FolderOpen,
  LayoutGrid,
  List,
  Settings,
  Plus,
  BarChart3,
  Key,
  Webhook,
  QrCode,
  ExternalLink,
  Search,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LinkCard from "@/components/link-card";
import Error from "@/components/error";
import CreateLinkEnhanced from "@/components/create-link-enhanced";
import FoldersSidebar from "@/components/folders-sidebar";
import BulkOperations from "@/components/bulk-operations";

import useFetch from "@/hooks/use-fetch";
import { UrlState } from "@/context";
import { getUrls, bulkDeleteUrls } from "@/api/urls";
import { getClicksForUrls } from "@/api/clicks";
import { getFolders, createFolder, updateFolder, deleteFolder, getTags, moveUrlToFolder, addTagToUrl } from "@/api/folders";
import { getPixels } from "@/api/pixels";
import { SEOMetadata } from "@/components/seo-metadata";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [showSidebar, setShowSidebar] = useState(true);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [pixels, setPixels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const { user } = UrlState();
  const navigate = useNavigate();
  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls, user?.id);
  const { loading: loadingClicks, data: clicks, fn: fnClicks } = useFetch(getClicksForUrls, urls?.map((url) => url.id));

  useEffect(() => {
    if (user?.id) {
      fnUrls();
      loadFoldersAndTags();
    }
  }, [user?.id]);

  useEffect(() => {
    if (urls?.length) fnClicks();
  }, [urls?.length]);

  const loadFoldersAndTags = async () => {
    try {
      const foldersData = await getFolders(user?.id);
      const tagsData = await getTags().catch(() => []);
      const pixelsData = await getPixels(user?.id).catch(() => []);
      setFolders(foldersData || []);
      setTags(tagsData || []);
      setPixels(pixelsData || []);
    } catch (error) {
      console.error('Error loading folders/tags:', error);
    }
  };

  const filteredUrls = urls?.filter((url) => {
    const matchesSearch = url.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || url.folder_id === selectedFolder || url.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const isLoading = loading || loadingClicks;
  const totalLinks = urls?.length || 0;
  const totalClicks = clicks?.length || 0;
  const avgClicksPerLink = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

  // Handlers
  const handleFolderCreate = async (data) => {
    try {
      const newFolder = await createFolder(user?.id, data);
      setFolders([...folders, newFolder]);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleFolderUpdate = async (id, data) => {
    try {
      await updateFolder(id, data);
      setFolders(folders.map(f => f.id === id ? { ...f, ...data } : f));
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  const handleFolderDelete = async (id) => {
    try {
      await deleteFolder(id);
      setFolders(folders.filter(f => f.id !== id));
      if (selectedFolder === id) setSelectedFolder(null);
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleSelectAll = () => setSelectedIds(filteredUrls?.map(u => u.id) || []);
  const handleDeselectAll = () => setSelectedIds([]);

  const handleBulkDelete = async (ids) => {
    try {
      await bulkDeleteUrls(ids);
      fnUrls();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  const handleBulkMove = async (ids, folderId) => {
    try {
      await Promise.all(ids.map(id => moveUrlToFolder(id, folderId === 'none' ? null : folderId)));
      fnUrls();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error moving URLs:', error);
    }
  };

  const handleBulkTag = async (ids, tagId) => {
    try {
      await Promise.all(ids.map(id => addTagToUrl(id, tagId)));
      fnUrls();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error adding tags:', error);
    }
  };

  const toggleUrlSelection = (urlId) => {
    setSelectedIds(prev => prev.includes(urlId) ? prev.filter(id => id !== urlId) : [...prev, urlId]);
  };

  const quickActions = [
    { icon: QrCode, label: "QR Generator", path: "/qr-code-generator", color: "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20" },
    { icon: BarChart3, label: "Analytics", path: "/analytics", color: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" },
    { icon: Key, label: "API Keys", path: "/settings?tab=api", color: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" },
    { icon: Webhook, label: "Webhooks", path: "/settings?tab=webhooks", color: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" },
  ];

  return (
    <>
      <SEOMetadata
        title="Dashboard | TrimLink"
        description="Manage your shortened URLs, QR codes, and analytics."
        canonical="https://trimlynk.com/dashboard"
      />

      <div className="min-h-screen bg-zinc-950">
        {isLoading && (
          <div className="fixed top-16 left-0 right-0 z-50">
            <BarLoader width="100%" height={2} color="#06b6d4" />
          </div>
        )}

        <div className="flex">
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 20 }}
                className="hidden lg:block"
              >
                <FoldersSidebar
                  folders={folders}
                  selectedFolder={selectedFolder}
                  onSelectFolder={setSelectedFolder}
                  onCreateFolder={handleFolderCreate}
                  onUpdateFolder={handleFolderUpdate}
                  onDeleteFolder={handleFolderDelete}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                  </h1>
                  <p className="text-zinc-500 text-sm mt-1">Manage your links and track performance</p>
                </div>
                <CreateLinkEnhanced onSuccess={fnUrls} folders={folders} tags={tags} pixels={pixels} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: LinkIcon, label: "Links", value: totalLinks, color: "text-cyan-400" },
                  { icon: MousePointerClick, label: "Clicks", value: totalClicks, color: "text-emerald-400" },
                  { icon: TrendingUp, label: "Avg Clicks", value: avgClicksPerLink, color: "text-violet-400" },
                  { icon: FolderOpen, label: "Folders", value: folders.length, color: "text-amber-400" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
                          </div>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Quick Actions</h2>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 ${action.color} transition-colors`}
                    >
                      <action.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder="Search links..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-700"
                    />
                  </div>
                  {selectedFolder && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm">
                      <FolderOpen className="w-3.5 h-3.5" />
                      Filtered
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`h-8 w-8 p-0 ${viewMode === "list" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                  <Link to="/settings">
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <BulkOperations
                urls={filteredUrls || []}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkDelete={handleBulkDelete}
                onBulkMove={handleBulkMove}
                onBulkTag={handleBulkTag}
                onExport={() => console.log('Exported!')}
                onImport={() => fnUrls()}
                folders={folders}
                tags={tags}
              />

              {error && <Error message={error?.message} />}

              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-zinc-400">Your Links</h2>
                  <span className="text-xs text-zinc-600">{filteredUrls?.length || 0} total</span>
                </div>

                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                  {(filteredUrls || []).length === 0 && !loading ? (
                    <div className="col-span-full text-center py-20">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
                        <LinkIcon className="w-7 h-7 text-zinc-600" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No links yet</h3>
                      <p className="text-zinc-500 text-sm mb-6">
                        {searchQuery ? "No links match your search" : "Create your first short link"}
                      </p>
                      {!searchQuery && <CreateLinkEnhanced onSuccess={fnUrls} folders={folders} tags={tags} pixels={pixels} />}
                    </div>
                  ) : (
                    (filteredUrls || []).map((url, i) => (
                      <motion.div
                        key={url.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="relative group"
                      >
                        {selectedIds.length > 0 && (
                          <div
                            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded border-2 cursor-pointer transition-all ${selectedIds.includes(url.id) ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-700 hover:border-zinc-600'
                              }`}
                            onClick={() => toggleUrlSelection(url.id)}
                          >
                            {selectedIds.includes(url.id) && (
                              <svg className="w-full h-full text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        )}
                        <div className={selectedIds.length > 0 ? 'pl-10' : ''}>
                          <LinkCard url={url} fetchUrls={fnUrls} />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;