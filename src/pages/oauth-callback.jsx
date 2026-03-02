import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "@/context";
import { setToken } from "@/api/token";
import { BeatLoader } from "react-spinners";

/**
 * Landing page for OAuth redirect: /oauth-callback?token=...
 * Sets the JWT token in storage then redirects to dashboard.
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = UrlState();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      setToken(token);
      // Reload user from server so context is fresh
      fetchUser().then(() => navigate("/dashboard"));
    } else {
      navigate("/login?error=OAuth+failed");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(230,15%,5%)]">
      <div className="flex flex-col items-center gap-4">
        <BeatLoader size={10} color="#3b82f6" />
        <p className="text-slate-400 text-sm">Signing you in…</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
