import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEOMetadata } from '@/components/seo-metadata';

const API = import.meta.env.VITE_API_URL || 'https://urlshortner-onhm.onrender.com';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setDone(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-slate-400">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOMetadata title="Reset Password | TrimLink" description="Set a new password for your TrimLink account." />
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-8">
            {done ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 mb-2">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Password reset!</h1>
                <p className="text-slate-400 text-sm">Redirecting you to login…</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 mb-4">
                    <KeyRound className="w-6 h-6 text-blue-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">New password</h1>
                  <p className="text-slate-400 text-sm mt-1">Choose a strong password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Input
                        type={showPw ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-600/50 pr-10"
                      />
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Confirm Password</label>
                    <Input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-600/50"
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-11 transition-all disabled:opacity-50">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : 'Reset Password'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
