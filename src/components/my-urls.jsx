import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import supabase from ".././db/supabase";
import { Copy, QrCode, ExternalLink, Calendar, Share } from "lucide-react";
import QRCode from "qrcode.react";
import { toast } from "sonner";
import { IoClose } from "react-icons/io5";

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
      // Fallback for browsers that don't support Web Share API
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
    // If the same URL is clicked again, hide the QR code
    setSelectedQRUrl(selectedQRUrl === url ? null : url);
  };

  return (
    <motion.div
      className="fixed h-full z-50 top-16 border-t right-0 w-full md:w-3/5 lg:w-2/5 bg-gray-900 text-white p-4 overflow-y-auto shadow-md border-l"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">My URLs</h2>
        <button
          onClick={() => setIsMyUrlsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <IoClose />
        </button>
      </div>
      <ul className="space-y-4">
        {/* if not url  */}
        {urls.length === 0 && (
          <li className="bg-gray-800 p-4 rounded-md shadow-md">
            <div className="text-center text-gray-400">No URLs found</div>
          </li>
        )}
        {urls.map((url, id) => {
          const displayUrl = url.clause ? url.original_url : url.short_code;
          const shortUrl = `${window.location.origin}/${
            url.clause || url.short_code
          }`;

          return (
            <li
              key={id}
              className="bg-gray-800 p-4 rounded-md shadow-md transition-all duration-300 hover:bg-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <a
                    href={shortUrl}
                    className="text-blue-400 text-xl font-bold hover:text-blue-300 flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortUrl}
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleShareUrl(shortUrl)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Share size={16} />
                  </button>
                  <button
                    onClick={() => handleCopyUrl(shortUrl)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => toggleQRCode(shortUrl)}
                  >
                    <QrCode size={16} />
                  </button>
                </div>
              </div>

              {selectedQRUrl === shortUrl && (
                <div className="flex justify-center mt-2">
                  <QRCode value={shortUrl} />
                </div>
              )}

              <div className="w-full mt-2 text-sm text-gray-300 break-words">
                Original: {displayUrl}
              </div>

              <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                <span>Created {getDaysAgo(url.created_at)} days ago</span>
                <div className="flex items-center space-x-2">
                  <span>{getDaysRemaining(url.expires_at)} days left</span>
                  <button
                    onClick={() => handleExtendExpiry(url.id)}
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <Calendar size={12} className="mr-1" />
                    Extend
                  </button>
                </div>
                <span>
                  Expires: {new Date(url.expires_at).toLocaleDateString()}
                </span>
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
