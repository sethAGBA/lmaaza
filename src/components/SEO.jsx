import { useEffect } from 'react';

const setMeta = (key, value, isProperty = false) => {
  if (!value && value !== '') return;
  const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (isProperty) el.setAttribute('property', key);
    else el.setAttribute('name', key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

const SEO = ({ 
  title = "L'Maaza - Innover au service des communautés",
  description = "L'Maaza développe des solutions technologiques innovantes pour l'Agriculture, la Santé, l'Éducation et l'Environnement au Togo. Formation des jeunes, projets technologiques et innovation durable.",
  keywords = "L'Maaza, technologie, innovation, agriculture, santé, éducation, environnement, Togo, formation, électronique, Arduino, développement web, énergie solaire",
  canonical = "https://lmaaza.net",
  ogImage = "https://lmaaza.net/og-image.jpg",
  type = "website",
  structuredData = null
}) => {
  useEffect(() => {
    const fullTitle = title.includes("L'Maaza") ? title : `${title} | L'Maaza`;
    const fullDescription = description || "L'Maaza développe des solutions technologiques innovantes pour l'Agriculture, la Santé, l'Éducation et l'Environnement au Togo.";

    // Title
    document.title = fullTitle;

    // Basic metas
    setMeta('description', fullDescription);
    setMeta('keywords', keywords);
    setMeta('author', "L'Maaza");
    setMeta('robots', 'index, follow');
    setMeta('language', 'fr');
    setMeta('revisit-after', '7 days');

    // Canonical link
    let canonicalEl = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonical);

    // Open Graph
    setMeta('og:type', type, true);
    setMeta('og:url', canonical, true);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', fullDescription, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:site_name', "L'Maaza", true);
    setMeta('og:locale', 'fr_FR', true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:url', canonical);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', fullDescription);
    setMeta('twitter:image', ogImage);
    setMeta('twitter:site', '@lmaaza');
    setMeta('twitter:creator', '@lmaaza');

    // Additional
    setMeta('theme-color', '#7c3aed');
    setMeta('msapplication-TileColor', '#7c3aed');
    setMeta('viewport', 'width=device-width, initial-scale=1.0');

    // Geo
    setMeta('geo.region', 'TG');
    setMeta('geo.country', 'Togo');
    setMeta('geo.placename', 'Togo');

    // Structured data
    if (structuredData) {
      let sd = document.getElementById('seo-ldjson');
      if (!sd) {
        sd = document.createElement('script');
        sd.setAttribute('type', 'application/ld+json');
        sd.setAttribute('id', 'seo-ldjson');
        document.head.appendChild(sd);
      }
      sd.innerHTML = JSON.stringify(structuredData);
    }

    // no cleanup on unmount to keep tags stable across route changes; override on next mount
  }, [title, description, keywords, canonical, ogImage, type, structuredData]);

  return null;
};

export default SEO;