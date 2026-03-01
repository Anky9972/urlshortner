import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://trimlynk.com';

export const SEOMetadata = ({
  title,
  description,
  canonical,
  ogImage,
  keywords,
  author = "Your Name",
  twitterHandle = "@yourtwitterhandle"
}) => {
  const siteName = "TrimLink - URL Shortener";
  const defaultDescription = "Create short, customized URLs and track their performance with detailed analytics.";

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph metadata */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />

      {/* Twitter Card metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Robots directives */}
      <meta name="robots" content="index, follow" />

      {/* Additional SEO optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
    </Helmet>
  );
};

// JSON-LD Schema component for rich snippets
export const SEOSchema = ({ type, data }) => {
  const schemas = {
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "TrimLink",
      description: "Professional URL shortener service with analytics",
      url: APP_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${APP_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "TrimLink",
      url: APP_URL,
      logo: `${APP_URL}/images/logo.png`,
      sameAs: [
        APP_URL,
        "https://twitter.com/trimlink",
        "https://facebook.com/trimlink",
        "https://linkedin.com/company/trimlink"
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemas[type] || data)}
      </script>
    </Helmet>
  );
};

// PropTypes validation
SEOMetadata.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string.isRequired,
  ogImage: PropTypes.string,
  keywords: PropTypes.string,
  author: PropTypes.string,
  twitterHandle: PropTypes.string
};

SEOSchema.propTypes = {
  type: PropTypes.oneOf(['website', 'organization']),
  data: PropTypes.object
};

// Example usage in Dashboard component
const Dashboard = () => {
  return (
    <>
      <SEOMetadata
        title="Dashboard"
        description="Manage your shortened URLs and track their performance with detailed analytics."
        canonical={`${APP_URL}/dashboard`}
        keywords="url shortener, link management, analytics, dashboard"
        ogImage={`${APP_URL}/dashboard-preview.jpg`}
      />
      <SEOSchema type="website" />

      {/* Rest of your Dashboard component */}
    </>
  );
};

export default Dashboard;