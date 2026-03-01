import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Login from "@/components/login";
import Signup from "@/components/signup";
import { UrlState } from "@/context";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  QrCode,
  Shield,
  Globe,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";

const features = [
  { icon: BarChart3, text: "Advanced click analytics" },
  { icon: QrCode, text: "QR code generation" },
  { icon: Shield, text: "Password-protected links" },
  { icon: Globe, text: "Geo & device targeting" },
  { icon: Zap, text: "Custom branded domains" },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const longlink = searchParams.get("createNew");
  const navigate = useNavigate();
  const { isAuthenticated, loading } = UrlState();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(`/dashboard?${longlink ? `createNew=${longlink}` : ""}`);
    }
  }, [isAuthenticated, loading]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex relative overflow-hidden bg-[hsl(230,15%,5%)]">
      {/* ===== Left Panel — Branding ===== */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-[hsl(230,15%,7%)] to-indigo-600/10" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.08] rounded-full blur-[100px] -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/[0.06] rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4" />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/images/logo.png" alt="TrimLink" className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-blue-600/25" />
            <span className="text-xl font-bold text-white tracking-tight">
              TrimLink
            </span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              Your links,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                supercharged.
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-md">
              Join thousands of marketers, creators, and businesses who use
              TrimLink to shorten, brand, and track their links.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10">
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-500" /> Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-500" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-500" /> Cancel anytime
            </span>
          </div>
        </div>
      </div>

      {/* ===== Right Panel — Form ===== */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12 relative">
        {/* Subtle bg glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="inline-flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img src="/images/logo.png" alt="TrimLink" className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-blue-600/25" />
              <span className="text-xl font-bold text-white tracking-tight">
                TrimLink
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {activeTab === "login" ? (
                longlink ? (
                  "Welcome back"
                ) : (
                  "Sign in to TrimLink"
                )
              ) : (
                "Create your account"
              )}
            </h1>
            <p className="text-slate-400 text-sm">
              {activeTab === "login"
                ? longlink
                  ? "Sign in to shorten your link"
                  : "Enter your credentials to access your dashboard"
                : "Start shortening and tracking links in seconds"}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-[hsl(230,10%,8%)] border border-[hsl(230,10%,14%)] mb-8">
            {["login", "signup"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="authTab"
                    className="absolute inset-0 bg-blue-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === "login" ? "Sign In" : "Sign Up"}
                </span>
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "login" ? <Login /> : <Signup />}
            </motion.div>
          </AnimatePresence>

          {/* Divider + toggle */}
          <div className="mt-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(230,10%,14%)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-slate-600 bg-[hsl(230,15%,5%)]">
                  or
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              {activeTab === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors inline-flex items-center gap-1"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              Back to home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;