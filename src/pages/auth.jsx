import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Login from '@/components/login';
import Signup from '@/components/signup';
import { UrlState } from '@/context';
import { motion } from 'framer-motion';
import { Link2 } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/images/logo.png" alt="TrimLink" className="w-16 h-16 rounded-xl shadow-lg shadow-cyan-500/20" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {longlink ? "Let's get you logged in" : "Welcome to TrimLink"}
          </h1>
          <p className="text-zinc-400 text-sm">
            {longlink ? "Sign in to continue shortening your link" : "Create an account or sign in to continue"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
          {/* Custom Tab Buttons */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-800/50 p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`py-2.5 px-4 rounded-md text-sm font-medium transition-all ${activeTab === "login"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-300"
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className={`py-2.5 px-4 rounded-md text-sm font-medium transition-all ${activeTab === "signup"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-300"
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