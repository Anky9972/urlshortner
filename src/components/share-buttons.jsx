import React from 'react';
import { trackLinkClick } from './analytics';

const ShareButtons = ({ shortUrl }) => {
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`;

  const handleFacebookShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(facebookShareUrl, '_blank');
  };

  const handleTwitterShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(twitterShareUrl, '_blank');
  };

  return (
    <div>
      <button onClick={handleFacebookShare}>Share on Facebook</button>
      <button onClick={handleTwitterShare}>Share on Twitter</button>
    </div>
  );
};

export default ShareButtons;
