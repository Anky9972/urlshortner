import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy, Download, Trash, ExternalLink, Check, ChevronUp, Settings, BarChart3, ArrowLeft, GitBranch } from "lucide-react";
import { BarLoader, BeatLoader } from "react-spinners";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { UrlState } from "@/context";
import { getClicksForUrl } from "@/api/clicks";
import { deleteUrl, getUrl } from "@/api/urls";
import useFetch from "@/hooks/use-fetch";
import DeviceStats from "@/components/device-stats";
import Location from "@/components/location-stats";
import { SEOMetadata } from "@/components/seo-metadata";
import TargetingRules from "@/components/targeting-rules";
import UTMBuilder from "@/components/utm-builder";
import ABTestingPanel from "@/components/ab-testing-panel";
import { Link } from "react-router-dom";

const LinkPage = () => {
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [targetingRules, setTargetingRules] = useState([]);
  const [activeTab, setActiveTab] = useState("analytics");

  const navigate = useNavigate();
  const { user } = UrlState();
  const { id } = useParams();

  const { loading, data: url, fn, error } = useFetch(getUrl, { id, user_id: user?.id });
  const { loading: loadingStats, data: stats, fn: fnStats } = useFetch(getClicksForUrl, id);
  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id);

  useEffect(() => {
    fn();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!error && loading === false) fnStats();
  }, [loading, error]);

  const handleScroll = () => setShowScrollTop(window.scrollY > 200);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (error) {
    navigate("/dashboard");
    return null;
  }

  const link = url?.custom_url || url?.customUrl || url?.short_url || url?.shortUrl;
  const fullUrl = `https://trimlynk.com/${link}`;
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
    anchor.download = url?.title || 'qr-code';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <>
      <SEOMetadata
        title={`${url?.title || 'Link'} - Analytics | TrimLink`}
        description="View detailed analytics for your link."
        canonical="https://trimlynk.com/dashboard"
      />

      <div className="min-h-screen bg-zinc-950 p-4 lg:p-8">
        {(loading || loadingStats) && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <BarLoader width="100%" color="#06b6d4" />
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Link Info */}
            <div className="lg:w-80 space-y-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-5 space-y-4">
                  <h1 className="text-xl font-semibold text-white">{url?.title}</h1>

                  <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                    <a
                      href={fullUrl}
                      target="_blank"
                      className="group flex items-center gap-2 text-cyan-400 font-medium hover:text-cyan-300 transition-colors text-sm"
                    >
                      <span className="truncate">{fullUrl}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-800/50">
                    <p className="text-xs text-zinc-500 mb-1">Destination</p>
                    <a href={originalUrl} target="_blank" className="text-zinc-400 hover:text-white text-sm break-all transition-colors">
                      {originalUrl}
                    </a>
                  </div>

                  <p className="text-xs text-zinc-600">
                    Created: {url?.created_at || url?.createdAt ? new Date(url?.created_at || url?.createdAt).toLocaleDateString() : 'N/A'}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-1 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadImage}
                      className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fnDelete().then(() => navigate("/dashboard"))}
                      disabled={loadingDelete}
                      className="border-zinc-700 hover:bg-red-500/10 hover:border-red-500/30 text-red-400"
                    >
                      {loadingDelete ? <BeatLoader size={4} color="white" /> : <Trash className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* QR Code */}
                  {(url?.qr || url?.qrCode) && (
                    <div className="p-3 bg-white rounded-lg">
                      <img src={url?.qr || url?.qrCode} className="w-full" alt="QR code" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1 mb-6">
                  <TabsTrigger value="analytics" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-6">
                  {stats && stats.length > 0 ? (
                    <>
                      {/* Stats Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-semibold text-white">{stats.length}</p>
                            <p className="text-xs text-zinc-500 mt-1">Total Clicks</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-semibold text-white">
                              {new Set(stats.map(s => s.ip_hash || s.ipHash)).size}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">Unique Visitors</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-semibold text-white">{Math.round(stats.length / 7)}</p>
                            <p className="text-xs text-zinc-500 mt-1">Daily Avg</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Location & Device Stats */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Location Data</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Location stats={stats} />
                          </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Device Info</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <DeviceStats stats={stats} />
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="py-16 text-center">
                        <BarChart3 className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-400">No analytics data yet</p>
                        <p className="text-zinc-600 text-sm mt-1">Data will appear when people click your link</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  {/* A/B Split Testing */}
                  {url?.id && (
                    <ABTestingPanel urlId={url.id} urlTitle={url.title} />
                  )}

                  <TargetingRules
                    rules={targetingRules}
                    onAdd={(rule) => setTargetingRules([...targetingRules, { ...rule, id: Date.now() }])}
                    onRemove={(id) => setTargetingRules(targetingRules.filter(r => r.id !== id))}
                    onUpdate={(id, data) => setTargetingRules(targetingRules.map(r => r.id === id ? { ...r, ...data } : r))}
                  />
                  <UTMBuilder url={originalUrl} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full border border-zinc-700 transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </>
  );
};

export default LinkPage;