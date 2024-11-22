import { Share2, Check, Copy, Linkedin } from 'lucide-react'
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FaTwitter } from "react-icons/fa";
import { useState } from 'react';
import PropTypes from 'prop-types';

const ShareDialog = ({linkTreeId}) => {
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
          <Button variant="outline" className="gap-2 text-gray-400 hover:text-white text-xs font-bold" size="sm" >
            <Share2 className='w-3' />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your LinkTree</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 rounded-lg">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 bg-transparent rounded-md border focus:outline-none text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2 p-2 border rounded-md"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
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
                className="p-2 hover:bg-gray-900 rounded-md border"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-900 rounded-md border"
              >
                <Linkedin size={20} />
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