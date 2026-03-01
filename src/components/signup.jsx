import { useState } from "react";
import { BeatLoader } from "react-spinners";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "@/context";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Check,
} from "lucide-react";

const Signup = () => {
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const longlink = searchParams.get("createNew");
  const { register: registerUser } = UrlState();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
      });

      await schema.validate(formData, { abortEarly: false });

      setLoading(true);
      await registerUser(formData.name, formData.email, formData.password);
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

  // Password strength
  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  const inputField = (name, label, type, placeholder, icon, autoComplete) => {
    const Icon = icon;
    const isPassword = name === "password";
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300 pl-1">
          {label}
        </label>
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            errors[name]
              ? "border-red-500/40 bg-red-500/[0.03]"
              : focused === name
              ? "border-blue-500/50 bg-blue-500/[0.03] ring-2 ring-blue-500/10"
              : "border-[hsl(230,10%,18%)] bg-[hsl(230,10%,10%)] hover:border-[hsl(230,10%,25%)]"
          }`}
        >
          <Icon
            className={`w-4 h-4 ml-4 shrink-0 transition-colors ${
              focused === name ? "text-blue-400" : "text-slate-500"
            }`}
          />
          <input
            name={name}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleInputChange}
            onFocus={() => setFocused(name)}
            onBlur={() => setFocused(null)}
            className="w-full h-12 px-3 bg-transparent text-white placeholder:text-slate-600 text-sm focus:outline-none"
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 pl-1"
          >
            {errors[name]}
          </motion.p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSignup} className="space-y-5">
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

      {inputField("name", "Full Name", "text", "John Doe", User, "name")}
      {inputField("email", "Email", "email", "you@example.com", Mail, "email")}
      {inputField("password", "Password", "password", "••••••••", Lock, "new-password")}

      {/* Password strength meter */}
      <AnimatePresence>
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : "bg-[hsl(230,10%,16%)]"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                {strength.label} password
              </span>
              <div className="flex gap-3">
                {[
                  { check: formData.password.length >= 6, label: "6+ chars" },
                  { check: /[A-Z]/.test(formData.password), label: "Uppercase" },
                  { check: /[0-9]/.test(formData.password), label: "Number" },
                ].map(({ check, label }) => (
                  <span
                    key={label}
                    className={`text-[10px] flex items-center gap-0.5 transition-colors ${
                      check ? "text-emerald-400" : "text-slate-600"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            Create Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
};

export default Signup;
