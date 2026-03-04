import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import {
  GripVertical,
  Link2Icon,
  PlusCircle,
  Trash2,
  Copy,
  Check,
  Code2,
  BarChart2,
} from "lucide-react";
import LinktreeAnalytics from "./linktree-analytics";
import {
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { defaultThemes } from "../../utils/theme";
import SaveStatus from "./save-status";
import { IoClose } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socialIcons = {
  instagram: FaInstagram,
  twitter: FaTwitter,
  github: FaGithub,
  youtube: FaYoutube,
  website: FaGlobe,
  default: Link2Icon,
};

// Embed Widget Component
const EmbedWidget = ({ linkTreeId }) => {
  const [copied, setCopied] = useState(false);
  const FRONTEND_URL = import.meta.env.VITE_APP_URL || 'https://trimlynk.com';
  const snippet = `<iframe src="${FRONTEND_URL}/lt-embed/${linkTreeId}" width="400" height="700" frameborder="0" style="border-radius:16px;overflow:hidden" title="LinkTree"></iframe>`;
  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="pt-1 border-t border-[hsl(230,10%,18%)]">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1 mt-3"><Code2 size={14} /> Embed Widget</label>
      <p className="text-xs text-slate-500 mb-2">Copy this snippet to embed your LinkTree on any website.</p>
      <pre className="text-xs text-slate-400 bg-[hsl(230,10%,11%)] rounded-lg p-3 whitespace-pre-wrap break-all border border-[hsl(230,10%,18%)] mb-2">
        {snippet}
      </pre>
      <button onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-[hsl(230,10%,20%)] text-slate-300 hover:text-white hover:bg-[hsl(230,10%,16%)] transition-colors">
        {copied ? <><Check size={12} className="text-emerald-400" /> Copied!</> : <><Copy size={12} /> Copy Embed Code</>}
      </button>
    </div>
  );
};

// Sortable item wrapper using dnd-kit
const SortableLinkItem = ({ link, index, links, setLinks }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAB, setShowAB] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const updateLink = (field, value) => {
    const n = [...links]; n[index] = { ...n[index], [field]: value }; setLinks(n);
  };
  const linkType = link.type || 'link';
  const isActive = link.isActive !== false;

  return (
    <div ref={setNodeRef} style={style} className="bg-[hsl(230,10%,14%)]/50 border border-[hsl(230,10%,20%)]/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 touch-none cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
        {/* Type toggle */}
        <div className="flex gap-1">
          {['link', 'header', 'divider'].map((t) => (
            <button key={t} onClick={() => updateLink('type', t)}
              className={`px-2 py-0.5 text-xs rounded-md border capitalize transition-all ${
                linkType === t ? 'border-blue-600/50 bg-blue-600/10 text-blue-400' : 'border-[hsl(230,10%,22%)] text-slate-500 hover:text-slate-300'
              }`}>{t}</button>
          ))}
        </div>
        {/* Active toggle */}
        <button
          onClick={() => updateLink('isActive', !isActive)}
          title={isActive ? 'Visible — click to hide' : 'Hidden — click to show'}
          className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${
            isActive ? 'bg-blue-600' : 'bg-[hsl(230,10%,22%)]'
          }`}
        >
          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-4' : 'translate-x-0.5'
          }`} />
        </button>
        <button
          onClick={() => setLinks(links.filter((l) => l.id !== link.id))}
          className="p-1.5 text-red-400 hover:bg-red-500/10 border border-[hsl(230,10%,25%)] rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {linkType === 'divider' ? (
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-[hsl(230,10%,25%)]" />
          <span className="text-xs text-slate-600">Divider</span>
          <div className="flex-1 h-px bg-[hsl(230,10%,25%)]" />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={link.title}
            onChange={(e) => updateLink('title', e.target.value)}
            className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
            placeholder={linkType === 'header' ? 'Section Header' : 'Link Title'}
          />
          {linkType === 'link' && (
            <>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink('url', e.target.value)}
                className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                placeholder="URL"
              />
              <select
                value={link.icon}
                onChange={(e) => updateLink('icon', e.target.value)}
                className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
              >
                {Object.keys(socialIcons).map((icon) => (
                  <option key={icon} value={icon}>
                    {icon.charAt(0).toUpperCase() + icon.slice(1)}
                  </option>
                ))}
              </select>
              {/* Thumbnail URL */}
              <input
                type="url"
                value={link.thumbnail || ''}
                onChange={(e) => updateLink('thumbnail', e.target.value || null)}
                className="w-full px-3 py-2 text-white text-xs rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                placeholder="Thumbnail image URL (optional)"
              />
              {/* Scheduling */}
              <button onClick={() => setShowSchedule(s => !s)}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                <span>{showSchedule ? '▾' : '▸'}</span> Schedule (optional)
              </button>
              {showSchedule && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Show from</label>
                    <input type="datetime-local" value={link.activatesAt ? link.activatesAt.slice(0,16) : ''}
                      onChange={(e) => updateLink('activatesAt', e.target.value || null)}
                      className="w-full px-2 py-1.5 text-xs text-slate-300 rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Hide after</label>
                    <input type="datetime-local" value={link.deactivatesAt ? link.deactivatesAt.slice(0,16) : ''}
                      onChange={(e) => updateLink('deactivatesAt', e.target.value || null)}
                      className="w-full px-2 py-1.5 text-xs text-slate-300 rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:outline-none" />
                  </div>
                </div>
              )}
              {/* A/B Variant */}
              <button onClick={() => setShowAB(s => !s)}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                <span>{showAB ? '▾' : '▸'}</span> A/B Variant (optional)
              </button>
              {showAB && (
                <div className="space-y-2 pt-1 border-t border-[hsl(230,10%,18%)] mt-1">
                  <input
                    type="url"
                    value={link.abVariantUrl || ''}
                    onChange={(e) => updateLink('abVariantUrl', e.target.value || null)}
                    className="w-full px-3 py-2 text-white text-xs rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-violet-600/50 focus:outline-none transition-colors"
                    placeholder="Variant URL (leave blank to disable A/B)"
                  />
                  <input
                    type="text"
                    value={link.abVariantTitle || ''}
                    onChange={(e) => updateLink('abVariantTitle', e.target.value || null)}
                    className="w-full px-3 py-2 text-white text-xs rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-violet-600/50 focus:outline-none transition-colors"
                    placeholder="Variant Title (optional)"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 shrink-0">Original %</label>
                    <input
                      type="range" min="0" max="100"
                      value={link.abWeight ?? 50}
                      onChange={(e) => updateLink('abWeight', parseInt(e.target.value))}
                      className="flex-1 accent-violet-500"
                    />
                    <span className="text-xs text-slate-400 w-8 text-right shrink-0">{link.abWeight ?? 50}%</span>
                  </div>
                  <p className="text-[10px] text-slate-600">Variant receives {100 - (link.abWeight ?? 50)}% of clicks</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
const Sidebar = ({
  profile,
  setProfile,
  links,
  setLinks,
  activeTab,
  setActiveTab,
  saveLinkTree,
  saveError,
  saveSuccess,
  isSaving,
  linkTreeId,
  setLinkTreeId,
  slug,
  setSlug,
  sidebarOpen,
  setSidebarOpen,
  title,
  setTitle,
  treePassword,
  setTreePassword,
  publishAt,
  setPublishAt,
  unpublishAt,
  setUnpublishAt,
}) => {
  const [slugStatus, setSlugStatus] = useState(null); // null | 'checking' | 'available' | 'taken'

  const checkSlug = useCallback(async (value) => {
    if (!value || value.length < 2) { setSlugStatus(null); return; }
    setSlugStatus('checking');
    try {
      const res = await fetch(`${API_URL}/api/linktrees/check-slug/${encodeURIComponent(value)}`);
      const data = await res.json();
      setSlugStatus(data.available ? 'available' : 'taken');
    } catch {
      setSlugStatus(null);
    }
  }, []);
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const addLink = () => {
    const newLink = {
      id: Date.now().toString(),
      title: "New Link",
      url: "https://",
      icon: "default",
    };
    setLinks([...links, newLink]);
  };
  const location = useLocation();
  const [createMode, setCreateMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);
      setLinks(arrayMove(links, oldIndex, newIndex));
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);  // Use location.search to get the query string
    const createParam = queryParams.get("create");  // Extract the 'create' parameter

    if (createParam !== null) {
      setCreateMode(true);
    } else {
      setCreateMode(false);
    }
  }, [location.search]);
  // console.log("create param:", createMode);

  return (
    <motion.div
      className={`lg:w-80 shrink-0 fixed lg:relative left-0 right-0 ${
        sidebarOpen ? "visible" : "hidden"
      } z-10 bg-[hsl(230,12%,9%)] top-0 h-screen shadow-xl lg:rounded-xl border border-[hsl(230,10%,15%)] flex flex-col overflow-hidden`}
    >
      <span className="p-1.5 lg:hidden border border-[hsl(230,10%,20%)] absolute right-2 top-2 rounded-lg hover:bg-[hsl(230,10%,14%)] cursor-pointer text-slate-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <IoClose />
      </span>
      <div className="flex flex-col h-full overflow-hidden pt-5">
        {/* Tabs */}
        <div className="flex justify-center w-full gap-1 mb-4 px-4 shrink-0">
          {["links", "appearance", "settings", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "bg-[hsl(230,10%,14%)] text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-[hsl(230,10%,14%)]/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 overflow-y-auto min-h-0 px-4 pb-36"
          >
            {activeTab === "links" && (
              <div className="space-y-4 pt-1">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {links.map((link, index) => (
                        <SortableLinkItem key={link.id} link={link} index={index} links={links} setLinks={setLinks} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <button
                  onClick={addLink}
                  className="w-full py-3 border-2 border-dashed border-[hsl(230,10%,20%)] rounded-xl text-slate-400 hover:border-blue-600/50 hover:text-blue-400 flex items-center justify-center gap-2 transition-colors"
                >
                  <PlusCircle size={18} />
                  <span>Add New Link</span>
                </button>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-5 pt-1 pb-4">
                {/* Theme Gallery */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(defaultThemes).map(([theme, t]) => (
                      <button
                        key={theme}
                        onClick={() => setProfile({ ...profile, theme })}
                        className={`relative p-0 rounded-xl border overflow-hidden transition-all ${profile.theme === theme
                            ? "border-blue-500 ring-2 ring-blue-500/30"
                            : "border-[hsl(230,10%,20%)] hover:border-[hsl(230,10%,28%)]"
                          }`}
                      >
                        {/* Mini preview */}
                        <div className={`h-12 w-full ${t.background} flex items-center justify-center`}>
                          <div className={`h-3 w-8 rounded-sm ${t.buttonStyle}`} />
                        </div>
                        <div className={`text-center py-1 text-xs font-medium capitalize bg-[hsl(230,10%,12%)] ${profile.theme === theme ? 'text-blue-400' : 'text-slate-400'}`}>
                          {theme}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Style */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Button Shape</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { value: 'rounded', label: 'Rounded', cls: 'rounded-md' },
                      { value: 'pill',    label: 'Pill',    cls: 'rounded-full' },
                      { value: 'outline', label: 'Outline', cls: 'rounded-md border-2 border-current bg-transparent' },
                      { value: 'shadow',  label: 'Shadow',  cls: 'rounded-md shadow-lg shadow-black/50' },
                      { value: 'hard',    label: 'Hard',    cls: 'rounded-none' },
                    ].map(({ value, label, cls }) => (
                      <button key={value} onClick={() => setProfile({ ...profile, buttonStyle: value })}
                        className={`flex flex-col items-center gap-1.5 py-2 rounded-lg border text-xs transition-all ${
                          (profile.buttonStyle || 'rounded') === value
                            ? 'border-blue-600/50 bg-blue-600/10 text-blue-400'
                            : 'border-[hsl(230,10%,20%)] text-slate-500 hover:text-slate-300'
                        }`}>
                        <div className={`h-4 w-10 bg-slate-500 ${cls}`} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Background Image URL</label>
                  <input
                    type="url"
                    value={profile.backgroundImage || ''}
                    onChange={(e) => setProfile({ ...profile, backgroundImage: e.target.value })}
                    placeholder="https://example.com/bg.jpg (leave empty for none)"
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Font Family</label>
                  <select
                    value={profile.fontFamily || 'sans'}
                    onChange={(e) => setProfile({ ...profile, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                  >
                    <option value="sans">System Sans-Serif</option>
                    <option value="serif">System Serif</option>
                    <option value="mono">Monospace</option>
                    <option value="inter">Inter (Google)</option>
                    <option value="poppins">Poppins (Google)</option>
                    <option value="roboto">Roboto (Google)</option>
                  </select>
                </div>

                {/* Custom Colors */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Custom Colors
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500">
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
                        className="w-full h-10 rounded-lg bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">
                        Button Color
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
                        className="w-full h-10 rounded-lg bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4 pt-1 pb-4">
                {/* Profile fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Profile Name</label>
                  <input type="text" value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">LinkTree Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                  <textarea value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors resize-none"
                    rows={3} />
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Profile Avatar URL</label>
                  <input type="url" value={profile.avatarUrl || ''}
                    onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors" />
                </div>

                {/* Social Icons Bar */}
                <div className="pt-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Social Icons Bar</label>
                  <p className="text-xs text-slate-500 mb-3">These appear as icon buttons at the top of your page.</p>
                  <div className="space-y-2">
                    {[
                      { key: 'instagram', Icon: FaInstagram, placeholder: 'https://instagram.com/username', color: 'text-pink-400' },
                      { key: 'twitter',   Icon: FaTwitter,   placeholder: 'https://twitter.com/username',   color: 'text-sky-400' },
                      { key: 'github',    Icon: FaGithub,    placeholder: 'https://github.com/username',    color: 'text-slate-300' },
                      { key: 'youtube',   Icon: FaYoutube,   placeholder: 'https://youtube.com/@channel',   color: 'text-red-400' },
                      { key: 'website',   Icon: FaGlobe,     placeholder: 'https://yourwebsite.com',        color: 'text-emerald-400' },
                    ].map(({ key, Icon, placeholder, color }) => (
                      <div key={key} className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                        <input type="url" value={(profile.socialLinks || {})[key] || ''}
                          onChange={(e) => setProfile({ ...profile, socialLinks: { ...(profile.socialLinks || {}), [key]: e.target.value } })}
                          placeholder={placeholder}
                          className="flex-1 px-3 py-2 text-white text-xs rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slug Editor */}
                <div className="pt-1 border-t border-[hsl(230,10%,18%)]">
                  <label className="block text-sm font-medium text-slate-300 mb-1 mt-3">Public URL Slug</label>
                  <p className="text-xs text-slate-500 mb-2">Customize the URL for your public link tree page.</p>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-slate-600 whitespace-nowrap">…/share/</span>
                    <input
                      type="text"
                      value={slug || ''}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
                        setSlug(val);
                        checkSlug(val);
                      }}
                      placeholder="your-slug"
                      className={`flex-1 px-3 py-2 text-white text-xs rounded-lg border bg-[hsl(230,10%,14%)] focus:outline-none transition-colors ${
                        slugStatus === 'available' ? 'border-emerald-500/60' :
                        slugStatus === 'taken' ? 'border-red-500/60' :
                        'border-[hsl(230,10%,20%)] focus:border-blue-600/50'
                      }`}
                    />
                  </div>
                  {slugStatus === 'available' && <p className="text-xs text-emerald-400">✓ Available</p>}
                  {slugStatus === 'taken' && <p className="text-xs text-red-400">✗ Already taken</p>}
                  {slugStatus === 'checking' && <p className="text-xs text-slate-500">Checking…</p>}
                </div>

                {/* SEO Controls */}
                <div className="pt-1 border-t border-[hsl(230,10%,18%)]">
                  <label className="block text-sm font-medium text-slate-300 mb-1 mt-3">SEO / Open Graph</label>
                  <p className="text-xs text-slate-500 mb-3">Customize how your page looks when shared on social media.</p>
                  <div className="space-y-2">
                    <input type="text" value={profile.seoTitle || ''}
                      onChange={(e) => setProfile({ ...profile, seoTitle: e.target.value })}
                      placeholder="OG Title (defaults to tree title)"
                      className="w-full px-3 py-2 text-white text-xs rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors" />
                    <textarea value={profile.seoDescription || ''}
                      onChange={(e) => setProfile({ ...profile, seoDescription: e.target.value })}
                      placeholder="OG Description"
                      rows={2}
                      className="w-full px-3 py-2 text-white text-xs rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors resize-none" />
                    <input type="url" value={profile.seoImage || ''}
                      onChange={(e) => setProfile({ ...profile, seoImage: e.target.value })}
                      placeholder="OG Image URL"
                      className="w-full px-3 py-2 text-white text-xs rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors" />
                  </div>
                </div>

                {/* Embed Widget */}
                {linkTreeId && (
                  <EmbedWidget linkTreeId={linkTreeId} />
                )}

                {/* Password Protection */}
                <div className="pt-1 border-t border-[hsl(230,10%,18%)]">
                  <label className="block text-sm font-medium text-slate-300 mb-1 mt-3">Password Protection</label>
                  <p className="text-xs text-slate-500 mb-2">Leave blank to keep public. Set a password to restrict access.</p>
                  <input
                    type="password"
                    value={treePassword || ''}
                    onChange={(e) => setTreePassword(e.target.value)}
                    placeholder="Set password (leave blank = public)"
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                  />
                  {treePassword && <p className="text-xs text-amber-400 mt-1">A password will be set on save.</p>}
                </div>

                {/* Scheduled Activation */}
                <div className="pt-1 border-t border-[hsl(230,10%,18%)]">
                  <label className="block text-sm font-medium text-slate-300 mb-1 mt-3">Scheduled Activation</label>
                  <p className="text-xs text-slate-500 mb-3">Optionally restrict when your LinkTree is publicly accessible.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Publish at</label>
                      <input
                        type="datetime-local"
                        value={publishAt || ''}
                        onChange={(e) => setPublishAt(e.target.value || null)}
                        className="w-full px-2 py-1.5 text-xs text-slate-300 rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Unpublish at</label>
                      <input
                        type="datetime-local"
                        value={unpublishAt || ''}
                        onChange={(e) => setUnpublishAt(e.target.value || null)}
                        className="w-full px-2 py-1.5 text-xs text-slate-300 rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-4 pt-1 pb-4">
                {linkTreeId ? (
                  <LinktreeAnalytics linkTreeId={linkTreeId} slug={profile?.slug} />
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Save your LinkTree first to see analytics</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <SaveStatus
        saveLinkTree={saveLinkTree}
        saveError={saveError}
        saveSuccess={saveSuccess}
        isSaving={isSaving}
        linkTreeId={linkTreeId}
        setLinkTreeId={setLinkTreeId}
        slug={slug}
        isCreate={createMode}
      />
    </motion.div>
  );
};
Sidebar.propTypes = {
  profile: PropTypes.object.isRequired,
  setProfile: PropTypes.func.isRequired,
  links: PropTypes.array.isRequired,
  setLinks: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  saveLinkTree: PropTypes.func.isRequired,
  saveError: PropTypes.string,
  saveSuccess: PropTypes.bool,
  isSaving: PropTypes.bool.isRequired,
  linkTreeId: PropTypes.string,
  setLinkTreeId: PropTypes.func.isRequired,
  slug: PropTypes.string,
  setSlug: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  setTitle: PropTypes.func.isRequired,
  treePassword: PropTypes.string,
  setTreePassword: PropTypes.func,
  publishAt: PropTypes.string,
  setPublishAt: PropTypes.func,
  unpublishAt: PropTypes.string,
  setUnpublishAt: PropTypes.func,
};

export default Sidebar;
