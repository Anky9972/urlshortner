import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import {
  Link as LinkIcon,
  MousePointerClick,
  TrendingUp,
  FolderOpen,
  LayoutGrid,
  List,
  Settings,
  BarChart3,
  Key,
  Webhook,
  QrCode,
  Search,
  Sparkles,
  Plus,
  ArrowUpRight,
  Activity,
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

  const statCards = [
    { icon: LinkIcon, label: "Total Links", value: totalLinks, color: "blue", change: null },
    { icon: MousePointerClick, label: "Total Clicks", value: totalClicks, color: "emerald", change: null },
    { icon: TrendingUp, label: "Avg Clicks", value: avgClicksPerLink, color: "violet", change: null },
    { icon: FolderOpen, label: "Folders", value: folders.length, color: "amber", change: null },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
  };

  const quickActions = [
    { icon: QrCode, label: "QR Generator", path: "/qr-code-generator", color: "violet" },
    { icon: BarChart3, label: "Analytics", path: "/analytics", color: "emerald" },
    { icon: Key, label: "API Keys", path: "/settings?tab=api", color: "amber" },
    { icon: Webhook, label: "Webhooks", path: "/settings?tab=webhooks", color: "rose" },
  ];

  return (
    <>
      <SEOMetadata
        title="Dashboard | TrimLink"
        description="Manage your shortened URLs, QR codes, and analytics."
        canonical={`${import.meta.env.VITE_APP_URL || 'https://trimlynk.com'}/dashboard`}
      />

      <div className="min-h-screen bg-[hsl(230,15%,5%)]">
        {isLoading && (
          <div className="fixed top-16 left-0 right-0 z-50">
            <BarLoader width="100%" height={2} color="#2563eb" />
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
            <div className="max-w-6xl mx-auto space-y-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-white"
                  >
                    Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} <span className="inline-block animate-[wave_2s_ease-in-out_infinite] origin-bottom-right">👋</span>
                  </motion.h1>
                  <p className="text-slate-500 text-sm mt-1">Manage your links and track performance</p>
                </div>
                <CreateLinkEnhanced onSuccess={fnUrls} folders={folders} tags={tags} pixels={pixels} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => {
                  const c = colorMap[stat.color];
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                    >
                      <div className="relative group p-4 rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] hover:border-[hsl(230,10%,22%)] transition-all overflow-hidden">
                        {/* Top accent line */}
                        <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${c.border.replace('border-', 'via-').replace('/20', '/50')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mt-1.5">{stat.value}</p>
                          </div>
                          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${c.text}`} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => {
                    const c = colorMap[action.color];
                    return (
                      <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] hover:border-[hsl(230,10%,22%)] ${c.text} transition-all`}
                      >
                        <action.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{action.label}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Search & Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Search links..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-[hsl(230,10%,10%)] border-[hsl(230,10%,18%)]"
                    />
                  </div>
                  {selectedFolder && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-400 text-sm border border-blue-600/20">
                      <FolderOpen className="w-3.5 h-3.5" />
                      Filtered
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)]">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${viewMode === "list" ? "bg-blue-600/15 text-blue-400" : "text-slate-500 hover:text-white"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-blue-600/15 text-blue-400" : "text-slate-500 hover:text-white"}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                  <Link to="/settings">
                    <button className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-[hsl(230,10%,12%)] transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
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
                  <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    Your Links
                  </h2>
                  <span className="text-xs text-slate-600 bg-[hsl(230,10%,12%)] px-2.5 py-1 rounded-lg">{filteredUrls?.length || 0} total</span>
                </div>

                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                  {(filteredUrls || []).length === 0 && !loading ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="col-span-full text-center py-24"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] mb-5">
                        <LinkIcon className="w-8 h-8 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No links yet</h3>
                      <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                        {searchQuery ? "No links match your search query" : "Create your first short link to get started"}
                      </p>
                      {!searchQuery && <CreateLinkEnhanced onSuccess={fnUrls} folders={folders} tags={tags} pixels={pixels} />}
                    </motion.div>
                  ) : (
                    (filteredUrls || []).map((url, i) => (
                      <motion.div
                        key={url.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.4 }}
                        className="relative group"
                      >
                        {selectedIds.length > 0 && (
                          <div
                            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-md border-2 cursor-pointer transition-all ${
                              selectedIds.includes(url.id) ? 'bg-blue-600 border-blue-600' : 'border-[hsl(230,10%,20%)] hover:border-[hsl(230,10%,30%)]'
                            }`}
                            onClick={() => toggleUrlSelection(url.id)}
                          >
                            {selectedIds.includes(url.id) && (
                              <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
