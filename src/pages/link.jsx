import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    Copy,
    Download,
    Trash,
    ExternalLink,
    Check,
    ChevronUp,
    Settings,
    BarChart3,
    ArrowLeft,
    Calendar,
    MousePointerClick,
    Users,
    TrendingUp,
    Eye,
    QrCode,
    Share2,
    Lock,
    EyeOff,
    Clock,
    Code2,
    Save,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { BarLoader, BeatLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlState } from "@/context";
import { getClicksForUrl } from "@/api/clicks";
import { deleteUrl, getUrl, updateUrl } from "@/api/urls";
import { getPixels, getUrlPixels, attachPixelToUrl, detachPixelFromUrl } from "@/api/pixels";
import useFetch from "@/hooks/use-fetch";
import DeviceStats from "@/components/device-stats";
import Location from "@/components/location-stats";
import { SEOMetadata } from "@/components/seo-metadata";
import TargetingRules from "@/components/targeting-rules";
import UTMBuilder from "@/components/utm-builder";
import ABTestingPanel from "@/components/ab-testing-panel";

const LinkPage = () => {
    const [copied, setCopied] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [targetingRules, setTargetingRules] = useState([]);
    const [activeTab, setActiveTab] = useState("analytics");

    // Settings form state
    const [settingsForm, setSettingsForm] = useState({
        title: "",
        password: "",
        clickLimit: "",
        expirationDate: "",
        activatesAt: "",
        deactivatesAt: "",
        isCloaked: false,
    });
    const [showSettingsPassword, setShowSettingsPassword] = useState(false);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [settingsError, setSettingsError] = useState("");

    // Pixels state
    const [allPixels, setAllPixels] = useState([]);
    const [urlPixelIds, setUrlPixelIds] = useState([]);
    const [pixelsLoading, setPixelsLoading] = useState(false);

    const navigate = useNavigate();
    const { user } = UrlState();
    const { id } = useParams();

    const {
        loading,
        data: url,
        fn,
        error,
    } = useFetch(getUrl, id);
    const {
        loading: loadingStats,
        data: stats,
        fn: fnStats,
    } = useFetch(getClicksForUrl, id);
    const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id);

    useEffect(() => {
        fn();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!error && loading === false) fnStats();
    }, [loading, error]);

    // Populate settings form when URL data loads
    useEffect(() => {
        if (url) {
            const toLocalDT = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : "";
            setSettingsForm({
                title: url.title || "",
                password: url.password || "",
                clickLimit: url.clickLimit ?? url.click_limit ?? "",
                expirationDate: toLocalDT(url.expiresAt || url.expires_at),
                activatesAt: toLocalDT(url.activatesAt || url.activates_at),
                deactivatesAt: toLocalDT(url.deactivatesAt || url.deactivates_at),
                isCloaked: url.isCloaked || url.is_cloaked || false,
            });
        }
    }, [url]);

    // Load pixels when settings tab is opened
    useEffect(() => {
        if (activeTab === "settings" && id && user) {
            setPixelsLoading(true);
            Promise.all([
                getPixels(user.id).catch(() => []),
                getUrlPixels(id).catch(() => []),
            ]).then(([all, attached]) => {
                setAllPixels(all || []);
                setUrlPixelIds((attached || []).map((p) => p.id));
            }).finally(() => setPixelsLoading(false));
        }
    }, [activeTab, id, user]);

    const saveSettings = async () => {
        setSettingsSaving(true);
        setSettingsError("");
        try {
            await updateUrl(id, {
                title: settingsForm.title || undefined,
                password: settingsForm.password || null,
                clickLimit: settingsForm.clickLimit !== "" ? parseInt(settingsForm.clickLimit) : null,
                expiresAt: settingsForm.expirationDate || null,
                activatesAt: settingsForm.activatesAt || null,
                deactivatesAt: settingsForm.deactivatesAt || null,
                isCloaked: settingsForm.isCloaked,
            });
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2500);
            fn(); // refresh URL data
        } catch (err) {
            setSettingsError(err.message || "Failed to save settings");
        } finally {
            setSettingsSaving(false);
        }
    };

    const togglePixel = async (pixelId) => {
        const isAttached = urlPixelIds.includes(pixelId);
        try {
            if (isAttached) {
                await detachPixelFromUrl(id, pixelId);
                setUrlPixelIds((prev) => prev.filter((pid) => pid !== pixelId));
            } else {
                await attachPixelToUrl(id, pixelId);
                setUrlPixelIds((prev) => [...prev, pixelId]);
            }
        } catch (err) {
            console.error("Pixel toggle error:", err);
        }
    };

    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    const scrollToTop = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });

    if (error) {
        navigate("/dashboard");
        return null;
    }

    const link =
        url?.custom_url || url?.customUrl || url?.short_url || url?.shortUrl;
    const fullUrl = `${import.meta.env.VITE_APP_URL || "https://trimlynk.com"}/${link}`;
    const originalUrl = url?.original_url || url?.originalUrl;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadImage = () => {
        const qrUrl = url?.qr || url?.qrCode;
        if (!qrUrl) return;
        const anchor = document.createElement("a");
        anchor.href = qrUrl;
        anchor.download = url?.title || "qr-code";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    const tabs = [
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    const uniqueVisitors = stats
        ? new Set(stats.map((s) => s.ip_hash || s.ipHash)).size
        : 0;

    return (
        <>
            <SEOMetadata
                title={`${url?.title || "Link"} - Analytics | TrimLink`}
                description="View detailed analytics for your link."
                canonical={`${import.meta.env.VITE_APP_URL || "https://trimlynk.com"}/dashboard`}
            />

            <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 lg:p-8">
                {(loading || loadingStats) && (
                    <div className="fixed top-0 left-0 right-0 z-50">
                        <BarLoader width="100%" color="#2563eb" />
                    </div>
                )}

                <div className="max-w-6xl mx-auto">
                    {/* Back button */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-sm">Back to Dashboard</span>
                        </Link>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar - Link Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:w-80 space-y-4"
                        >
                            <div className="relative rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden">
                                {/* Accent line */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-violet-500 to-blue-600" />

                                <div className="p-5 space-y-4">
                                    <div>
                                        <h1 className="text-xl font-bold text-white">
                                            {url?.title}
                                        </h1>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Calendar className="w-3 h-3 text-slate-600" />
                                            <p className="text-xs text-slate-600">
                                                {url?.created_at || url?.createdAt
                                                    ? new Date(
                                                          url?.created_at || url?.createdAt
                                                      ).toLocaleDateString("en-US", {
                                                          month: "short",
                                                          day: "numeric",
                                                          year: "numeric",
                                                      })
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Short URL */}
                                    <div className="p-3 rounded-xl bg-[hsl(230,10%,12%)] border border-[hsl(230,10%,18%)]">
                                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium mb-1">
                                            Short URL
                                        </p>
                                        <a
                                            href={fullUrl}
                                            target="_blank"
                                            className="group flex items-center gap-2 text-blue-400 font-mono text-sm hover:text-blue-300 transition-colors"
                                        >
                                            <span className="truncate">{fullUrl}</span>
                                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </div>

                                    {/* Destination */}
                                    <div className="p-3 rounded-xl bg-[hsl(230,10%,7%)]">
                                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium mb-1">
                                            Destination
                                        </p>
                                        <a
                                            href={originalUrl}
                                            target="_blank"
                                            className="text-slate-400 hover:text-white text-sm break-all transition-colors line-clamp-2"
                                        >
                                            {originalUrl}
                                        </a>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopy}
                                            className={`border-[hsl(230,10%,20%)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 text-slate-400 rounded-xl h-9 ${
                                                copied ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : ""
                                            }`}
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={downloadImage}
                                            className="border-[hsl(230,10%,20%)] hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-400 text-slate-400 rounded-xl h-9"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                fnDelete().then(() => navigate("/dashboard"))
                                            }
                                            disabled={loadingDelete}
                                            className="border-[hsl(230,10%,20%)] hover:bg-red-500/10 hover:border-red-500/30 text-red-400 rounded-xl h-9"
                                        >
                                            {loadingDelete ? (
                                                <BeatLoader size={4} color="white" />
                                            ) : (
                                                <Trash className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {/* QR Code */}
                                    {(url?.qr || url?.qrCode) && (
                                        <div className="relative group">
                                            <div className="p-3 bg-white rounded-xl">
                                                <img
                                                    src={url?.qr || url?.qrCode}
                                                    className="w-full rounded-lg"
                                                    alt="QR code"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    onClick={downloadImage}
                                                    className="p-2 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-colors"
                                                >
                                                    <Download className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex-1 min-w-0"
                        >
                            {/* Custom Tab Switcher */}
                            <div className="flex items-center gap-1 p-1 mb-6 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] w-fit">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            activeTab === tab.id
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "text-slate-500 hover:text-white"
                                        }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === "analytics" && (
                                    <motion.div
                                        key="analytics"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        {stats && stats.length > 0 ? (
                                            <>
                                                {/* Stats Summary */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    {[
                                                        {
                                                            label: "Total Clicks",
                                                            value: stats.length,
                                                            icon: MousePointerClick,
                                                            color: "text-blue-400",
                                                            bg: "bg-blue-500/10",
                                                        },
                                                        {
                                                            label: "Unique Visitors",
                                                            value: uniqueVisitors,
                                                            icon: Users,
                                                            color: "text-violet-400",
                                                            bg: "bg-violet-500/10",
                                                        },
                                                        {
                                                            label: "Daily Avg",
                                                            value: Math.round(stats.length / 7),
                                                            icon: TrendingUp,
                                                            color: "text-emerald-400",
                                                            bg: "bg-emerald-500/10",
                                                        },
                                                    ].map((stat, i) => (
                                                        <motion.div
                                                            key={stat.label}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4 text-center group hover:border-[hsl(230,10%,20%)] transition-colors"
                                                        >
                                                            <div className={`w-9 h-9 mx-auto rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                                                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                                            </div>
                                                            <p className="text-2xl font-bold text-white">
                                                                {stat.value}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                                                                {stat.label}
                                                            </p>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Location & Device Stats */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden">
                                                        <div className="px-5 py-4 border-b border-[hsl(230,10%,13%)]">
                                                            <h3 className="text-sm font-semibold text-white">
                                                                Location Data
                                                            </h3>
                                                        </div>
                                                        <div className="p-5">
                                                            <Location stats={stats} />
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden">
                                                        <div className="px-5 py-4 border-b border-[hsl(230,10%,13%)]">
                                                            <h3 className="text-sm font-semibold text-white">
                                                                Device Info
                                                            </h3>
                                                        </div>
                                                        <div className="p-5">
                                                            <DeviceStats stats={stats} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] py-20 text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(230,10%,14%)] flex items-center justify-center">
                                                    <BarChart3 className="w-8 h-8 text-slate-600" />
                                                </div>
                                                <p className="text-slate-400 font-medium">
                                                    No analytics data yet
                                                </p>
                                                <p className="text-slate-600 text-sm mt-1 max-w-xs mx-auto">
                                                    Data will appear when people start clicking
                                                    your link
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "settings" && (
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        {/* ── Link Settings Card ── */}
                                        <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden">
                                            <div className="px-5 py-4 border-b border-[hsl(230,10%,13%)] flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                    <Settings className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">Link Settings</h3>
                                                    <p className="text-[11px] text-slate-500">Edit protection, scheduling and behaviour</p>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-5">
                                                {/* Title */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Title</label>
                                                    <input
                                                        value={settingsForm.title}
                                                        onChange={(e) => setSettingsForm((f) => ({ ...f, title: e.target.value }))}
                                                        placeholder="Link title"
                                                        className="w-full h-10 px-3 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                    />
                                                </div>

                                                {/* Password */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Lock className="w-3 h-3 text-amber-400" /> Password Protection
                                                    </label>
                                                    <div className="flex items-center h-10 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)] transition-all focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20">
                                                        <Lock className="w-3.5 h-3.5 ml-3 text-slate-500 shrink-0" />
                                                        <input
                                                            type={showSettingsPassword ? "text" : "password"}
                                                            value={settingsForm.password}
                                                            onChange={(e) => setSettingsForm((f) => ({ ...f, password: e.target.value }))}
                                                            placeholder="Leave blank to remove password"
                                                            className="flex-1 h-full px-2.5 bg-transparent text-white placeholder:text-slate-600 text-sm focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowSettingsPassword((v) => !v)}
                                                            className="px-3 text-slate-500 hover:text-slate-300 transition-colors"
                                                        >
                                                            {showSettingsPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Click Limit + Expiration */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <MousePointerClick className="w-3 h-3 text-blue-400" /> Click Limit
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={settingsForm.clickLimit}
                                                            onChange={(e) => setSettingsForm((f) => ({ ...f, clickLimit: e.target.value }))}
                                                            placeholder="Unlimited"
                                                            className="w-full h-10 px-3 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Calendar className="w-3 h-3 text-pink-400" /> Expiration
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            value={settingsForm.expirationDate}
                                                            onChange={(e) => setSettingsForm((f) => ({ ...f, expirationDate: e.target.value }))}
                                                            className="w-full h-10 px-3 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all [color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Scheduling */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3 text-emerald-400" /> Activates At
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            value={settingsForm.activatesAt}
                                                            onChange={(e) => setSettingsForm((f) => ({ ...f, activatesAt: e.target.value }))}
                                                            className="w-full h-10 px-3 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all [color-scheme:dark]"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3 text-rose-400" /> Deactivates At
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            value={settingsForm.deactivatesAt}
                                                            onChange={(e) => setSettingsForm((f) => ({ ...f, deactivatesAt: e.target.value }))}
                                                            className="w-full h-10 px-3 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all [color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* URL Cloaking */}
                                                <div
                                                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-[hsl(230,10%,15%)] cursor-pointer"
                                                    onClick={() => setSettingsForm((f) => ({ ...f, isCloaked: !f.isCloaked }))}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                                            <EyeOff className="w-4 h-4 text-violet-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-200">URL Cloaking</p>
                                                            <p className="text-[11px] text-slate-500">Hide destination from the address bar</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`relative w-10 rounded-full transition-colors duration-200 ${settingsForm.isCloaked ? "bg-violet-600" : "bg-[hsl(230,10%,18%)]"}`}
                                                        style={{ minWidth: 40, height: 22 }}
                                                    >
                                                        <span
                                                            className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${settingsForm.isCloaked ? "translate-x-[18px]" : ""}`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Retargeting Pixels */}
                                                {(allPixels.length > 0 || pixelsLoading) && (
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Code2 className="w-3 h-3 text-pink-400" /> Retargeting Pixels
                                                        </label>
                                                        {pixelsLoading ? (
                                                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                                <Loader2 className="w-3 h-3 animate-spin" /> Loading pixels…
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2">
                                                                {allPixels.filter((p) => p.isActive).map((pixel) => {
                                                                    const attached = urlPixelIds.includes(pixel.id);
                                                                    return (
                                                                        <button
                                                                            key={pixel.id}
                                                                            type="button"
                                                                            onClick={() => togglePixel(pixel.id)}
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                                                                attached
                                                                                    ? "bg-pink-500/15 text-pink-400 border border-pink-500/30"
                                                                                    : "bg-white/[0.03] text-slate-400 border border-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)]"
                                                                            }`}
                                                                        >
                                                                            {attached && <Check className="w-3 h-3" />}
                                                                            {pixel.name}
                                                                            <span className="text-[10px] opacity-60">{pixel.type}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Error */}
                                                {settingsError && (
                                                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20">
                                                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                        <p className="text-sm text-red-300">{settingsError}</p>
                                                    </div>
                                                )}

                                                {/* Save Button */}
                                                <button
                                                    onClick={saveSettings}
                                                    disabled={settingsSaving}
                                                    className={`w-full h-10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                                                        settingsSaved
                                                            ? "bg-emerald-600 text-white"
                                                            : "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    }`}
                                                >
                                                    {settingsSaving ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                                    ) : settingsSaved ? (
                                                        <><Check className="w-4 h-4" /> Saved!</>
                                                    ) : (
                                                        <><Save className="w-4 h-4" /> Save Settings</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* A/B Testing */}
                                        {url?.id && (
                                            <ABTestingPanel
                                                urlId={url.id}
                                                urlTitle={url.title}
                                            />
                                        )}

                                        {/* Targeting Rules */}
                                        <TargetingRules
                                            rules={targetingRules}
                                            onAdd={(rule) =>
                                                setTargetingRules([
                                                    ...targetingRules,
                                                    { ...rule, id: Date.now() },
                                                ])
                                            }
                                            onRemove={(id) =>
                                                setTargetingRules(
                                                    targetingRules.filter((r) => r.id !== id)
                                                )
                                            }
                                            onUpdate={(id, data) =>
                                                setTargetingRules(
                                                    targetingRules.map((r) =>
                                                        r.id === id ? { ...r, ...data } : r
                                                    )
                                                )
                                            }
                                        />

                                        {/* UTM Builder */}
                                        <UTMBuilder url={originalUrl} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll to top */}
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={scrollToTop}
                            className="fixed bottom-8 right-8 p-3 bg-[hsl(230,10%,12%)] hover:bg-[hsl(230,10%,16%)] text-white rounded-xl border border-[hsl(230,10%,20%)] transition-colors shadow-lg"
                        >
                            <ChevronUp className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default LinkPage;
