import { Helmet } from 'react-helmet-async';
import { generateOpenGraphTags } from '../services/seoService';

/**
 * SEO Component - Enhanced with react-helmet-async
 * 
 * Injects SEO metadata into HTML head for better search engine optimization.
 * Supports canonical URLs, meta descriptions, keywords, Open Graph tags, and Twitter cards.
 * 
 * Requirements: 6.7
 * 
 * @param {object} props - Component props
 * @param {string} [props.title] - Page title (if null, uses default)
 * @param {string} [props.description] - Meta description (if null, uses default)
 * @param {string|string[]} [props.keywords] - Meta keywords (string or array)
 * @param {string} [props.canonical] - Canonical URL
 * @param {string} [props.ogImage] - Open Graph image URL
 * @param {string} [props.type] - Open Graph type (default: "website")
 * @param {object} [props.structuredData] - JSON-LD structured data
 * @param {object} [props.article] - Article object for blog posts (auto-generates OG tags)
 * @returns {JSX.Element} Helmet component with SEO metadata
 */
const SEO = ({ 
  title = "L'Maaza - Innover au service des communautés",
  description = "L'Maaza développe des solutions technologiques innovantes pour l'Agriculture, la Santé, l'Éducation et l'Environnement au Togo. Formation des jeunes, projets technologiques et innovation durable.",
  keywords = "L'Maaza, technologie, innovation, agriculture, santé, éducation, environnement, Togo, formation, électronique, Arduino, développement web, énergie solaire",
  canonical = "https://lmaaza.net",
  ogImage = "https://lmaaza.net/og-image.jpg",
  type = "website",
  structuredData = null,
  article = null
}) => {
  // Build full title with site name
  const fullTitle = title.includes("L'Maaza") ? title : `${title} | L'Maaza`;
  
  // Ensure description has a value
  const fullDescription = description || "L'Maaza développe des solutions technologiques innovantes pour l'Agriculture, la Santé, l'Éducation et l'Environnement au Togo.";
  
  // Convert keywords to comma-separated string if array
  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  // If article is provided, generate Open Graph tags from article data
  let ogTags = null;
  if (article) {
    ogTags = generateOpenGraphTags(article);
  }

  // Use article-generated OG tags or fallback to provided props
  const ogTitle = ogTags?.ogTitle || fullTitle;
  const ogDescription = ogTags?.ogDescription || fullDescription;
  const ogImageUrl = ogTags?.ogImage || ogImage;
  const ogUrl = ogTags?.ogUrl || canonical;
  const ogType = ogTags?.ogType || type;

  return (
    <Helmet>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Basic Meta Tags */}
      <meta name="description" content={fullDescription} />
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      <meta name="author" content="L'Maaza" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="fr" />
      <meta name="revisit-after" content="7 days" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      <meta property="og:site_name" content="L'Maaza" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={ogUrl} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
      <meta name="twitter:site" content="@lmaaza" />
      <meta name="twitter:creator" content="@lmaaza" />

      {/* Theme and Appearance */}
      <meta name="theme-color" content="#7c3aed" />
      <meta name="msapplication-TileColor" content="#7c3aed" />

      {/* Geo Tags */}
      <meta name="geo.region" content="TG" />
      <meta name="geo.country" content="Togo" />
      <meta name="geo.placename" content="Togo" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;