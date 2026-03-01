import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Login from '@/components/login';
import Signup from '@/components/signup';
import { UrlState } from '@/context';
import { motion } from 'framer-motion';
import { Link as LinkIcon } from 'lucide-react';

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
  }, [isAuthenticated, loading])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/20">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {longlink ? "Let's get you logged in" : "Welcome to TrimLink"}
          </h1>
          <p className="text-slate-400 text-sm">
            {longlink ? "Sign in to continue shortening your link" : "Create an account or sign in to continue"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] rounded-2xl p-6 shadow-xl shadow-black/20">
          {/* Custom Tab Buttons */}
          <div className="grid grid-cols-2 gap-1 bg-[hsl(230,10%,7%)] p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "login"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-300"
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "signup"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-300"
                }`}
            >
              Signup
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>
      </motion.div>
    </div>
  )
}

export default Auth