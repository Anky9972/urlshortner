import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Copy,
  QrCode,
  ExternalLink,
  Calendar,
  Share2,
  X,
  Link2,
  Clock,
  Hourglass,
  Inbox,
} from "lucide-react";
import QRCode from "qrcode.react";
import { toast } from "sonner";

const MyUrls = ({ onClose }) => {
  const [urls, setUrls] = useState([]);
  const [selectedQRUrl, setSelectedQRUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("freeUrls") || "[]");
    setUrls(stored);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const getDaysRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getDaysAgo = (createdAt) => {
    const diff = new Date() - new Date(createdAt);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleShareUrl = async (url) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Check out this link", url });
      } catch {
        /* cancelled */
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.info("URL copied — Web Share not supported on this browser.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      {/* Slide Panel */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] md:w-[460px] bg-[hsl(230,12%,7%)] border-l border-white/[0.06] shadow-[−20px_0_60px_-15px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">My URLs</h2>
              <p className="text-[11px] text-slate-500">
                {urls.length} shortened link{urls.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* URL List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {urls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Inbox className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">No URLs yet</p>
                <p className="text-xs text-slate-600 mt-1">
                  Shorten a URL from the homepage to see it here.
                </p>
              </div>
            </div>
          ) : (
            urls.map((url, idx) => {
              const shortUrl = `${window.location.origin}/${url.clause || url.short_code}`;
              const displayOriginal = url.original_url || url.clause || url.short_code;
              const daysLeft = getDaysRemaining(url.expires_at);
              const isExpiring = daysLeft <= 3;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] p-4 transition-all"
                >
                  {/* Short URL + Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 truncate flex items-center gap-1.5 transition-colors min-w-0"
                    >
                      <span className="truncate">{shortUrl.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleShareUrl(shortUrl)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(shortUrl, idx)}
                        className={`p-1.5 rounded-lg transition-all ${
                          copiedId === idx
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-slate-500 hover:text-white hover:bg-white/[0.06]"
                        }`}
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedQRUrl(selectedQRUrl === shortUrl ? null : shortUrl)}
                        className={`p-1.5 rounded-lg transition-all ${
                          selectedQRUrl === shortUrl
                            ? "text-blue-400 bg-blue-500/10"
                            : "text-slate-500 hover:text-white hover:bg-white/[0.06]"
                        }`}
                        title="QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Original URL */}
                  <p className="mt-2 text-xs text-slate-500 truncate" title={displayOriginal}>
                    {displayOriginal}
                  </p>

                  {/* QR Code */}
                  {selectedQRUrl === shortUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 flex justify-center"
                    >
                      <div className="bg-white p-3 rounded-xl">
                        <QRCode value={shortUrl} size={120} />
                      </div>
                    </motion.div>
                  )}

                  {/* Meta */}
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getDaysAgo(url.created_at)}
                    </span>
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${
                        isExpiring
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-slate-500 bg-white/[0.03]"
                      }`}
                    >
                      <Hourglass className="w-3 h-3" />
                      {daysLeft}d left
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {urls.length > 0 && (
          <div className="shrink-0 px-5 py-3 border-t border-white/[0.06]">
            <p className="text-[11px] text-slate-600 text-center">
              Free URLs expire after 30 days. Sign up for permanent links.
            </p>
          </div>
        )}
      </motion.aside>
    </>
  );
};

MyUrls.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default MyUrls;
