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
    Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UrlState } from "@/context";
import { getUrls } from "@/api/urls";
import { getClicksForUrls } from "@/api/clicks";
import useFetch from "@/hooks/use-fetch";
import { SEOMetadata } from "@/components/seo-metadata";

const Analytics = () => {
    const { user } = UrlState();
    const [timeRange, setTimeRange] = useState("7d");

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
        const device = click.device || 'desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
    }, {}) || {};

    // Group by country
    const countryStats = clicks?.reduce((acc, click) => {
        const country = click.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
    }, {}) || {};

    const topCountries = Object.entries(countryStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const deviceIcons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };
    const timeRanges = [
        { value: "24h", label: "24h" },
        { value: "7d", label: "7d" },
        { value: "30d", label: "30d" },
        { value: "all", label: "All" },
    ];

    return (
        <>
            <SEOMetadata
                title="Analytics | TrimLink"
                description="View detailed analytics for your shortened URLs."
                canonical="https://trimlynk.com/analytics"
            />

            <div className="min-h-screen bg-zinc-950">
                {isLoading && (
                    <div className="fixed top-16 left-0 right-0 z-50">
                        <BarLoader width="100%" height={2} color="#06b6d4" />
                    </div>
                )}

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
                                <BarChart3 className="w-6 h-6 text-emerald-400" />
                                Analytics
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">Track your link performance</p>
                        </div>

                        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                            {timeRanges.map((range) => (
                                <Button
                                    key={range.value}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTimeRange(range.value)}
                                    className={`px-3 h-8 ${timeRange === range.value
                                        ? "bg-zinc-800 text-white"
                                        : "text-zinc-500 hover:text-white"
                                        }`}
                                >
                                    {range.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: MousePointerClick, label: "Total Clicks", value: totalClicks, color: "text-emerald-400" },
                            { icon: LinkIcon, label: "Active Links", value: totalLinks, color: "text-cyan-400" },
                            { icon: TrendingUp, label: "Daily Avg", value: Math.round(totalClicks / 7), color: "text-violet-400" },
                            { icon: Globe, label: "Countries", value: Object.keys(countryStats).length, color: "text-amber-400" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="bg-zinc-900 border-zinc-800">
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Device Breakdown */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    Devices
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(deviceStats).length > 0 ? (
                                        Object.entries(deviceStats).map(([device, count]) => {
                                            const Icon = deviceIcons[device] || Monitor;
                                            const percentage = totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0;
                                            return (
                                                <div key={device} className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-zinc-800">
                                                        <Icon className="w-4 h-4 text-zinc-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-sm text-white capitalize">{device}</span>
                                                            <span className="text-sm text-zinc-500">{percentage}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-zinc-800 rounded-full">
                                                            <div
                                                                className="h-full bg-cyan-500 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-zinc-600 text-sm text-center py-8">No data yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Countries */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Top Countries
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {topCountries.length > 0 ? (
                                        topCountries.map(([country, count], i) => (
                                            <div key={country} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-xs text-zinc-400">{i + 1}</span>
                                                    <span className="text-sm text-white">{country}</span>
                                                </div>
                                                <span className="text-sm text-zinc-500">{count} clicks</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-zinc-600 text-sm text-center py-8">No data yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Links */}
                    <Card className="bg-zinc-900 border-zinc-800 mt-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Top Performing Links
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {urls && urls.length > 0 ? (
                                <div className="space-y-2">
                                    {urls.slice(0, 5).map((url, i) => (
                                        <Link
                                            key={url.id}
                                            to={`/link/${url.id}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 flex items-center justify-center rounded bg-violet-500/10 text-violet-400 text-xs font-medium">
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm text-white group-hover:text-cyan-400 transition-colors">{url.title}</p>
                                                    <p className="text-xs text-zinc-600">/{url.shortUrl || url.short_url}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <span className="text-sm">{url._count?.clicks || url.currentClicks || 0}</span>
                                                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-600 text-sm text-center py-8">No links yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Analytics;
