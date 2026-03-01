import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    Loader2,
    Clock,
    ExternalLink,
    ChevronRight,
    Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getHealthSummary, getUnhealthyLinks, checkHealth, checkAllHealth } from '../api/health';
import { UrlState } from '../context';

const LinkHealthDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [unhealthyLinks, setUnhealthyLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [checkingLinkId, setCheckingLinkId] = useState(null);
    const [error, setError] = useState(null);

    const { user } = UrlState();

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user?.id]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [summaryData, unhealthyData] = await Promise.all([
                getHealthSummary(user.id),
                getUnhealthyLinks(user.id)
            ]);
            setSummary(summaryData);
            setUnhealthyLinks(unhealthyData);
        } catch (error) {
            console.error('Error fetching health data:', error);
            setError('Failed to load health data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckAll = async () => {
        setIsChecking(true);
        try {
            await checkAllHealth(user.id);
            // Wait a bit for checks to complete, then refresh
            setTimeout(() => {
                fetchData();
                setIsChecking(false);
            }, 3000);
        } catch (error) {
            setError(error.message);
            setIsChecking(false);
        }
    };

    const handleCheckOne = async (urlId) => {
        setCheckingLinkId(urlId);
        try {
            await checkHealth(urlId);
            await fetchData();
        } catch (error) {
            setError(error.message);
        } finally {
            setCheckingLinkId(null);
        }
    };

    const getHealthColor = (percentage) => {
        if (percentage >= 90) return 'text-emerald-400';
        if (percentage >= 70) return 'text-amber-400';
        return 'text-red-400';
    };

    const getHealthBg = (percentage) => {
        if (percentage >= 90) return 'bg-emerald-500';
        if (percentage >= 70) return 'bg-amber-500';
        return 'bg-red-500';
    };

    if (isLoading) {
        return (
            <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Link Health Monitor
                </CardTitle>
                <Button
                    onClick={handleCheckAll}
                    disabled={isChecking}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                    {isChecking ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Checking...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Check All
                        </>
                    )}
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Summary Stats */}
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-[hsl(230,10%,14%)]/50 border border-[hsl(230,10%,20%)] text-center">
                            <p className="text-2xl font-bold text-white">{summary.total}</p>
                            <p className="text-sm text-slate-500">Total Links</p>
                        </div>
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{summary.healthy}</p>
                            <p className="text-sm text-emerald-500/70">Healthy</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                            <p className="text-2xl font-bold text-red-400">{summary.unhealthy}</p>
                            <p className="text-sm text-red-500/70">Unhealthy</p>
                        </div>
                        <div className="p-4 rounded-lg bg-[hsl(230,10%,14%)]/50 border border-[hsl(230,10%,20%)] text-center">
                            <p className="text-2xl font-bold text-slate-400">{summary.unchecked}</p>
                            <p className="text-sm text-slate-500">Not Checked</p>
                        </div>
                    </div>
                )}

                {/* Health Score */}
                {summary && summary.total > 0 && (
                    <div className="p-4 rounded-lg bg-[hsl(230,10%,14%)]/30 border border-[hsl(230,10%,20%)]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Overall Health</span>
                            <span className={`text-lg font-bold ${getHealthColor(summary.healthPercentage)}`}>
                                {summary.healthPercentage}%
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-[hsl(230,10%,14%)] overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${getHealthBg(summary.healthPercentage)}`}
                                style={{ width: `${summary.healthPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Unhealthy Links */}
                {unhealthyLinks.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-400" />
                            Broken Links ({unhealthyLinks.length})
                        </h3>
                        <AnimatePresence>
                            {unhealthyLinks.map((link) => (
                                <motion.div
                                    key={link.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-medium text-white truncate">{link.title}</p>
                                            <p className="text-sm text-slate-500 truncate">{link.originalUrl}</p>
                                            {link.healthCheck && (
                                                <div className="flex items-center gap-3 mt-1 text-xs text-red-400">
                                                    {link.healthCheck.statusCode && (
                                                        <span>Status: {link.healthCheck.statusCode}</span>
                                                    )}
                                                    {link.healthCheck.errorMessage && (
                                                        <span>{link.healthCheck.errorMessage}</span>
                                                    )}
                                                    {link.healthCheck.responseTime && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {link.healthCheck.responseTime}ms
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCheckOne(link.id)}
                                            disabled={checkingLinkId === link.id}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            {checkingLinkId === link.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <a
                                            href={link.originalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-white p-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* All Healthy Message */}
                {summary && summary.unhealthy === 0 && summary.healthy > 0 && (
                    <div className="text-center py-6">
                        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                        <p className="text-emerald-400 font-medium">All links are healthy!</p>
                        <p className="text-sm text-slate-500 mt-1">
                            {summary.healthy} link{summary.healthy > 1 ? 's' : ''} verified
                        </p>
                    </div>
                )}

                {/* No Links Message */}
                {summary && summary.total === 0 && (
                    <div className="text-center py-6">
                        <Activity className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400">No links to monitor</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Create some links to start monitoring their health
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LinkHealthDashboard;
