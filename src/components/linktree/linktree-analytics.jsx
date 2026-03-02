import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, MousePointerClick, Eye, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { getToken } from '@/api/token';

async function fetchAnalytics(linkTreeId) {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/linktrees/${linkTreeId}/analytics`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed');
    return res.json();
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
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: Eye, label: 'Total Views', value: data.viewCount, color: 'text-blue-400' },
                    { icon: MousePointerClick, label: 'Total Clicks', value: data.totalLinkClicks, color: 'text-emerald-400' },
                    { icon: TrendingUp, label: 'Overall CTR', value: data.viewCount > 0 ? `${((data.totalLinkClicks / data.viewCount) * 100).toFixed(1)}%` : '—', color: 'text-violet-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-3 text-center">
                        <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                        <p className="text-lg font-bold text-white">{value}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
                    </div>
                ))}
            </div>

            {/* Per-link clicks */}
            {data.links?.length > 0 && (
                <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4 space-y-3">
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5" /> Clicks per Link
                    </h3>
                    <div className="space-y-2.5">
                        {data.links.filter(l => l.type === 'link').map((link) => (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-1"
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-slate-300 truncate">{link.title}</span>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-400 shrink-0">
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-blue-400 font-medium">{link.clicks}</span>
                                        <span className="text-slate-600">({link.ctr}%)</span>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full bg-[hsl(230,10%,14%)] overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-blue-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(link.clicks / maxClicks) * 100}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {data.viewCount === 0 && (
                <p className="text-xs text-center text-slate-600 py-2">
                    No views yet — share your LinkTree at <span className="font-mono text-slate-500">/share/{slug}</span>
                </p>
            )}
        </div>
    );
}
