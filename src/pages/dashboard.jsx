import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { Filter, Link as LinkIcon, MousePointerClick, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LinkCard from "@/components/link-card";
import Error from "@/components/error";
import CreateLink from "@/components/create-link";

import useFetch from "@/hooks/use-fetch";
import { UrlState } from "@/context";
import { getUrls } from "@/db/apiUrls";
import { getClicksForUrls } from "@/db/apiClicks";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = UrlState();
  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls, user.id);
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(getClicksForUrls, urls?.map((url) => url.id));

  useEffect(() => {
    fnUrls();
  }, []);

  useEffect(() => {
    if (urls?.length) fnClicks();
  }, [urls?.length]);

  const filteredUrls = urls?.filter((url) =>
    url.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = loading || loadingClicks;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <BarLoader width={"100%"} color="#36d7b7" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="transform hover:scale-105 transition-all duration-300">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <LinkIcon className="w-6 h-6 text-blue-500" />
                Links Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {urls?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-all duration-300">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <MousePointerClick className="w-6 h-6 text-green-500" />
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {clicks?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1 transform hover:scale-105 transition-all duration-300">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Plus className="w-6 h-6 text-purple-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreateLink />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              My Links
            </h1>
            <div className="relative w-full sm:w-96">
              <Input
                type="text"
                placeholder="Filter Links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-10 py-2 w-full backdrop-blur-sm bg-white text-gray-500 dark:bg-gray-800/50 border-gray-900 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <Filter className="absolute top-2.5 right-3 text-gray-500 w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="animate-fade-in-down">
              <Error message={error?.message} />
            </div>
          )}

          <div className="grid gap-4">
            {(filteredUrls || []).map((url, i) => (
              <div
                key={i}
                className="transform hover:scale-[1.02] transition-all duration-300"
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.5s ease-out forwards ${i * 0.1}s`,
                }}
              >
                <LinkCard url={url} fetchUrls={fnUrls} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;