import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import supabase from ".././db/supabase";
import { Copy, QrCode, ExternalLink, Calendar, Share, X } from "lucide-react";
import QRCode from "qrcode.react";
import { toast } from "sonner";

const MyUrls = ({ setIsMyUrlsOpen }) => {
  const [urls, setUrls] = useState([]);
  const [selectedQRUrl, setSelectedQRUrl] = useState(null);

  useEffect(() => {
    const fetchUrls = async () => {
      const { data, error } = await supabase.from("free_services").select("*");
      if (!error) {
        setUrls(data);
      }
    };
    fetchUrls();
  }, []);

  const getDaysRemaining = (expiresAt) => {
    const today = new Date();
    const expiryDate = new Date(expiresAt);
    const daysRemaining = Math.ceil(
      (expiryDate - today) / (1000 * 60 * 60 * 24)
    );
    return daysRemaining;
  };

  const getDaysAgo = (createdAt) => {
    const today = new Date();
    const createdDate = new Date(createdAt);
    const daysAgo = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24));
    return daysAgo;
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleShareUrl = async (url) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this URL",
          text: "I want to share this URL with you",
          url: url,
        });
      } catch (error) {
        toast.error("Failed to share URL");
      }
    } else {
      handleCopyUrl(url);
      toast.info("Web Share not supported. URL copied to clipboard.");
    }
  };

  const handleExtendExpiry = async (urlId) => {
    try {
      const { error } = await supabase
        .from("free_services")
        .update({
          expires_at: new Date(new Date().setDate(new Date().getDate() + 30)),
        })
        .eq("id", urlId)
        .select();

      if (error) throw error;

      toast.success("URL expiry extended by 30 days");
      const { data: updatedUrls } = await supabase
        .from("free_services")
        .select("*");
      setUrls(updatedUrls);
    } catch (error) {
      toast.error("Failed to extend URL expiry");
    }
  };

  const toggleQRCode = (url) => {
    setSelectedQRUrl(selectedQRUrl === url ? null : url);
  };

  return (
    <motion.div
      className="fixed h-full z-50 top-16 right-0 w-full md:w-3/5 lg:w-2/5 bg-zinc-900 text-white p-5 overflow-y-auto shadow-xl border-l border-zinc-800"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">My URLs</h2>
        <button
          onClick={() => setIsMyUrlsOpen(false)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <ul className="space-y-3">
        {urls.length === 0 && (
          <li className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-xl">
            <div className="text-center text-zinc-500">No URLs found</div>
          </li>
        )}
        {urls.map((url, id) => {
          const displayUrl = url.clause ? url.original_url : url.short_code;
          const shortUrl = `${window.location.origin}/${url.clause || url.short_code
            }`;

          return (
            <li
              key={id}
              className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <a
                    href={shortUrl}
                    className="text-cyan-400 font-medium hover:text-cyan-300 flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortUrl}
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShareUrl(shortUrl)}
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Share size={14} />
                  </button>
                  <button
                    onClick={() => handleCopyUrl(shortUrl)}
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    onClick={() => toggleQRCode(shortUrl)}
                  >
                    <QrCode size={14} />
                  </button>
                </div>
              </div>

              {selectedQRUrl === shortUrl && (
                <div className="flex justify-center mt-3 bg-white p-3 rounded-lg w-fit mx-auto">
                  <QRCode value={shortUrl} size={120} />
                </div>
              )}

              <div className="w-full mt-2 text-sm text-zinc-400 truncate">
                Original: {displayUrl}
              </div>

              <div className="mt-3 flex justify-between items-center text-xs text-zinc-500">
                <span>Created {getDaysAgo(url.created_at)} days ago</span>
                <div className="flex items-center gap-2">
                  <span>{getDaysRemaining(url.expires_at)} days left</span>
                  <button
                    onClick={() => handleExtendExpiry(url.id)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
                  >
                    <Calendar size={12} className="mr-1" />
                    Extend
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};
MyUrls.propTypes = {
  setIsMyUrlsOpen: PropTypes.func.isRequired,
};

export default MyUrls;
