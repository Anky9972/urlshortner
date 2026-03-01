import { useState, useRef } from "react";
import {
    AlertCircle,
    Link as LinkIcon,
    Copy,
    QrCode,
    Clock,
    Star,
    ArrowRight,
    Check,
    ExternalLink,
    Download,
    Sparkles,
    X,
} from "lucide-react";
import QRCode from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const generateUniqueCode = () => {
    const shortCode = Math.random().toString(36).substring(2, 7);
    return { shortCode };
};

const UrlShortener = ({ variant = "default" }) => {
    const [originalUrl, setOriginalUrl] = useState("");
    const [clause, setClause] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [shortCode, setShortCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const qrRef = useRef(null);
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalUrl,
                    shortCode: generatedShortCode,
                    clause: clause || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setError(
                        data.error ||
                            "This custom alias is already taken. Try another one."
                    );
                    setLoading(false);
                    return;
                }
                throw new Error(data.error || "Failed to shorten URL");
            }

            const clauseUrl = clause
                ? `${window.location.origin}/${clause}`
                : null;
            const shortCodeUrl = `${window.location.origin}/${generatedShortCode}`;

            setShortUrl(clauseUrl || shortCodeUrl);
            setShortCode(shortCodeUrl);

            // Store in localStorage for MyUrls panel
            const stored = JSON.parse(
                localStorage.getItem("freeUrls") || "[]"
            );
            stored.unshift({
                id: data.id,
                original_url: originalUrl,
                short_code: data.shortCode,
                clause: data.clause,
                created_at: data.createdAt || new Date().toISOString(),
                expires_at: data.expiresAt,
            });
            localStorage.setItem(
                "freeUrls",
                JSON.stringify(stored.slice(0, 50))
            );
        } catch (err) {
            if (err.message.includes("Invalid URL")) {
                setError("Invalid URL format. Include https://");
            } else {
                setError(err.message || "Something went wrong. Please try again.");
            }
            console.error("Error shortening URL:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleShorten();
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

    const downloadQR = () => {
        if (qrRef.current) {
            const canvas = qrRef.current.querySelector("canvas");
            if (canvas) {
                const link = document.createElement("a");
                link.download = "trimlink-qr.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        }
    };

    const reset = () => {
        setShortUrl("");
        setOriginalUrl("");
        setClause("");
        setError("");
        setShowQR(false);
        setCopied(false);
        setShowAdvanced(false);
    };

    const isHero = variant === "hero";

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!shortUrl ? (
                    /* ========== INPUT STATE ========== */
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Main input row */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                <input
                                    type="url"
                                    placeholder="Paste your long URL here..."
                                    value={originalUrl}
                                    onChange={(e) => setOriginalUrl(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className={`w-full h-12 pl-11 pr-4 rounded-xl bg-[hsl(230,10%,10%)] border text-white placeholder:text-slate-500 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                                        error
                                            ? "border-red-500/40 focus:border-red-500/50"
                                            : "border-[hsl(230,10%,18%)] focus:border-blue-500/50"
                                    }`}
                                />
                            </div>
                            <Button
                                onClick={handleShorten}
                                disabled={loading || !originalUrl}
                                className="h-12 px-7 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl hover:shadow-[0_4px_25px_-4px_hsl(220,90%,56%,0.5)] transition-all disabled:opacity-50 disabled:hover:shadow-none shrink-0"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Shortening...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Shorten
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* Custom alias toggle */}
                        <div className="mt-3">
                            {!showAdvanced ? (
                                <button
                                    onClick={() => setShowAdvanced(true)}
                                    className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Add custom alias
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-slate-500 text-xs shrink-0 font-mono">
                                        {window.location.host}/
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="my-custom-alias"
                                        value={clause}
                                        onChange={(e) =>
                                            setClause(
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9-]/g, "")
                                            )
                                        }
                                        className="flex-1 h-8 px-3 rounded-lg bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-white placeholder:text-slate-600 text-xs font-mono focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                    />
                                    <button
                                        onClick={() => { setShowAdvanced(false); setClause(""); }}
                                        className="text-slate-600 hover:text-slate-400 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/15 rounded-xl px-4 py-2.5"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* ========== SUCCESS STATE ========== */
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Result card */}
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

                            {/* Original URL */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded bg-emerald-500/15 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                </div>
                                <p className="text-emerald-400/80 text-xs truncate">
                                    {originalUrl}
                                </p>
                            </div>

                            {/* Short URL - prominent */}
                            <div className="flex items-center gap-3 mb-4">
                                <a
                                    href={shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white font-mono text-lg sm:text-xl font-semibold hover:text-blue-300 transition-colors truncate flex-1 group"
                                >
                                    {shortUrl.replace(/^https?:\/\//, "")}
                                    <ExternalLink className="inline w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 -translate-y-0.5 transition-opacity" />
                                </a>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    onClick={() => handleCopy(shortUrl)}
                                    className={`rounded-xl h-9 px-4 text-xs font-semibold transition-all ${
                                        copied
                                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                            : "bg-white/10 hover:bg-white/15 text-white"
                                    }`}
                                >
                                    {copied ? (
                                        <Check className="w-3.5 h-3.5 mr-1.5" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowQR(!showQR)}
                                    className={`rounded-xl h-9 px-4 text-xs font-semibold ${
                                        showQR
                                            ? "bg-violet-500/15 text-violet-400"
                                            : "text-slate-400 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    <QrCode className="w-3.5 h-3.5 mr-1.5" />
                                    QR Code
                                </Button>
                                <button
                                    onClick={reset}
                                    className="text-slate-500 hover:text-white text-xs ml-auto transition-colors"
                                >
                                    Shorten another
                                </button>
                            </div>

                            {/* QR Code */}
                            <AnimatePresence>
                                {showQR && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 pt-4 border-t border-emerald-500/15">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    ref={qrRef}
                                                    className="bg-white p-3 rounded-xl shadow-lg"
                                                >
                                                    <QRCode
                                                        value={shortUrl}
                                                        size={120}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-medium mb-1">
                                                        QR Code Ready
                                                    </p>
                                                    <p className="text-xs text-slate-400 mb-3">
                                                        Scan to visit the shortened
                                                        URL or download for print.
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={downloadQR}
                                                        className="rounded-xl h-8 px-3 text-xs border-[hsl(230,10%,20%)] text-slate-300 hover:bg-white/5"
                                                    >
                                                        <Download className="w-3 h-3 mr-1.5" />
                                                        Download PNG
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Expiry notice */}
                            <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-[10px]">
                                <Clock className="w-3 h-3" />
                                Free links expire in 7 days •{" "}
                                <button
                                    onClick={() => navigate("/auth")}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Sign up for permanent links
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feature pills - only show in non-hero variant when no result */}
            {!isHero && !shortUrl && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: Star, label: "Free forever" },
                        { icon: Clock, label: "7-day links" },
                        { icon: QrCode, label: "QR codes" },
                        { icon: LinkIcon, label: "Custom aliases" },
                    ].map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 text-slate-500 text-xs"
                        >
                            <Icon className="w-3.5 h-3.5 text-blue-400/60" />
                            {label}
                        </div>
                    ))}
                </div>
            )}

            {/* CTA - only show in non-hero variant */}
            {!isHero && !shortUrl && (
                <div className="mt-5 text-center">
                    <button
                        onClick={() => navigate("/auth")}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                    >
                        Sign up for advanced analytics & permanent links
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UrlShortener;
