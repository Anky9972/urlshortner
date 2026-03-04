import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import PasswordGate from "@/components/password-gate";
import { getLongUrl } from "@/api/urls";
import { recordClick } from "@/api/clicks";
import { getSplitRedirect, recordSplitClick } from "@/api/splits";
import { handleUrlRedirect } from "@/db/freeUrls";
import useFetch from "@/hooks/use-fetch";

const RedirectLink = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showPasswordGate, setShowPasswordGate] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [urlData, setUrlData] = useState(null);
  const [isFreeUrl, setIsFreeUrl] = useState(false);

  const { loading, data, fn } = useFetch(getLongUrl, id);
  const { fn: fnStats } = useFetch(recordClick, {
    id: data?.id,
    originalUrl: data?.original_url,
  });

  useEffect(() => {
    fn();
  }, []);

  useEffect(() => {
    // loading starts as null (before fn() runs), true (running), false (done).
    // Only act when the fetch has explicitly completed (loading === false),
    // never when it is still in the initial null state — otherwise checkFreeUrl()
    // fires immediately before fn() has even started, causing a race condition.
    if (loading === false && data) {
      handleRedirectLogic(data);
    } else if (loading === false && !data) {
      // Primary URL not found - check free URLs
      checkFreeUrl();
    }
  }, [data, loading]);

  const checkFreeUrl = async () => {
    try {
      const originalUrl = await handleUrlRedirect(id);
      if (originalUrl) {
        setIsFreeUrl(true);
        window.location.href = originalUrl;
      } else {
        navigate('/not-found');
      }
    } catch {
      navigate('/not-found');
    }
  };

  const handleRedirectLogic = async (urlInfo) => {
    setUrlData(urlInfo);
    const now = new Date();

    // Check expiration
    if (urlInfo.expiresAt || urlInfo.expiration_date) {
      const expirationDate = new Date(urlInfo.expiresAt || urlInfo.expiration_date);
      if (expirationDate < now) {
        navigate("/link-expired");
        return;
      }
    }

    // Check if link is not yet active
    if (urlInfo.activates_at || urlInfo.activatesAt) {
      const activatesAt = new Date(urlInfo.activates_at || urlInfo.activatesAt);
      if (activatesAt > now) {
        navigate("/link-expired");
        return;
      }
    }

    // Check if link has been deactivated
    if (urlInfo.deactivates_at || urlInfo.deactivatesAt) {
      const deactivatesAt = new Date(urlInfo.deactivates_at || urlInfo.deactivatesAt);
      if (deactivatesAt < now) {
        navigate("/link-expired");
        return;
      }
    }

    // Check click limit — server returns _count.clicks for the click count
    if (urlInfo.click_limit || urlInfo.clickLimit) {
      const limit = urlInfo.click_limit || urlInfo.clickLimit;
      const current =
        urlInfo._count?.clicks ??
        urlInfo.current_clicks ??
        urlInfo.currentClicks ??
        0;
      if (current >= limit) {
        navigate("/link-expired");
        return;
      }
    }

    // Check if password protected
    if (urlInfo.password) {
      setShowPasswordGate(true);
      return;
    }

    await performRedirect(urlInfo);
  };

  const performRedirect = async (urlInfo) => {
    const deviceInfo = getDeviceInfo();

    try {
      await fnStats();
    } catch (error) {
      console.error("Error recording click:", error);
    }

    // Check for A/B split testing
    try {
      const splitResult = await getSplitRedirect(urlInfo.id);
      if (splitResult.useSplit && splitResult.targetUrl) {
        // Record the split click
        await recordSplitClick(splitResult.splitId).catch(() => { });
        window.location.href = splitResult.targetUrl;
        return;
      }
    } catch (error) {
      console.error("Error checking A/B splits:", error);
      // Continue with normal redirect on error
    }

    const targetUrl = getTargetUrl(urlInfo, deviceInfo);
    window.location.href = targetUrl;
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = 'desktop';
    if (/Mobi|Android/i.test(ua)) device = 'mobile';
    else if (/Tablet|iPad/i.test(ua)) device = 'tablet';

    let browser = 'other';
    if (ua.includes('Chrome')) browser = 'chrome';
    else if (ua.includes('Firefox')) browser = 'firefox';
    else if (ua.includes('Safari')) browser = 'safari';
    else if (ua.includes('Edge')) browser = 'edge';

    let os = 'other';
    if (ua.includes('Windows')) os = 'windows';
    else if (ua.includes('Mac')) os = 'macos';
    else if (ua.includes('Linux')) os = 'linux';
    else if (ua.includes('Android')) os = 'android';
    else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'ios';

    return { device, browser, os };
  };

  const getTargetUrl = (urlInfo, deviceInfo) => {
    const targetingRules = urlInfo.targetingRules || urlInfo.targeting_rules || [];
    const sortedRules = [...targetingRules].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const rule of sortedRules) {
      if (!rule.isActive && rule.isActive !== undefined) continue;
      const [type, value] = rule.condition.split(':');

      switch (type) {
        case 'device':
          if (deviceInfo.device === value) return rule.targetUrl || rule.target_url;
          break;
        case 'browser':
          if (deviceInfo.browser === value) return rule.targetUrl || rule.target_url;
          break;
        case 'os':
          if (deviceInfo.os === value) return rule.targetUrl || rule.target_url;
          break;
        case 'country':
          break;
      }
    }

    let finalUrl = urlInfo.original_url || urlInfo.originalUrl;
    const utmParams = [];

    if (urlInfo.utm_source || urlInfo.utmSource) utmParams.push(`utm_source=${urlInfo.utm_source || urlInfo.utmSource}`);
    if (urlInfo.utm_medium || urlInfo.utmMedium) utmParams.push(`utm_medium=${urlInfo.utm_medium || urlInfo.utmMedium}`);
    if (urlInfo.utm_campaign || urlInfo.utmCampaign) utmParams.push(`utm_campaign=${urlInfo.utm_campaign || urlInfo.utmCampaign}`);
    if (urlInfo.utm_term || urlInfo.utmTerm) utmParams.push(`utm_term=${urlInfo.utm_term || urlInfo.utmTerm}`);
    if (urlInfo.utm_content || urlInfo.utmContent) utmParams.push(`utm_content=${urlInfo.utm_content || urlInfo.utmContent}`);

    if (utmParams.length > 0) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl += separator + utmParams.join('&');
    }

    return finalUrl;
  };

  const handlePasswordSubmit = async (password) => {
    if (password === urlData.password) {
      setShowPasswordGate(false);
      await performRedirect(urlData);
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  if (showPasswordGate) {
    return (
      <PasswordGate
        linkTitle={urlData?.title}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(230,15%,5%)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] flex items-center justify-center">
            <Link2 className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <BarLoader width={200} color="#2563eb" />
          <p className="mt-4 text-slate-500 text-sm">Redirecting you...</p>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default RedirectLink;
