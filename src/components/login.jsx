import { useState } from "react";
import { BeatLoader } from "react-spinners";
import * as Yup from "yup";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { UrlState } from "@/context";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Shield } from "lucide-react";

const Login = () => {
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // 2FA challenge state
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const longlink = searchParams.get("createNew");
  const { login, completeTwoFactorLogin } = UrlState();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    try {
      const schema = Yup.object().shape({
        email: Yup.string().email("Invalid email address").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      });

      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      const result = await login(formData.email, formData.password);

      if (result?.twoFactorRequired) {
        setTwoFactorRequired(true);
        setTwoFactorUserId(result.userId);
      } else {
        navigate(`/dashboard?${longlink ? `createNew=${longlink}` : ""}`);
      }
    } catch (e) {
      if (e.inner) {
        const newErrors = {};
        e.inner.forEach((err) => { newErrors[err.path] = err.message; });
        setErrors(newErrors);
      } else {
        setApiError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!twoFactorToken || twoFactorToken.length < 6) {
      setApiError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    try {
      setLoading(true);
      await completeTwoFactorLogin(twoFactorUserId, twoFactorToken);
      navigate(`/dashboard?${longlink ? `createNew=${longlink}` : ""}`);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2FA challenge view ---
  if (twoFactorRequired) {
    return (
      <form onSubmit={handleTwoFactorSubmit} className="space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-slate-300 text-sm font-medium">Two-Factor Authentication</p>
          <p className="text-slate-500 text-xs">Enter the 6-digit code from your authenticator app</p>
        </div>

        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{apiError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300 pl-1">Authenticator Code</label>
          <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            focused === "totp" ? "border-blue-500/50 bg-blue-500/[0.03] ring-2 ring-blue-500/10" : "border-[hsl(230,10%,18%)] bg-[hsl(230,10%,10%)]"
          }`}>
            <Shield className={`w-4 h-4 ml-4 shrink-0 transition-colors ${focused === "totp" ? "text-blue-400" : "text-slate-500"}`} />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              placeholder="000000"
              value={twoFactorToken}
              onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onFocus={() => setFocused("totp")}
              onBlur={() => setFocused(null)}
              className="w-full h-12 px-3 bg-transparent text-white placeholder:text-slate-600 text-sm tracking-widest focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || twoFactorToken.length < 6}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <BeatLoader size={8} color="#ffffff" /> : <>Verify &amp; Sign In <ArrowRight className="w-4 h-4" /></>}
        </button>

        <button type="button" onClick={() => { setTwoFactorRequired(false); setTwoFactorToken(""); setApiError(null); }}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors">
          ← Back to login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {/* API Error */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{apiError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300 pl-1">Email</label>
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            errors.email
              ? "border-red-500/40 bg-red-500/[0.03]"
              : focused === "email"
              ? "border-blue-500/50 bg-blue-500/[0.03] ring-2 ring-blue-500/10"
              : "border-[hsl(230,10%,18%)] bg-[hsl(230,10%,10%)] hover:border-[hsl(230,10%,25%)]"
          }`}
        >
          <Mail
            className={`w-4 h-4 ml-4 shrink-0 transition-colors ${
              focused === "email" ? "text-blue-400" : "text-slate-500"
            }`}
          />
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            className="w-full h-12 px-3 bg-transparent text-white placeholder:text-slate-600 text-sm focus:outline-none"
          />
        </div>
        {errors.email && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 pl-1">
            {errors.email}
          </motion.p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300 pl-1">Password</label>
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            errors.password
              ? "border-red-500/40 bg-red-500/[0.03]"
              : focused === "password"
              ? "border-blue-500/50 bg-blue-500/[0.03] ring-2 ring-blue-500/10"
              : "border-[hsl(230,10%,18%)] bg-[hsl(230,10%,10%)] hover:border-[hsl(230,10%,25%)]"
          }`}
        >
          <Lock
            className={`w-4 h-4 ml-4 shrink-0 transition-colors ${
              focused === "password" ? "text-blue-400" : "text-slate-500"
            }`}
          />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            className="w-full h-12 px-3 bg-transparent text-white placeholder:text-slate-600 text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-3 text-slate-500 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 pl-1">
            {errors.password}
          </motion.p>
        )}
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_4px_20px_-4px_hsl(220,90%,56%,0.4)] flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <BeatLoader size={8} color="#ffffff" />
        ) : (
          <>
            Sign In
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-[hsl(230,10%,18%)]" />
        <span className="text-xs text-slate-600">or continue with</span>
        <div className="flex-1 h-px bg-[hsl(230,10%,18%)]" />
      </div>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/oauth/google`}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[hsl(230,10%,18%)] bg-[hsl(230,10%,10%)] hover:bg-[hsl(230,10%,14%)] text-slate-300 hover:text-white text-sm font-medium transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </a>
        <a
          href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/oauth/github`}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[hsl(230,10%,18%)] bg-[hsl(230,10%,10%)] hover:bg-[hsl(230,10%,14%)] text-slate-300 hover:text-white text-sm font-medium transition-all"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </form>
  );
};

export default Login;
