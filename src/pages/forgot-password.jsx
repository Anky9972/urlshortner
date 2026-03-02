import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEOMetadata } from '@/components/seo-metadata';

const API = import.meta.env.VITE_API_URL || 'https://urlshortner-onhm.onrender.com';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOMetadata title="Forgot Password | TrimLink" description="Reset your TrimLink password." />
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-8">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 mb-2">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Check your inbox</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  If <span className="text-white font-medium">{email}</span> is registered, a reset link has been sent. Check your spam folder if you don't see it.
                </p>
                <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2">
                  <ArrowLeft className="w-4 h-4" /> Back to login
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 mb-4">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
                  <p className="text-slate-400 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wider">Email address</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white placeholder:text-slate-600 focus:border-blue-600/50"
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-11 transition-all disabled:opacity-50">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : 'Send Reset Link'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <Link to="/auth" className="text-sm text-slate-500 hover:text-slate-300 inline-flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
