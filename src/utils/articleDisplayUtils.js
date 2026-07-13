/**
 * Helpers for displaying articles on the public blog.
 */

import { generateSlug } from '../services/seoService';

/** Legacy numeric IDs from static blog → slug mapping for URL compatibility. */
export const LEGACY_ID_TO_SLUG = {
  1: generateSlug("L'Innovation Technologique au Service de l'Agriculture Togolaise"),
  2: generateSlug("Formation Arduino : Démystifier l'Électronique pour les Jeunes"),
  3: generateSlug('Le Serveur Automatique : Innovation et Tradition Réunies'),
  4: generateSlug("L'Importance de l'Éducation Technologique pour les Filles"),
};

/** Legacy image paths keyed by generated slug from original titles. */
const LEGACY_IMAGE_BY_SLUG = {
  [generateSlug("L'Innovation Technologique au Service de l'Agriculture Togolaise")]:
    '/images/projets/Projet(P.A.M.F)/image1.jpg',
  [generateSlug("Formation Arduino : Démystifier l'Électronique pour les Jeunes")]:
    '/images/projets/Formation_Arduino/formationArduino1.png',
  [generateSlug('Le Serveur Automatique : Innovation et Tradition Réunies')]:
    '/images/PROJET_SERVEUR_AUTOMATIQUE.mp4',
  [generateSlug("L'Importance de l'Éducation Technologique pour les Filles")]:
    '/images/projets/Projet(P.E.T.E)/eleve3.jpg',
};

export function getArticleMediaUrl(article) {
  if (article.featuredImage?.url) {
    return article.featuredImage.url;
  }
  if (article.slug && LEGACY_IMAGE_BY_SLUG[article.slug]) {
    return LEGACY_IMAGE_BY_SLUG[article.slug];
  }
  return null;
}

export function isImageUrl(url) {
  return typeof url === 'string' && /\.(png|jpe?g|svg|webp|gif)(\?.*)?$/i.test(url);
}

export function isVideoUrl(url) {
  return typeof url === 'string' && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export function formatReadTime(readTime) {
  if (typeof readTime === 'string') return readTime;
  if (typeof readTime === 'number') return `${readTime} min`;
  return '1 min';
}

export function formatPublishedDate(isoDate) {
  if (!isoDate) return '';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function truncateExcerpt(text, maxLength = 200) {
  if (!text) return '';
  const plain = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}…`;
}
