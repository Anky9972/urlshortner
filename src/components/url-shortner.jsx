import { useState } from "react";
import {
  AlertCircle,
  Link as LinkIcon,
  Copy,
  QrCode,
  Clock,
  Star,
  ArrowRight,
  Check,
} from "lucide-react";
import QRCode from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const generateUniqueCode = () => {
  const shortCode = Math.random().toString(36).substring(2, 7);
  return { shortCode };
};

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [clause, setClause] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleShorten = async () => {
    setError("");
    setShortUrl("");
    setLoading(true);
    setShowQR(false);
    setCopied(false);

    if (!originalUrl) {
      setError("Please provide a valid URL");
      setLoading(false);
      return;
    }

    try {
      new URL(originalUrl);
      const { shortCode: generatedShortCode } = generateUniqueCode();

      const response = await fetch(`${API_URL}/api/free-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl,
          shortCode: generatedShortCode,
          clause: clause || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(data.error || "This custom clause is already in use. Try another one.");
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to shorten URL');
      }

      const clauseUrl = clause ? `${window.location.origin}/${clause}` : null;
      const shortCodeUrl = `${window.location.origin}/${generatedShortCode}`;

      setShortUrl(clauseUrl || shortCodeUrl);
      setShortCode(shortCodeUrl);
    } catch (err) {
      if (err.message.includes("Invalid URL")) {
        setError("Invalid URL format");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
      console.error("Error shortening URL:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Input Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Paste your long URL here..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
            />
          </div>
          <Button
            onClick={handleShorten}
            disabled={loading || !originalUrl}
            className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold h-12 px-6 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                Shortening...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Shorten
              </span>
            )}
          </Button>
        </div>

        {/* Custom Clause */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-zinc-500 text-sm">{window.location.origin}/</span>
          <Input
            type="text"
            placeholder="custom-alias (optional)"
            value={clause}
            onChange={(e) => setClause(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-9 max-w-[200px] text-sm"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Success Result */}
      {shortUrl && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-emerald-400 text-sm font-medium mb-1">Your shortened link:</p>
              <p className="text-white font-mono text-lg truncate">{shortUrl}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(shortUrl)}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowQR(!showQR)}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showQR && (
            <div className="mt-4 flex justify-center bg-white p-4 rounded-lg w-fit mx-auto">
              <QRCode value={shortUrl} size={150} />
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-zinc-400 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Expires in 7 days
            </span>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Star, label: "Free forever" },
          { icon: Clock, label: "7-day links" },
          { icon: QrCode, label: "QR codes" },
          { icon: LinkIcon, label: "Custom aliases" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-zinc-400 text-sm">
            <Icon className="w-4 h-4 text-cyan-500" />
            {label}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/auth")}
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium inline-flex items-center gap-1 transition-colors"
        >
          Sign up for advanced analytics & permanent links
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UrlShortener;
