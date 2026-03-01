import { useState } from "react";
import { BeatLoader } from "react-spinners";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "@/context";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

const Login = () => {
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const longlink = searchParams.get("createNew");
  const { login } = UrlState();

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
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
      });

      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      await login(formData.email, formData.password);
      navigate(`/dashboard?${longlink ? `createNew=${longlink}` : ""}`);
    } catch (e) {
      if (e.inner) {
        const newErrors = {};
        e.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setApiError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

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
    </form>
  );
};

export default Login;
