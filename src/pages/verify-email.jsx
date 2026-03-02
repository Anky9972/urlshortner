import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://urlshortner-onhm.onrender.com';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }

    fetch(`${API}/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.message) { setStatus('success'); setMessage(data.message); }
        else { setStatus('error'); setMessage(data.error || 'Verification failed'); }
      })
      .catch(() => { setStatus('error'); setMessage('Network error — please try again'); });
  }, [token]);

  return (
    <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-8 text-center space-y-5">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
            <p className="text-slate-400">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Email verified!</h1>
            <p className="text-slate-400 text-sm">{message}</p>
            <Link to="/dashboard" className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
              Go to Dashboard
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20">
              <XCircle className="w-7 h-7 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verification failed</h1>
            <p className="text-slate-400 text-sm">{message}</p>
            <Link to="/auth" className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
