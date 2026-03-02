import { useState } from 'react';
import { MailCheck, X, Loader2 } from 'lucide-react';
import { getToken } from '@/api/token';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'https://urlshortner-onhm.onrender.com';

/**
 * Shows a sticky banner when the logged-in user has not yet verified their email.
 * Pass `emailVerified` (boolean) and `email` (string) as props.
 */
export default function EmailVerificationBanner({ emailVerified, email }) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch(`${API}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-amber-300 min-w-0">
        <MailCheck className="w-4 h-4 shrink-0" />
        <span className="truncate">
          Please verify your email address
          {email ? <span className="hidden sm:inline text-amber-300/70"> ({email})</span> : ''}.
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleResend}
          disabled={sending}
          className="text-amber-300 hover:text-amber-200 font-medium underline underline-offset-2 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {sending ? 'Sending…' : 'Resend link'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/60 hover:text-amber-400 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
