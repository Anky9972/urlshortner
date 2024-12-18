import { storeClicks } from "@/db/apiClicks";
import { getLongUrl } from "@/db/apiUrls";
import { handleUrlRedirect } from "@/db/freeUrls";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const RedirectLink = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, data, fn } = useFetch(getLongUrl, id);

  const { loading: loadingStats, fn: fnStats } = useFetch(storeClicks, {
    id: data?.id,
    originalUrl: data?.original_url,
  });

  useEffect(() => {
    fn();
  }, []);

  useEffect(() => {
    if (!loading && data) {
      const currentDate = new Date();
      const expirationDate = new Date(data.expiration_date);

      if (data.expiration_date && expirationDate < currentDate) {
        navigate("/link-expired")
      } else {
        fnStats();
        window.location.href = data.original_url;
      }
    }
  }, [data, loading, navigate, fnStats]);
  
  useEffect(() => {
    const performRedirect = async () => {
      const originalUrl = await handleUrlRedirect(id);
      
      if (originalUrl) {
        window.location.href = originalUrl;
      } else {
        navigate('/not-found');
      }
    };

    performRedirect();
  }, [id, navigate]);

  if (loading || loadingStats) {
    return (
      <>
        <BarLoader width={"100%"} color="#36d7b7" />
        <br />
        Redirecting...
      </>
    );
  }

  return null;
};

export default RedirectLink;
