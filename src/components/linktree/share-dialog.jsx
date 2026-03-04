import { Share2, Check, Copy, Linkedin, Download } from 'lucide-react'
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FaTwitter } from "react-icons/fa";
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';

const ShareDialog = ({ linkTreeId, slug }) => {
  const [copied, setCopied] = useState(false);
  // Prefer slug-based public URL; fall back to ID-based URL for backward compat
  const shareUrl = slug
    ? `${window.location.origin}/share/${slug}`
    : `${window.location.origin}/share/${linkTreeId}`;

  const qrRef = useRef(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `linktree-qr${slug ? `-${slug}` : ''}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-[hsl(230,10%,20%)] text-slate-300 hover:text-white hover:bg-[hsl(230,10%,20%)] text-xs font-medium" size="sm" >
          <Share2 className='w-3' />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
        <DialogHeader>
          <DialogTitle className="text-white">Share your LinkTree</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* URL Copy */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(230,10%,14%)]/50">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 bg-transparent text-slate-300 focus:outline-none text-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="gap-2 p-2 border border-[hsl(230,10%,20%)] rounded-lg text-slate-300 hover:bg-[hsl(230,10%,20%)]"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div ref={qrRef} className="p-3 bg-white rounded-xl">
              <QRCodeSVG
                value={shareUrl}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              className="gap-2 border-[hsl(230,10%,20%)] text-slate-300 hover:text-white hover:bg-[hsl(230,10%,20%)] text-xs"
            >
              <Download size={13} />
              Download QR
            </Button>
          </div>

          {/* Social share buttons */}
          <div className="flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 hover:bg-[hsl(230,10%,14%)] rounded-lg border border-[hsl(230,10%,20%)] text-slate-400 hover:text-blue-400 transition-colors"
            >
              <FaTwitter size={18} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 hover:bg-[hsl(230,10%,14%)] rounded-lg border border-[hsl(230,10%,20%)] text-slate-400 hover:text-blue-400 transition-colors"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
ShareDialog.propTypes = {
  linkTreeId: PropTypes.string.isRequired,
  slug: PropTypes.string,
  setLinkTreeId: PropTypes.func,
};

export default ShareDialog;