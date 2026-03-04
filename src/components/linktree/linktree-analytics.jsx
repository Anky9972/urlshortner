import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, MousePointerClick, Eye, TrendingUp,
    ExternalLink, Loader2, Smartphone, Monitor, Tablet,
    Link2
} from 'lucide-react';
import { getToken } from '@/api/token';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchAnalytics(linkTreeId) {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/linktrees/${linkTreeId}/analytics`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed');
    return res.json();
}

// ─── Mini SVG time-series chart ─────────────────────────────────────────────
function TimeSeriesChart({ data }) {
    if (!data || data.length === 0) return null;
    const W = 400, H = 80, PAD = 4;
    const maxVal = Math.max(...data.flatMap(d => [d.views, d.clicks]), 1);
    const pts = (key) =>
        data.map((d, i) => {
            const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
            const y = H - PAD - ((d[key] / maxVal) * (H - PAD * 2));
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    const labels = data.filter((_, i) => i % 7 === 0 || i === data.length - 1);
    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polyline points={pts('views')} fill="url(#viewsGrad)" stroke="none" />
                <polyline points={pts('clicks')} fill="url(#clicksGrad)" stroke="none" />
                <polyline points={pts('views')} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={pts('clicks')} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex justify-between mt-1">
                {labels.map(d => (
                    <span key={d.date} className="text-[9px] text-slate-600">{d.date.slice(5)}</span>
                ))}
            </div>
        </div>
    );
}

// ─── Device breakdown ────────────────────────────────────────────────────────
const DEVICE_ICONS = { mobile: Smartphone, tablet: Tablet, desktop: Monitor, unknown: Monitor };
const DEVICE_COLOR = { mobile: 'bg-blue-500', tablet: 'bg-violet-500', desktop: 'bg-emerald-500', unknown: 'bg-slate-600' };
function DeviceBreakdown({ data }) {
    if (!data || data.length === 0) return <p className="text-xs text-slate-600 py-1">No device data yet</p>;
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    return (
        <div className="space-y-2">
            {data.sort((a, b) => b.count - a.count).map(({ device, count }) => {
                const Icon = DEVICE_ICONS[device] || Monitor;
                const pct = ((count / total) * 100).toFixed(0);
                return (
                    <div key={device} className="flex items-center gap-2 text-xs">
                        <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="w-14 capitalize text-slate-300 shrink-0">{device}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[hsl(230,10%,14%)] overflow-hidden">
                            <motion.div className={`h-full rounded-full ${DEVICE_COLOR[device] || 'bg-slate-500'}`}
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                        </div>
                        <span className="text-slate-500 w-8 text-right shrink-0">{pct}%</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Referrer breakdown ──────────────────────────────────────────────────────
function ReferrerBreakdown({ data }) {
    if (!data || data.length === 0) return <p className="text-xs text-slate-600 py-1">No referrer data yet</p>;
    const maxCount = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="space-y-2">
            {data.map(({ referrer, count }) => (
                <div key={referrer} className="flex items-center gap-2 text-xs">
                    <Link2 className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="flex-1 text-slate-300 truncate">{referrer}</span>
                    <div className="w-20 h-1.5 rounded-full bg-[hsl(230,10%,14%)] overflow-hidden shrink-0">
                        <motion.div className="h-full rounded-full bg-orange-500"
                            initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                    </div>
                    <span className="text-slate-500 w-6 text-right shrink-0">{count}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Click Heatmap (positional) ─────────────────────────────────────────────
function ClickHeatmap({ links }) {
    const linkLinks = (links || []).filter(l => l.type === 'link');
    if (linkLinks.length === 0) return <p className="text-xs text-slate-600 py-1">No link data yet</p>;
    const maxClicks = Math.max(...linkLinks.map(l => l.clicks), 1);
    return (
        <div className="space-y-1.5">
            {linkLinks.map((link, i) => {
                const heat = link.clicks / maxClicks; // 0-1
                // interpolate blue(cold) → amber → red(hot)
                const r = Math.round(heat < 0.5 ? 59 + (229 - 59) * (heat * 2) : 229);
                const g = Math.round(heat < 0.5 ? 130 * heat * 2 : 130 * (1 - (heat - 0.5) * 2));
                const b = Math.round(heat < 0.5 ? 246 * (1 - heat * 2) : 0);
                const color = `rgb(${r},${g},${b})`;
                return (
                    <div key={link.id} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600 w-4 text-right shrink-0 font-mono">{i + 1}</span>
                        <div className="flex-1 rounded-md overflow-hidden h-6 bg-[hsl(230,10%,14%)] relative">
                            <motion.div
                                className="h-full rounded-md"
                                style={{ backgroundColor: color, opacity: 0.7 + heat * 0.3 }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(heat * 100, link.clicks > 0 ? 4 : 0)}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                            <span className="absolute inset-0 flex items-center px-2 text-white/90 font-medium truncate" style={{ fontSize: '10px' }}>
                                {link.title}
                            </span>
                        </div>
                        <span className="text-slate-400 w-8 text-right shrink-0 font-mono">{link.clicks}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function LinktreeAnalytics({ linkTreeId, slug }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!linkTreeId) return;
        setLoading(true);
        fetchAnalytics(linkTreeId)
            .then(setData)
            .catch(err => console.error('Analytics fetch failed', err))
            .finally(() => setLoading(false));
    }, [linkTreeId]);

    if (!linkTreeId) return null;

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const maxClicks = Math.max(...(data.links?.map(l => l.clicks) || [1]), 1);

    return (
        <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: Eye, label: 'Total Views', value: data.viewCount, color: 'text-blue-400' },
                    { icon: MousePointerClick, label: 'Total Clicks', value: data.totalLinkClicks, color: 'text-emerald-400' },
                    {
                        icon: TrendingUp, label: 'Overall CTR',
                        value: data.viewCount > 0 ? `${((data.totalLinkClicks / data.viewCount) * 100).toFixed(1)}%` : '—',
                        color: 'text-violet-400'
                    },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-3 text-center">
                        <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                        <p className="text-lg font-bold text-white">{value}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
                    </div>
                ))}
            </div>

            {/* 30-day time-series chart */}
            {data.timeSeries && (
                <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> Last 30 Days
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> Views
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> Clicks
                            </span>
                        </div>
                    </div>
                    <TimeSeriesChart data={data.timeSeries} />
                </div>
            )}

            {/* Per-link clicks */}
            {data.links?.filter(l => l.type === 'link').length > 0 && (
                <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4 space-y-3">
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5" /> Clicks per Link
                    </h3>
                    <div className="space-y-2.5">
                        {data.links.filter(l => l.type === 'link').map((link) => (
                            <motion.div key={link.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-slate-300 truncate">{link.title}</span>
                                        {link.url && (
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-400 shrink-0">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-blue-400 font-medium">{link.clicks}</span>
                                        <span className="text-slate-600">({link.ctr}%)</span>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full bg-[hsl(230,10%,14%)] overflow-hidden">
                                    <motion.div className="h-full rounded-full bg-blue-500"
                                        initial={{ width: 0 }} animate={{ width: `${(link.clicks / maxClicks) * 100}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Devices + Referrers */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4">
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <Smartphone className="w-3.5 h-3.5" /> Devices
                    </h3>
                    <DeviceBreakdown data={data.deviceBreakdown} />
                </div>
                <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4">
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <Link2 className="w-3.5 h-3.5" /> Referrers
                    </h3>
                    <ReferrerBreakdown data={data.referrerBreakdown} />
                </div>
            </div>

            {/* Click Heatmap */}
            {data.links?.filter(l => l.type === 'link').length > 0 && (
                <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4 space-y-3">
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5" /> Click Heatmap
                    </h3>
                    <p className="text-[10px] text-slate-600">Color intensity shows relative click heat per position.</p>
                    <ClickHeatmap links={data.links} />
                </div>
            )}

            {data.viewCount === 0 && (
                <p className="text-xs text-center text-slate-600 py-2">
                    No views yet — share your LinkTree at{' '}
                    <span className="font-mono text-slate-500">/share/{slug}</span>
                </p>
            )}
        </div>
    );
}
