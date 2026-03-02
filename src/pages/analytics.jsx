import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import {
    BarChart3,
    TrendingUp,
    MousePointerClick,
    Globe,
    Smartphone,
    Monitor,
    Tablet,
    Link as LinkIcon,
    ArrowUpRight,
    Zap,
    Eye,
    Users,
    Map,
    SlidersHorizontal,
} from "lucide-react";
import ClickMap from "@/components/click-map";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { UrlState } from "@/context";
import { getUrls } from "@/api/urls";
import { getClicksForUrls } from "@/api/clicks";
import useFetch from "@/hooks/use-fetch";
import { SEOMetadata } from "@/components/seo-metadata";

const AnimatedBar = ({ percentage, color, delay = 0 }) => (
    <div className="h-1.5 bg-[hsl(230,10%,14%)] rounded-full overflow-hidden">
        <motion.div
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
    </div>
);

const WIDGETS_KEY = 'trimlink_analytics_widgets';
const DEFAULT_WIDGETS = { devices: true, countries: true, map: true, topLinks: true };

const Analytics = () => {
    const { user } = UrlState();
    const [timeRange, setTimeRange] = useState("7d");
    const [showCustomize, setShowCustomize] = useState(false);
    const [widgets, setWidgets] = useState(() => {
        try {
            return { ...DEFAULT_WIDGETS, ...JSON.parse(localStorage.getItem(WIDGETS_KEY) || '{}') };
        } catch { return DEFAULT_WIDGETS; }
    });

    const toggleWidget = (key) => {
        setWidgets(prev => {
            const next = { ...prev, [key]: !prev[key] };
            try { localStorage.setItem(WIDGETS_KEY, JSON.stringify(next)); } catch {}
            return next;
        });
    };

    const { loading, data: urls, fn: fnUrls } = useFetch(getUrls, user?.id);
    const { loading: loadingClicks, data: clicks, fn: fnClicks } = useFetch(
        getClicksForUrls,
        urls?.map((url) => url.id)
    );

    useEffect(() => {
        if (user?.id) fnUrls();
    }, [user?.id]);

    useEffect(() => {
        if (urls?.length) fnClicks();
    }, [urls?.length]);

    const isLoading = loading || loadingClicks;
    const totalClicks = clicks?.length || 0;
    const totalLinks = urls?.length || 0;

    // Group by device
    const deviceStats = clicks?.reduce((acc, click) => {
        const device = click.device || "desktop";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
    }, {}) || {};

    // Group by country
    const countryStats = clicks?.reduce((acc, click) => {
        const country = click.country || "Unknown";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
    }, {}) || {};

    const topCountries = Object.entries(countryStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Unique visitors estimate
    const uniqueVisitors = clicks
        ? new Set(clicks.map((c) => c.ip_hash || c.ipHash || c.ip)).size
        : 0;

    const deviceIcons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };
    const deviceColors = {
        mobile: "bg-violet-500",
        desktop: "bg-blue-500",
        tablet: "bg-emerald-500",
    };

    const timeRanges = [
        { value: "24h", label: "24h" },
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
        { value: "all", label: "All time" },
    ];

    const statCards = [
        {
            icon: MousePointerClick,
            label: "Total Clicks",
            value: totalClicks,
            accent: "from-blue-500/20 to-blue-600/0",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-400",
        },
        {
            icon: LinkIcon,
            label: "Active Links",
            value: totalLinks,
            accent: "from-emerald-500/20 to-emerald-600/0",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
        },
        {
            icon: Eye,
            label: "Unique Visitors",
            value: uniqueVisitors,
            accent: "from-violet-500/20 to-violet-600/0",
            iconBg: "bg-violet-500/10",
            iconColor: "text-violet-400",
        },
        {
            icon: Globe,
            label: "Countries",
            value: Object.keys(countryStats).length,
            accent: "from-amber-500/20 to-amber-600/0",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-400",
        },
    ];

    return (
        <>
            <SEOMetadata
                title="Analytics | TrimLink"
                description="View detailed analytics for your shortened URLs."
                canonical={`${import.meta.env.VITE_APP_URL || "https://trimlynk.com"}/analytics`}
            />

            <div className="min-h-screen bg-[hsl(230,15%,5%)]">
                {isLoading && (
                    <div className="fixed top-16 left-0 right-0 z-50">
                        <BarLoader width="100%" height={2} color="#2563eb" />
                    </div>
                )}

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Analytics
                                </h1>
                                <p className="text-slate-500 text-sm">
                                    Track your link performance
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)]">
                                {timeRanges.map((range) => (
                                    <button
                                        key={range.value}
                                        onClick={() => setTimeRange(range.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            timeRange === range.value
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "text-slate-500 hover:text-white"
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowCustomize(p => !p)}
                                    className={`p-2 rounded-xl border transition-all ${showCustomize ? 'bg-blue-600/10 border-blue-500/40 text-blue-400' : 'bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-slate-500 hover:text-white'}`}
                                    title="Customize widgets"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                </button>
                                <AnimatePresence>
                                    {showCustomize && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                            className="absolute right-0 top-11 z-30 w-52 rounded-2xl border border-[hsl(230,10%,18%)] bg-[hsl(230,12%,8%)] shadow-2xl p-3 space-y-1"
                                        >
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider px-1 pb-1">Show Widgets</p>
                                            {[
                                                { key: 'devices',  label: 'Device Breakdown' },
                                                { key: 'countries', label: 'Top Countries' },
                                                { key: 'map',      label: 'Click World Map' },
                                                { key: 'topLinks', label: 'Top Links' },
                                            ].map(({ key, label }) => (
                                                <button key={key} onClick={() => toggleWidget(key)}
                                                    className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-[hsl(230,10%,14%)] transition-colors">
                                                    <span className="text-sm text-slate-300">{label}</span>
                                                    <div className={`w-9 h-5 rounded-full transition-colors ${widgets[key] ? 'bg-blue-600' : 'bg-[hsl(230,10%,20%)]'}`}>
                                                        <div className={`w-3.5 h-3.5 rounded-full bg-white m-0.5 transition-transform ${widgets[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {statCards.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="group relative rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden hover:border-[hsl(230,10%,20%)] transition-colors"
                            >
                                {/* Gradient accent */}
                                <div
                                    className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                />
                                <div className="relative p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                                            <stat.icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Device Breakdown */}
                        {widgets.devices && (<motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-[hsl(230,10%,13%)] flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-violet-400" />
                                    Devices
                                </h3>
                                {Object.keys(deviceStats).length > 0 && (
                                    <span className="text-[10px] text-slate-600 uppercase tracking-wider">
                                        {totalClicks} total
                                    </span>
                                )}
                            </div>
                            <div className="p-5">
                                {Object.keys(deviceStats).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(deviceStats).map(([device, count], i) => {
                                            const Icon = deviceIcons[device] || Monitor;
                                            const barColor = deviceColors[device] || "bg-slate-500";
                                            const percentage = totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0;
                                            return (
                                                <motion.div
                                                    key={device}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + i * 0.08 }}
                                                    className="group/device"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-[hsl(230,10%,14%)] flex items-center justify-center group-hover/device:bg-[hsl(230,10%,17%)] transition-colors">
                                                            <Icon className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between mb-1.5">
                                                                <span className="text-sm text-white capitalize font-medium">{device}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-slate-500">{count}</span>
                                                                    <span className="text-xs font-semibold text-white bg-[hsl(230,10%,14%)] px-1.5 py-0.5 rounded">
                                                                        {percentage}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <AnimatedBar percentage={percentage} color={barColor} delay={0.3 + i * 0.1} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <Monitor className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                                        <p className="text-slate-600 text-sm">No device data yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>)}

                        {/* Top Countries */}
                        {widgets.countries && (<motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-[hsl(230,10%,13%)] flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-amber-400" />
                                    Top Countries
                                </h3>
                                {topCountries.length > 0 && (
                                    <span className="text-[10px] text-slate-600 uppercase tracking-wider">
                                        {Object.keys(countryStats).length} regions
                                    </span>
                                )}
                            </div>
                            <div className="p-5">
                                {topCountries.length > 0 ? (
                                    <div className="space-y-1">
                                        {topCountries.map(([country, count], i) => {
                                            const pct = totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0;
                                            return (
                                                <motion.div
                                                    key={country}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.35 + i * 0.06 }}
                                                    className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[hsl(230,10%,12%)] transition-colors group/row"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-[hsl(230,10%,14%)] text-[10px] font-bold text-slate-500 group-hover/row:text-amber-400 transition-colors">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-sm text-white font-medium">{country}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500">{count} clicks</span>
                                                        <span className="text-[10px] text-slate-600 font-mono">{pct}%</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <Globe className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                                        <p className="text-slate-600 text-sm">No location data yet</p>
                                    </div>
                                )}            
                            </div>
                        </motion.div>)}
                    </div>

                    {/* Click World Map */}
                    {widgets.map && (<motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-[hsl(230,10%,13%)]">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Map className="w-4 h-4 text-blue-400" />
                                Click World Map
                            </h3>
                        </div>
                        <div className="p-4">
                            <ClickMap clicks={clicks || []} />
                        </div>
                    </motion.div>)}

                    {/* Top Performing Links */}
                    {widgets.topLinks && (<motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-[hsl(230,10%,13%)] flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-400" />
                                Top Performing Links
                            </h3>
                            {urls && urls.length > 0 && (
                                <Link
                                    to="/dashboard"
                                    className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
                                >
                                    View all
                                </Link>
                            )}
                        </div>
                        <div className="divide-y divide-[hsl(230,10%,13%)]">
                            {urls && urls.length > 0 ? (
                                urls.slice(0, 5).map((url, i) => (
                                    <Link
                                        key={url.id}
                                        to={`/link/${url.id}`}
                                        className="flex items-center justify-between px-5 py-3.5 hover:bg-[hsl(230,10%,11%)] transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ${
                                                    i === 0
                                                        ? "bg-amber-500/10 text-amber-400"
                                                        : i === 1
                                                        ? "bg-slate-500/10 text-slate-400"
                                                        : i === 2
                                                        ? "bg-orange-500/10 text-orange-400"
                                                        : "bg-[hsl(230,10%,14%)] text-slate-500"
                                                }`}
                                            >
                                                {i + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">
                                                    {url.title}
                                                </p>
                                                <p className="text-xs text-slate-600 font-mono">
                                                    /{url.shortUrl || url.short_url || url.customUrl || url.custom_url}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-white">
                                                    {url._count?.clicks || url.currentClicks || url.current_clicks || 0}
                                                </p>
                                                <p className="text-[10px] text-slate-600">clicks</p>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-blue-400" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-14">
                                    <TrendingUp className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                                    <p className="text-slate-500 font-medium">No links yet</p>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Create your first shortened link to see analytics
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>)}
                </div>
            </div>
        </>
    );
};

export default Analytics;
