import React from 'react';
import { trackLinkClick } from './analytics';

const ShareButtons = ({ shortUrl }) => {
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (!isValidUrl(shortUrl)) {
    return <p>Invalid URL</p>;
  }

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shortUrl)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}`;

  const handleFacebookShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(facebookShareUrl, '_blank');
  };

  const handleTwitterShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(twitterShareUrl, '_blank');
  };

  const handleWhatsAppShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(whatsappShareUrl, '_blank');
  };

  const handleTelegramShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(telegramShareUrl, '_blank');
  };

  return (
    <div>
      <button onClick={handleFacebookShare}>Share on Facebook</button>
      <button onClick={handleTwitterShare}>Share on Twitter</button>
      <button onClick={handleWhatsAppShare}>Share on WhatsApp</button>
      <button onClick={handleTelegramShare}>Share on Telegram</button>
    </div>
  );
};

export default ShareButtons;
