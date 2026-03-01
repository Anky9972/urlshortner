import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Shield, Search, Terminal } from "lucide-react";
import { UrlState } from "@/context";
import { format } from 'date-fns';

const AuditLogViewer = () => {
    const { user } = UrlState();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchLogs();
    }, [user]);

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/audit`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (res.ok) {
                setLogs(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('DELETE')) return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (action.includes('UPDATE')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (action.includes('CREATE')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    };

    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-slate-400" />
                    Security Audit Logs
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Track sensitive actions and security events on your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-[hsl(230,10%,15%)] bg-[hsl(230,15%,5%)]/50">
                    <div className="flex items-center gap-2 p-3 border-b border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)]/50 text-xs font-mono text-slate-500">
                        <Terminal className="h-3 w-3" />
                        <span>Recent Activity Log</span>
                    </div>
                    <ScrollArea className="h-[400px]">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500 text-sm">Loading logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No activity recorded yet.</div>
                        ) : (
                            <div className="divide-y divide-[hsl(230,10%,15%)]/50">
                                {logs.map((log) => (
                                    <div key={log.id} className="p-4 hover:bg-[hsl(230,12%,9%)]/30 transition-colors flex items-start gap-4">
                                        <div className="min-w-[140px] text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                                <span className="text-sm font-medium text-slate-300">
                                                    {log.entityType}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-mono">
                                                {JSON.stringify(log.details)}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs text-slate-600">
                                            {log.ipAddress}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
};

export default AuditLogViewer;
