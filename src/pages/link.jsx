import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy, Download, LinkIcon, Trash, ExternalLink, Check, ChevronUp } from "lucide-react";
import { BarLoader, BeatLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlState } from "@/context";
import { getClicksForUrl } from "@/db/apiClicks";
import { deleteUrl, getUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import DeviceStats from "@/components/device-stats";
import Location from "@/components/location-stats";

const Link = () => {
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const { user } = UrlState();
  const { id } = useParams();

  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, { id, user_id: user?.id });

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksForUrl, id);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id);

  useEffect(() => {
    fn();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!error && loading === false) fnStats();
  }, [loading, error]);

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    navigate("/dashboard");
    return null;
  }

  const link = url?.custom_url || url?.short_url;
  const fullUrl = `https://trimlink.netlify.app/${link}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    const anchor = document.createElement("a");
    anchor.href = url?.qr;
    anchor.download = url?.title;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {(loading || loadingStats) && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <BarLoader width={"100%"} color="#36d7b7" />
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:flex-row justify-between">
        <div className="flex flex-col items-start gap-8 sm:w-2/5 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {url?.title}
          </h1>

          <div className="w-full p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
            <a
              href={fullUrl}
              target="_blank"
              className="group flex items-center gap-2 text-2xl sm:text-3xl text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              <span className="truncate">{fullUrl}</span>
              <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <a
            href={url?.original_url}
            target="_blank"
            className=" p-2 bg-gray-800/50 group flex items-center gap-2 text-gray-300 hover:text-white transition-colors backdrop-blur-sm rounded-lg border border-gray-700/50"
          >
            <LinkIcon className="w-8 h-8" />
            <span className="truncate text-wrap">{url?.original_url}</span>
            <ExternalLink className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <span className="text-sm text-gray-400">
            Created: {new Date(url?.created_at).toLocaleString()}
          </span>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleCopy}
              className="transition-all duration-300 hover:bg-blue-500/20"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              onClick={downloadImage}
              className="transition-all duration-300 hover:bg-purple-500/20"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => fnDelete().then(() => navigate("/dashboard"))}
              disabled={loadingDelete}
              className="transition-all duration-300 hover:bg-red-500/20"
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="relative group w-full">
            <img
              src={url?.qr}
              className="w-full rounded-lg ring-2 ring-blue-500/50 transition-all duration-300 group-hover:ring-blue-500 group-hover:shadow-xl"
              alt="QR code"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </div>
        </div>

        <div className="sm:w-3/5 space-y-6 animate-fade-in-up">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Statistics
              </CardTitle>
            </CardHeader>
            {stats && stats.length ? (
              <CardContent className="space-y-8">
                <Card className="bg-gray-800/80 border-gray-700/50 transform transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="text-2xl">Total Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-400">{stats?.length}</p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <CardTitle className="text-2xl">Location Data</CardTitle>
                  <Location stats={stats} />
                </div>

                <div className="space-y-4">
                  <CardTitle className="text-2xl">Device Information</CardTitle>
                  <DeviceStats stats={stats} />
                </div>
              </CardContent>
            ) : (
              <CardContent className="text-center py-12 text-gray-400">
                {loadingStats ? "Loading Statistics..." : "No Statistics Available"}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Link;