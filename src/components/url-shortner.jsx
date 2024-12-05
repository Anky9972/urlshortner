import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  Link as LinkIcon,
  Copy,
  QrCode,
  Clock,
  Star,
  UserPlus,
} from "lucide-react";
import QRCode from "qrcode.react";
import { useNavigate } from "react-router-dom";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const generateUniqueCode = () => {
  // const sanitizedClause = clause
  //   .toLowerCase()
  //   .replace(/[^a-z0-9]/g, "")
  //   .slice(0, 10);

  // const randomString = Math.random().toString(36).substring(2, 7);
  const shortCode = Math.random().toString(36).substring(2, 7);

  return {
    // clause: clause
    //   ? `${sanitizedClause}-${randomString}`
    //   : randomString,
    shortCode: shortCode,
  };
};

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [clause, setClause] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  const handleShorten = async () => {
    setError("");
    setShortUrl("");
    setLoading(true);
    setShowQR(false);

    if (!originalUrl) {
      setError("Please provide a valid URL");
      setLoading(false);
      return;
    }

    try {
      new URL(originalUrl);
      const { shortCode: generatedShortCode } = generateUniqueCode(clause);

      const urlEntry = {
        original_url: originalUrl,
        short_code: generatedShortCode,
        clause: clause || null,
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days expiration
        ).toISOString(),
      };

      const { error } = await supabase
        .from("free_services")
        .insert(urlEntry)
        .select();

      if (error) {
        if (error.code === "23505") {
          setError(
            "This custom clause or short code is already in use. Please try again."
          );
          setLoading(false);
          return;
        }
        throw error;
      }

      const clauseUrl = `${window.location.origin}/${clause}`;
      const shortCodeUrl = `${window.location.origin}/${generatedShortCode}`;

      setShortUrl(clauseUrl);
      setShortCode(shortCodeUrl);
    } catch (err) {
      console.error("Full Supabase Error:", err);
      setError(`Error: ${err.message || "Failed to shorten URL"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Copy failed", err));
  };

  const handleToggleQR = () => {
    setShowQR(!showQR);
  };

  return (
    <div className="flex flex-col gap-2 lg:flex-row max-w-4xl mx-auto bg-gray-900 lg:border rounded-xl shadow-lg lg:overflow-hidden backdrop-blur-md">
      <div className="lg:w-3/5 p-6 space-y-4 border rounded-xl lg:border-none lg:rounded-none">
        <h2 className="text-2xl font-bold text-center text-gray-100">
          URL Shortener
        </h2>

        <div className="space-y-5">
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Enter your long URL"
            required
            className="w-full px-3 py-2 bg-gray-900 text-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={clause}
            onChange={(e) => setClause(e.target.value)}
            placeholder="Optional custom short link clause"
            className="w-full px-3 py-2 border bg-gray-900 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleShorten}
            disabled={loading}
            className={`w-full text-white py-2 rounded-md transition flex items-center justify-center ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? (
              "Shortening..."
            ) : (
              <>
                <LinkIcon className="mr-2" /> Shorten URL
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center text-red-500 bg-red-50 p-3 rounded-md">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        )}

        {shortUrl && (
          <div className="w-full bg-green-50 p-3 rounded-md space-y-2">
            <div className="w-full flex flex-col space-y-2">
              {clause !== "" ? (
                <div className="w-full flex items-center">
                  <div className="text-green-700 flex w-full items-center">
                    <h1 className="text-sm">Short URL:</h1>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-blue-600 hover:underline"
                    >
                      {shortUrl}
                    </a>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleCopyUrl(shortUrl)}
                      className="text-green-700 hover:text-green-900"
                      title="Copy Clause URL"
                    >
                      <Copy size={20} />
                    </button>
                    <button
                      onClick={handleToggleQR}
                      className="text-green-700 hover:text-green-900"
                      title="Show QR Code"
                    >
                      <QrCode size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col lg:flex-row gap-2 lg:gap-0 items-center">
                  <div className="text-green-700 flex w-full">
                    <h1 className="text-sm">Short URL:</h1>
                    <a
                      href={shortCode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-blue-600 hover:underline"
                    >
                      {shortCode}
                    </a>
                  </div>
                  <div className="flex w-full lg:w-auto justify-end space-x-2">
                    <button
                      onClick={() => handleCopyUrl(shortCode)}
                      className="text-green-700 hover:text-green-900"
                      title="Copy Short Code URL"
                    >
                      <Copy size={20} />
                    </button>
                    <button
                      onClick={handleToggleQR}
                      className="text-green-700 hover:text-green-900"
                      title="Show QR Code"
                    >
                      <QrCode size={20} />
                    </button>
                  </div>
                </div>
              )}

              {showQR && (
                <div className="flex justify-center mt-2">
                  <QRCode value={clause !== "" ? shortUrl : shortCode} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border rounded-xl lg:rounded-none lg:w-1/2 bg-gray-900 p-6 space-y-4 lg:border-l">
        <div className="mx-auto">
          <h3 className="text-xl font-bold mb-4">Free Service Details</h3>

          <div className="bg-white backdrop-blur-md p-4 rounded-lg shadow-md space-y-3">
            <div className="flex space-x-3">
              <Clock className="text-blue-600" />
              <div className="flex flex-col items-start">
                <p className="font-semibold text-gray-700">Link Expiry</p>
                <p className="text-sm text-gray-500">7 days from creation</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Star className="text-blue-600" />
              <div className="flex flex-col items-start">
                <p className="font-semibold text-gray-700">Free Tier Limits</p>
                <p className="text-sm text-gray-500">10 links/month</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Unlock More Features</h4>

            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                Create an account to access:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 text-left pl-4 list-disc">
                <li>Unlimited link creations</li>
                <li>Permanent link storage</li>
                <li>Advanced analytics</li>
                <li>Custom domain support</li>
              </ul>

              <button
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center"
                onClick={() => navigate("/auth")}
              >
                <UserPlus className="mr-2" /> Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlShortener;
