import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    TrendingUp,
    Globe,
    Smartphone,
    Monitor,
    Tablet,
    Chrome,
    MousePointerClick,
    Users,
    Clock,
    ExternalLink
} from 'lucide-react';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[hsl(230,12%,9%)]/95 backdrop-blur-sm border border-[hsl(230,10%,20%)] rounded-lg p-3 shadow-xl">
                <p className="text-slate-300 font-medium mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Clicks Over Time Chart
export const ClicksTimeChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            clicks: item.count
        }));
    }, [data]);

    return (
        <Card className="bg-[hsl(230,10%,14%)]/50 backdrop-blur-sm border-[hsl(230,10%,20%)]/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Clicks Over Time
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="clicks"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fill="url(#clicksGradient)"
                                name="Clicks"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// Device Distribution Chart
export const DeviceChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => ({
            name: item.device || 'Unknown',
            value: item.count,
            icon: item.device === 'mobile' ? Smartphone : item.device === 'tablet' ? Tablet : Monitor
        }));
    }, [data]);

    return (
        <Card className="bg-[hsl(230,10%,14%)]/50 backdrop-blur-sm border-[hsl(230,10%,20%)]/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                    Device Distribution
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    {chartData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-slate-400 capitalize">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Top Countries Chart
export const CountryChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.slice(0, 8).map(item => ({
            country: item.country || 'Unknown',
            clicks: item.count
        }));
    }, [data]);

    return (
        <Card className="bg-[hsl(230,10%,14%)]/50 backdrop-blur-sm border-[hsl(230,10%,20%)]/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    Top Countries
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                            <YAxis dataKey="country" type="category" stroke="#9CA3AF" fontSize={11} width={110} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="clicks" name="Clicks" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// Browser Stats Chart
export const BrowserChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.slice(0, 6).map(item => ({
            name: item.browser || 'Unknown',
            value: item.count
        }));
    }, [data]);

    return (
        <Card className="bg-[hsl(230,10%,14%)]/50 backdrop-blur-sm border-[hsl(230,10%,20%)]/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Chrome className="w-5 h-5 text-blue-400" />
                    Browser Stats
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {chartData.map((item, index) => {
                        const max = Math.max(...chartData.map(d => d.value));
                        const percentage = (item.value / max) * 100;
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="space-y-1"
                            >
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300 capitalize">{item.name}</span>
                                    <span className="text-slate-500">{item.value.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-[hsl(230,10%,20%)] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// OS Distribution Chart
export const OSChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.slice(0, 6).map(item => ({
            name: item.os || 'Unknown',
            value: item.count
        }));
    }, [data]);

    if (!chartData.length) return null;

    return (
        <Card className="bg-[hsl(230,10%,14%)]/50 backdrop-blur-sm border-[hsl(230,10%,20%)]/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    Operating Systems
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {chartData.map((item, index) => {
                        const max = Math.max(...chartData.map(d => d.value));
                        const percentage = max > 0 ? (item.value / max) * 100 : 0;
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="space-y-1"
                            >
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300 capitalize">{item.name}</span>
                                    <span className="text-slate-500">{item.value.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-[hsl(230,10%,20%)] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// Top Referrers
export const ReferrerChart = ({ data }) => {
    return (
        <Card className="bg-[hsl(230,10%,14%)]/50 backdrop-blur-sm border-[hsl(230,10%,20%)]/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-pink-400" />
                    Top Referrers
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {(!data || data.length === 0) ? (
                        <p className="text-slate-500 text-sm text-center py-4">No referrer data available</p>
                    ) : (
                        data.slice(0, 5).map((item, index) => (
                            <motion.div
                                key={item.domain}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-2 rounded-lg bg-[hsl(230,12%,9%)]/30 hover:bg-[hsl(230,12%,9%)]/50 transition-colors"
                            >
                                <span className="text-slate-300 text-sm truncate flex-1">{item.domain}</span>
                                <span className="text-slate-500 text-sm ml-2">{item.count.toLocaleString()}</span>
                            </motion.div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Peak Hours Chart
export const PeakHoursChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        // Create 24-hour data
        const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, clicks: 0 }));
        data.forEach(item => {
            if (hours[item.hour]) hours[item.hour].clicks = item.count;
        });
        return hours.map(h => ({
            ...h,
            label: `${h.hour.toString().padStart(2, '0')}:00`
        }));
    }, [data]);

    return (
        <Card className="bg-[hsl(230,10%,14%)]/50 backdrop-blur-sm border-[hsl(230,10%,20%)]/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    Peak Hours
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="label" stroke="#9CA3AF" fontSize={10} interval={2} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="clicks" name="Clicks" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// Stats Summary Cards
export const StatsSummary = ({ totalClicks, uniqueVisitors, avgClicksPerDay }) => {
    const stats = [
        { label: 'Total Clicks', value: totalClicks, icon: MousePointerClick, color: 'blue' },
        { label: 'Unique Visitors', value: uniqueVisitors, icon: Users, color: 'purple' },
        { label: 'Avg. Daily Clicks', value: avgClicksPerDay, icon: TrendingUp, color: 'emerald' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className={`bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5 backdrop-blur-sm border-${stat.color}-500/20`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-1">
                                        {stat.value?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

export default {
    ClicksTimeChart,
    DeviceChart,
    CountryChart,
    BrowserChart,
    OSChart,
    ReferrerChart,
    PeakHoursChart,
    StatsSummary
};
