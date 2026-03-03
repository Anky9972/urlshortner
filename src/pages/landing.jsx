import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronUp,
  Link2,
  BarChart3,
  QrCode,
  Shield,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Check,
  Zap,
  Globe,
  Users,
  Smartphone,
  MousePointerClick,
  Share2,
  Lock,
  Layers,
  Network,
  ChevronRight,
  Plus,
  Minus,
  Star,
  Eye,
  Fingerprint,
  LayoutGrid,
  Palette,
  Monitor,
  Bell,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEOMetadata, SEOSchema } from "@/components/seo-metadata";
import UrlShortener from "@/components/url-shortner";
import { UrlState } from "@/context";

/* ============ ANIMATED COUNTER ============ */
const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          let start = 0;
          const end = parseInt(target.replace(/[^0-9]/g, ""));
          const duration = 2000;
          const step = Math.max(1, Math.floor(end / (duration / 16)));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, started]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ============ ANIMATED ORB ============ */
const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    style={{ willChange: 'transform' }}
    animate={{
      y: [0, -30, 0, 30, 0],
      x: [0, 20, 0, -20, 0],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

/* ============ DATA ============ */
const features = [
  { icon: Link2, title: "Smart URL Shortening", desc: "Create concise, memorable links with custom slugs and branding options.", color: "blue", span: "col-span-1" },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Track clicks, locations, devices, and browsers in real-time dashboards.", color: "emerald", span: "col-span-1 md:col-span-2" },
  { icon: QrCode, title: "QR Code Generation", desc: "Generate customizable QR codes for offline and digital marketing campaigns.", color: "violet", span: "col-span-1 md:col-span-2" },
  { icon: Target, title: "Geo & Device Targeting", desc: "Redirect users based on their country, device, or browser automatically.", color: "amber", span: "col-span-1" },
  { icon: Shield, title: "Password Protection", desc: "Secure sensitive links with password-based access controls.", color: "rose", span: "col-span-1" },
  { icon: Clock, title: "Link Scheduling", desc: "Set activation and expiration times for time-sensitive campaigns.", color: "indigo", span: "col-span-1" },
  { icon: Network, title: "LinkTree Builder", desc: "Create beautiful bio pages with multiple links for social media profiles.", color: "blue", span: "col-span-1" },
];

const colorClasses = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "group-hover:shadow-blue-500/10" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "group-hover:shadow-emerald-500/10" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", glow: "group-hover:shadow-violet-500/10" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "group-hover:shadow-amber-500/10" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", glow: "group-hover:shadow-rose-500/10" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", glow: "group-hover:shadow-indigo-500/10" },
};

const steps = [
  { num: "01", title: "Paste Your Link", desc: "Enter any long URL you want to shorten.", icon: Link2 },
  { num: "02", title: "Customize It", desc: "Add custom alias, password, or expiration.", icon: Sparkles },
  { num: "03", title: "Share Everywhere", desc: "Use on social media, emails, or print.", icon: Share2 },
  { num: "04", title: "Track Results", desc: "Monitor clicks with analytics dashboard.", icon: BarChart3 },
];

const stats = [
  { value: "10", suffix: "M+", label: "Links Created", icon: Link2 },
  { value: "500", suffix: "M+", label: "Clicks Tracked", icon: MousePointerClick },
  { value: "99", suffix: "%", label: "Uptime SLA", icon: Shield },
  { value: "150", suffix: "+", label: "Countries", icon: Globe },
];

const testimonials = [
  { name: "Sarah Chen", role: "Growth Lead @ Startup", text: "TrimLink's analytics helped us increase our conversion rate by 40%. The geo-targeting feature is a game-changer.", avatar: "SC" },
  { name: "Marcus Rivera", role: "Digital Marketer", text: "Best URL shortener I've used. The QR codes and link trees have streamlined our entire workflow.", avatar: "MR" },
  { name: "Emily Wong", role: "Content Creator", text: "I use TrimLink for all my bio links. The customization options and real-time tracking are incredible.", avatar: "EW" },
];

const marqueeItems = [
  "SHORT LINKS", "QR CODES", "ANALYTICS", "GEO TARGETING",
  "LINK TREE", "API ACCESS", "TEAMS", "CUSTOM DOMAINS",
  "A/B TESTING", "RETARGETING",
];

const faqs = [
  { q: "How long does a short URL last?", a: "By default, short URLs do not expire. However, you can set an expiration date if desired, or configure click limits." },
  { q: "Can I track the performance of my short URLs?", a: "Yes! You can track clicks, geographic locations, devices, browsers, referrers, and peak hours with our detailed analytics dashboard." },
  { q: "Is there a limit to the number of URLs I can shorten?", a: "There is no limit for registered users. Free users might have a daily limit to prevent abuse." },
  { q: "What is geo-targeting and how does it work?", a: "Geo-targeting allows you to redirect visitors to different URLs based on their country. For example, redirect US visitors to amazon.com and UK visitors to amazon.co.uk." },
  { q: "Can I password protect my links?", a: "Absolutely! You can add password protection to any link. Visitors need to enter the correct password before being redirected." },
  { q: "What is LinkTree and how do I use it?", a: "LinkTree lets you create a single page with multiple links — perfect for social media bios. You can customize the design and track all clicks." },
  { q: "Can I use custom domains?", a: "Yes, you can use your own domain for branded short links. This helps with brand recognition and trust." },
  { q: "Is my account secure with Two-Factor Authentication?", a: "Yes! TrimLink supports TOTP-based Two-Factor Authentication (2FA). You can enable it in Settings → Security using any authenticator app like Google Authenticator or Authy. Once enabled, every login requires both your password and a 6-digit code." },
  { q: "Can I install TrimLink as a mobile app?", a: "Yes! TrimLink is a Progressive Web App (PWA). On Android and iOS, tap 'Add to Home Screen' in your browser to install it as a native-feeling app — no app store required. It works offline and loads instantly." },
];

const moreFeatures = [
  { icon: Lock, text: "Password Protection" },
  { icon: Clock, text: "Expiration Dates" },
  { icon: Target, text: "Geo Targeting" },
  { icon: QrCode, text: "Dynamic QR Codes" },
  { icon: Layers, text: "Folder Organization" },
  { icon: Network, text: "LinkTree Builder" },
  { icon: Users, text: "Team Collaboration" },
  { icon: Zap, text: "API Integration" },
  { icon: Eye, text: "Click Analytics" },
  { icon: Fingerprint, text: "Bot Detection" },
  { icon: Palette, text: "Custom Branding" },
  { icon: Monitor, text: "Device Targeting" },
  { icon: Shield, text: "Two-Factor Auth (2FA)" },
  { icon: Download, text: "PWA — Installable App" },
  { icon: Bell, text: "Expiry Notifications" },
];

/* ============ FAQ ITEM ============ */
const FaqItem = ({ question, answer, isOpen, onToggle }) => (
  <motion.div
    layout
    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
      isOpen ? "border-blue-500/30 bg-blue-500/[0.03]" : "border-[hsl(230,10%,15%)] hover:border-[hsl(230,10%,22%)]"
    }`}
  >
    <button onClick={onToggle} className="w-full flex items-center justify-between px-6 py-5 text-left">
      <span className={`font-medium pr-4 transition-colors ${isOpen ? "text-blue-300" : "text-white"}`}>{question}</span>
      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isOpen ? "bg-blue-500/15" : "bg-white/5"}`}>
        {isOpen ? <Minus className="w-4 h-4 text-blue-400" /> : <Plus className="w-4 h-4 text-slate-400" />}
      </span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <p className="px-6 pb-5 text-slate-400 text-sm leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

/* ============ LANDING PAGE ============ */
const LandingPage = () => {
  const [longUrl, setLongUrl] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = UrlState();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const handleShorten = (e) => {
    e.preventDefault();
    if (longUrl) navigate(`/auth?createNew=${longUrl}`);
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  };

  const stagger = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
  };

  return (
    <>
      <SEOMetadata
        title="TrimLink – Free URL Shortener, QR Code Generator & LinkTree Builder"
        description="TrimLink is a free URL shortener with real-time analytics, custom QR code generator, geo-targeting, password protection, and link-in-bio page builder. No signup needed."
        canonical={`${import.meta.env.VITE_APP_URL || "https://trimlynk.com"}`}
        keywords="url shortener, free url shortener, link shortener, QR code generator, linktree alternative, link in bio, link analytics, geo targeting, custom short links, branded links, link management, trimlynk"
        author="TrimLink"
      />

      {/* Organization schema */}
      <SEOSchema type="organization" />

      {/* FAQ rich results schema */}
      <SEOSchema data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }} />

      {/* ==================== HERO ==================== */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center px-4 overflow-hidden pt-20 pb-12">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[hsl(230,15%,5%)]" />
          {/* Large central glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-blue-600/[0.06] rounded-full blur-[120px]" />
          <FloatingOrb className="w-[600px] h-[600px] bg-blue-600/[0.07] top-[-10%] left-[-5%]" delay={0} />
          <FloatingOrb className="w-[500px] h-[500px] bg-indigo-600/[0.05] bottom-[-5%] right-[-5%]" delay={5} />
          <FloatingOrb className="w-[300px] h-[300px] bg-violet-600/[0.04] top-[40%] right-[20%]" delay={10} />
          <FloatingOrb className="w-[200px] h-[200px] bg-emerald-500/[0.03] top-[20%] left-[15%]" delay={7} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          {/* Dot grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(230,15%,5%)_75%)]" />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column - text + shortener */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/[0.08] border border-blue-500/20 mb-6 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-xs text-blue-300/90 font-medium">Now with A/B Testing & Geo-Targeting</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold text-white mb-5 leading-[1.08] tracking-tight"
              >
                Short Links,{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">Big Results</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full origin-left"
                  />
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Create short links, QR codes, and bio pages in seconds.
                Track every click with powerful analytics — no signup required.
              </motion.p>

              {/* URL Shortener - inline in hero */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="max-w-lg mx-auto lg:mx-0"
              >
                {user ? (
                  <form onSubmit={handleShorten}>
                    <div className="relative flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-[hsl(230,10%,8%)] border border-[hsl(230,10%,16%)] shadow-[0_0_60px_-15px_hsl(220,90%,56%,0.15)]">
                      <Input
                        type="url"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        placeholder="Paste your long URL here..."
                        className="h-12 bg-transparent border-0 text-white placeholder:text-slate-500 focus:ring-0 focus:border-0 shadow-none"
                      />
                      <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl hover:shadow-[0_4px_25px_-4px_hsl(220,90%,56%,0.5)] transition-all shrink-0">
                        Shorten <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 rounded-2xl bg-[hsl(230,10%,8%)]/80 border border-[hsl(230,10%,16%)] shadow-[0_0_80px_-20px_hsl(220,90%,56%,0.15)] backdrop-blur-xl">
                    <UrlShortener variant="hero" />
                  </div>
                )}
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 justify-center lg:justify-start"
              >
                {[
                  { icon: Check, text: "No signup needed" },
                  { icon: Shield, text: "Secure & private" },
                  { icon: Zap, text: "Instant results" },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon className="w-3 h-3 text-emerald-500/70" />
                    {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right column - floating dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="hidden lg:block relative"
            >
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-blue-500/[0.06] rounded-3xl blur-2xl" />

              {/* Main dashboard card */}
              <div className="relative rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,8%)]/90 backdrop-blur-xl p-5 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)]">
                {/* Window controls */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="text-slate-600 text-[10px] ml-2 font-mono">trimlynk.com/dashboard</span>
                </div>

                {/* Mini stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Total Clicks", value: "12,847", change: "+24%", color: "text-emerald-400" },
                    { label: "Active Links", value: "342", change: "+12%", color: "text-blue-400" },
                    { label: "Countries", value: "89", change: "+5%", color: "text-amber-400" },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="p-3 rounded-xl bg-[hsl(230,10%,11%)] border border-[hsl(230,10%,16%)]"
                    >
                      <p className="text-[10px] text-slate-500 mb-0.5">{s.label}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-white">{s.value}</span>
                        <span className={`text-[10px] ${s.color}`}>{s.change}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="p-4 rounded-xl bg-[hsl(230,10%,11%)] border border-[hsl(230,10%,16%)] mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-slate-500">Click Activity (7 days)</p>
                    <span className="text-[10px] text-blue-400 font-medium">Live</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-24">
                    {[35, 52, 48, 72, 65, 88, 75, 90, 68, 95, 78, 82].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                        className="flex-1 rounded-t bg-gradient-to-t from-blue-600/80 to-blue-400/40 hover:from-blue-500 hover:to-blue-300/60 transition-colors cursor-pointer"
                      />
                    ))}
                  </div>
                </div>

                {/* Recent links */}
                <div className="space-y-2">
                  {[
                    { slug: "promo-2024", clicks: "2.4K", orig: "marketing.example.com/holiday-sale..." },
                    { slug: "launch-day", clicks: "1.8K", orig: "blog.example.com/new-product..." },
                  ].map((link, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(230,10%,11%)] border border-[hsl(230,10%,16%)]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Link2 className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">trimlynk.com/{link.slug}</p>
                        <p className="text-[10px] text-slate-600 truncate">{link.orig}</p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono shrink-0">{link.clicks}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="absolute -bottom-6 -left-10 z-20"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[hsl(230,12%,10%)] border border-emerald-500/20 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.4)]"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <MousePointerClick className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">+847 clicks</p>
                    <p className="text-[10px] text-emerald-400">today</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating geo card */}
              <motion.div
                initial={{ opacity: 0, y: -20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.7, duration: 0.6 }}
                className="absolute -top-4 -right-6 z-20"
              >
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(230,12%,10%)] border border-blue-500/20 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.4)]"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] text-slate-300 font-medium">89 countries</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-16 lg:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="relative group p-4 rounded-2xl border border-[hsl(230,10%,13%)] bg-[hsl(230,12%,8%)] hover:border-[hsl(230,10%,20%)] transition-all duration-300">
                <stat.icon className="w-4 h-4 text-blue-500/40 mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-white"><Counter target={stat.value} suffix={stat.suffix} /></p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>


      </section>

      {/* ==================== MARQUEE ==================== */}
      <div className="relative py-6 bg-[hsl(230,12%,7%)] border-y border-[hsl(230,10%,12%)] overflow-hidden">
        <div className="tl-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-slate-500/70 font-bold text-xs tracking-[0.3em] flex items-center gap-8">
              {item} <span className="w-1 h-1 bg-blue-500/30 rounded-full" />
            </span>
          ))}
        </div>
      </div>

      {/* ==================== SHORTEN CTA ==================== */}
      <section className="tl-section">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <span className="tl-badge-blue mb-4 inline-flex"><Zap className="w-3 h-3" /> Try It Now</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Shorten Any Link in Seconds</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">No account needed. Paste any URL and get a short, trackable link instantly.</p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}><UrlShortener /></motion.div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="tl-section-alt relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/[0.04] rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="tl-badge-indigo mb-4 inline-flex"><LayoutGrid className="w-3 h-3" /> Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Four simple steps to create, customize, and track your links.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={i} {...stagger} transition={{ delay: i * 0.12, duration: 0.6 }} className="relative group">
                <div className="p-6 rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] transition-all duration-500 group-hover:border-blue-500/25 group-hover:shadow-[0_0_40px_-10px_hsl(220,90%,56%,0.12)] group-hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-4xl font-black text-[hsl(230,10%,14%)] group-hover:text-blue-500/20 transition-colors">{step.num}</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
                      <step.icon className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BENTO FEATURES ==================== */}
      <section className="tl-section relative">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="tl-badge-emerald mb-4 inline-flex"><Sparkles className="w-3 h-3" /> Powerful Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to <span className="tl-heading-gradient">Manage Links</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Powerful features designed for marketers, developers, and businesses of all sizes.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const c = colorClasses[feature.color];
              return (
                <motion.div key={feature.title} {...stagger} transition={{ delay: i * 0.08, duration: 0.6 }} className={`${feature.span} group relative`}>
                  <div className={`h-full p-6 rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] transition-all duration-500 group-hover:border-[hsl(230,10%,22%)] group-hover:-translate-y-0.5 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ${c.glow}`}>
                    <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <feature.icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="tl-section-alt relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/[0.04] rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <motion.div {...fadeUp} className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="flex-1">
              <span className="tl-badge-blue mb-4 inline-flex">Why TrimLink</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Trusted by <span className="tl-heading-gradient">Thousands</span> of Teams
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">Our platform helps you make every point of connection between your content and your audience ignite action.</p>
              <Button onClick={() => navigate("/auth")} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 h-11 rounded-xl hover:shadow-[0_4px_25px_-4px_hsl(220,90%,56%,0.5)] transition-all">
                Start for Free <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { value: "100K", label: "Active Users", icon: Users, color: "blue" },
                { value: "50K", label: "Links/Month", icon: Link2, color: "indigo" },
                { value: "500+", label: "Integrations", icon: Layers, color: "emerald" },
                { value: "99%", label: "Uptime SLA", icon: Shield, color: "amber" },
              ].map((item, i) => (
                <motion.div key={i} {...stagger} transition={{ delay: i * 0.1, duration: 0.6 }} className="group">
                  <div className="p-5 rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] transition-all duration-300 group-hover:border-[hsl(230,10%,22%)]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-2xl sm:text-3xl font-bold text-white">{item.value}</p>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        item.color === "blue" ? "bg-blue-500/10" : item.color === "indigo" ? "bg-indigo-500/10" : item.color === "emerald" ? "bg-emerald-500/10" : "bg-amber-500/10"
                      }`}>
                        <item.icon className={`w-4 h-4 ${
                          item.color === "blue" ? "text-blue-400" : item.color === "indigo" ? "text-indigo-400" : item.color === "emerald" ? "text-emerald-400" : "text-amber-400"
                        }`} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== DASHBOARD PREVIEW ==================== */}
      <section className="tl-section relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="tl-badge-blue mb-4 inline-flex">Analytics & Insights</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Deep Analytics for Every Link</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Understand your audience with comprehensive click analytics and insights.</p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.8 }}>
            <div className="relative rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-6 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-slate-600 text-xs ml-3 font-mono">trimlynk.com/dashboard</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total Clicks", value: "12,847", change: "+24%", color: "text-emerald-400" },
                  { label: "Active Links", value: "342", change: "+12%", color: "text-blue-400" },
                  { label: "QR Scans", value: "1,856", change: "+18%", color: "text-violet-400" },
                  { label: "Countries", value: "89", change: "+5%", color: "text-amber-400" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[hsl(230,10%,12%)] border border-[hsl(230,10%,18%)]">
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-white">{s.value}</span>
                      <span className={`text-xs ${s.color}`}>{s.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-4 rounded-xl bg-[hsl(230,10%,12%)] border border-[hsl(230,10%,18%)]">
                  <p className="text-xs text-slate-500 mb-4">Click Activity (7 days)</p>
                  <div className="flex items-end gap-1 sm:gap-2 h-24 sm:h-32">
                    {[35, 52, 48, 72, 65, 88, 75, 90, 68, 95, 78, 82, 92, 70].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600/80 to-blue-400/60" />
                    ))}
                  </div>
                </div>
                <div className="w-full sm:w-48 md:w-56 p-4 rounded-xl bg-[hsl(230,10%,12%)] border border-[hsl(230,10%,18%)]">
                  <p className="text-xs text-slate-500 mb-4">Top Devices</p>
                  <div className="space-y-3">
                    {[
                      { label: "Mobile", pct: 58, color: "bg-blue-500" },
                      { label: "Desktop", pct: 32, color: "bg-indigo-500" },
                      { label: "Tablet", pct: 10, color: "bg-violet-500" },
                    ].map((d, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{d.label}</span>
                          <span className="text-white font-medium">{d.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[hsl(230,10%,18%)] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${d.pct}%` }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} className={`h-full rounded-full ${d.color}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="tl-section-alt">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="tl-badge-amber mb-4 inline-flex"><Star className="w-3 h-3" /> Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Loved by Thousands</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} {...stagger} transition={{ delay: i * 0.1, duration: 0.6 }}>
                <div className="h-full p-6 rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] hover:border-[hsl(230,10%,22%)] transition-all">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (<Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[hsl(230,10%,15%)]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== MORE FEATURES GRID ==================== */}
      <section className="tl-section">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">And So Much More</h2>
            <p className="text-slate-400">Every tool you need, all in one place.</p>
          </motion.div>
          <motion.div {...fadeUp} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {moreFeatures.map((feature, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} className="flex items-center gap-3 p-4 rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] hover:border-blue-500/20 transition-all cursor-default">
                <feature.icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="tl-section-alt">
        <motion.div {...fadeUp} className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

            <div className="relative z-10 p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-blue-200" />
                  <span className="text-blue-200 text-sm font-medium">Growth Hack to the Top</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">Get Closer to Your Customers Today</h2>
                <p className="text-blue-100/70 mb-6 leading-relaxed">Start creating smarter links that drive engagement and track every interaction.</p>
                <Button onClick={() => navigate("/auth")} className="h-12 px-8 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl hover:shadow-lg transition-all">
                  Get Started For Free <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
              <div className="flex-1 max-w-sm w-full">
                <div className="bg-white/[0.08] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    <span className="text-white/40 text-xs ml-2 font-mono">Dashboard</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-white/50 text-xs">Total Clicks</p>
                      <p className="text-white font-bold text-xl mt-0.5">2,280</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-white/50 text-xs">Total Links</p>
                      <p className="text-white font-bold text-xl mt-0.5">1,756</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/20 rounded-t-sm hover:bg-white/30 transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="tl-section">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-400">Got questions? We&apos;ve got answers.</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} {...stagger} transition={{ delay: i * 0.05, duration: 0.5 }}>
                <FaqItem question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="tl-section-alt">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto">
          <div className="relative p-8 sm:p-12 md:p-16 rounded-3xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-60 h-32 bg-indigo-500/5 blur-3xl" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Supercharge Your Links?</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">Join thousands of marketers and businesses using TrimLink to create, track, and optimize their links.</p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {["Free to start", "No credit card", "Instant setup"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-400 text-sm bg-[hsl(230,10%,12%)] px-4 py-2 rounded-full border border-[hsl(230,10%,18%)]">
                    <Check className="w-4 h-4 text-emerald-400" /> <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/auth")} className="h-12 px-10 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl hover:shadow-[0_4px_25px_-4px_hsl(220,90%,56%,0.5)] transition-all">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="h-12 px-8 rounded-xl">View Dashboard</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-110 z-50"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingPage;
