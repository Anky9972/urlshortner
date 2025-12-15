import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, CheckCircle2, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { UrlState } from "@/context";

const DomainsTab = () => {
    const { user } = UrlState();
    const [domains, setDomains] = useState([]);
    const [newDomain, setNewDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState('');

    useEffect(() => {
        if (user) loadDomains();
    }, [user]);

    const loadDomains = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/domains`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (res.ok) setDomains(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddDomain = async (e) => {
        e.preventDefault();
        if (!newDomain) return;
        setIsLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/domains`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ domain: newDomain })
            });

            if (res.ok) {
                await loadDomains();
                setNewDomain('');
            }
        } catch (error) {
            console.error('Failed to add domain');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (id) => {
        setIsVerifying(id);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/domains/${id}/verify`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (res.ok) {
                await loadDomains();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsVerifying('');
        }
    };

    return (
        <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-purple-400" />
                        Custom Domains
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Connect your own domain to brand your short links (e.g., links.mybrand.com).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddDomain} className="flex gap-4 mb-8">
                        <div className="flex-1">
                            <Input
                                placeholder="links.yourdomain.com"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || !newDomain} className="bg-purple-600 hover:bg-purple-700">
                            {isLoading ? 'Adding...' : <><Plus className="mr-2 h-4 w-4" /> Add Domain</>}
                        </Button>
                    </form>

                    <div className="space-y-4">
                        {domains.map(domain => (
                            <div key={domain.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${domain.verified ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                                        <Globe className={`h-5 w-5 ${domain.verified ? 'text-green-500' : 'text-yellow-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{domain.domain}</h3>
                                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                                            {domain.verified ? (
                                                <span className="flex items-center text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</span>
                                            ) : (
                                                <span className="flex items-center text-yellow-400"><AlertTriangle className="h-3 w-3 mr-1" /> Unverified</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!domain.verified && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            onClick={() => handleVerify(domain.id)}
                                            disabled={isVerifying === domain.id}
                                        >
                                            {isVerifying === domain.id ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                                            Verify DNS
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {domains.length === 0 && (
                            <div className="text-center py-8 text-zinc-500 text-sm">
                                No custom domains added yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm text-zinc-300">
                <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> configuration Instructions
                </h4>
                <p>To verify your domain, create a <b>CNAME</b> record pointing to <code>cname.trimlink.com</code> and a <b>TXT</b> record with your verification code (click verify to see details).</p>
            </div>
        </div>
    );
};

export default DomainsTab;
