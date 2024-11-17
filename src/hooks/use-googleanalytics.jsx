import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title
    });
  }, [location]);
};

export default useGoogleAnalytics;