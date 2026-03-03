import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://trimlynk.com';
const DEFAULT_OG_IMAGE = `${APP_URL}/images/og-banner.png`;
const SITE_NAME = 'TrimLink';
const DEFAULT_DESCRIPTION = 'Free URL shortener with analytics, QR code generator, geo-targeting, and link-in-bio page builder.';
const DEFAULT_KEYWORDS = 'url shortener, free url shortener, QR code generator, link analytics, linktree alternative, custom short links';

export const SEOMetadata = ({
  title,
  description,
  canonical,
  ogImage,
  keywords,
  author = 'TrimLink',
  twitterHandle = '@trimlynk',
  noIndex = false,
  language = 'en',
}) => {
  const fullTitle = title
    ? (title.toLowerCase().includes('trimlink') ? title : `${title} | ${SITE_NAME}`)
    : `${SITE_NAME} – Free URL Shortener, QR Code Generator & LinkTree Builder`;

  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const resolvedImage = ogImage || DEFAULT_OG_IMAGE;
  const resolvedCanonical = canonical || APP_URL;

  return (
    <Helmet>
      <html lang={language} />

      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {keywords && <meta name="keywords" content={keywords || DEFAULT_KEYWORDS} />}
      <meta name="author" content={author} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="format-detection" content="telephone=no" />

      {/* Canonical */}
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:alt" content={`${SITE_NAME} – ${title || 'URL Shortener'}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Helmet>
  );
};

// JSON-LD Schema component for rich snippets
export const SEOSchema = ({ type, data }) => {
  const schemas = {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: APP_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${APP_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: APP_URL,
      logo: `${APP_URL}/images/logo.png`,
      description: DEFAULT_DESCRIPTION,
      sameAs: [APP_URL],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemas[type] || data)}
      </script>
    </Helmet>
  );
};

SEOMetadata.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string,
  ogImage: PropTypes.string,
  keywords: PropTypes.string,
  author: PropTypes.string,
  twitterHandle: PropTypes.string,
  noIndex: PropTypes.bool,
  language: PropTypes.string,
};

SEOSchema.propTypes = {
  type: PropTypes.oneOf(['website', 'organization']),
  data: PropTypes.object,
};

export default SEOMetadata;

export default Dashboard;