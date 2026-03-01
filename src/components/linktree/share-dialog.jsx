import { Share2, Check, Copy, Linkedin } from 'lucide-react'
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FaTwitter } from "react-icons/fa";
import { useState } from 'react';
import PropTypes from 'prop-types';

const ShareDialog = ({ linkTreeId }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share/${linkTreeId}`;
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
          <div className="flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 hover:bg-[hsl(230,10%,14%)] rounded-lg border border-[hsl(230,10%,20%)] text-slate-400 hover:text-blue-400 transition-colors"
            >
              <FaTwitter size={18} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                shareUrl
              )}`}
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
  // setLinkTreeId: PropTypes.func.isRequired,
};

export default ShareDialog;