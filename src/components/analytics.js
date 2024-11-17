
export const trackLinkClick = (shortUrl) => {
    if (window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'Link',
        event_label: shortUrl,
      });
    }
  };
  