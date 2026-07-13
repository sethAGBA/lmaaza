import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import SEO from '../components/SEO';
import ErrorBoundary from '../components/ErrorBoundary';
import ArticleCard from '../components/blog/ArticleCard';
import { useBlog } from '../contexts/BlogContext';
import { ARTICLE_STATUS } from '../models/article';
import {
  formatPublishedDate,
  formatReadTime,
  getArticleMediaUrl,
  isImageUrl,
  isVideoUrl,
  LEGACY_ID_TO_SLUG,
} from '../utils/articleDisplayUtils';

const Article = () => {
  const { id: idOrSlug } = useParams();
  const { articleService } = useBlog();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const found = await articleService.resolveArticle(idOrSlug);

        if (cancelled) return;

        if (!found || found.status !== ARTICLE_STATUS.PUBLISHED) {
          setNotFound(true);
          setArticle(null);
          return;
        }

        setArticle(found);
        const suggestions = await articleService.getSuggestedRelatedArticles(found.id, 3);
        if (!cancelled) setRelated(suggestions);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [articleService, idOrSlug]);

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-500">Chargement de l&apos;article…</div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Article non trouvé</h1>
          <p className="mt-4">L&apos;article demandé n&apos;existe pas ou n&apos;est pas publié.</p>
          <Link to="/blog" className="mt-4 inline-block text-purple-600">
            ← Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  // Redirect legacy numeric URLs (/blog/1) to slug URLs
  if (LEGACY_ID_TO_SLUG[idOrSlug] && article.slug && idOrSlug !== article.slug) {
    return <Navigate to={`/blog/${article.slug}`} replace />;
  }

  const mediaUrl = getArticleMediaUrl(article);
  const isImage = mediaUrl && isImageUrl(mediaUrl);
  const isVideo = mediaUrl && isVideoUrl(mediaUrl);
  const altText = article.featuredImage?.altText || article.title;

  return (
    <>
      <SEO article={article} />

      <ErrorBoundary title="Erreur d'affichage de l'article">
        <article className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-3xl">
            {isVideo ? (
              <div className="mb-6 w-full overflow-hidden rounded-lg">
                <video
                  src={mediaUrl}
                  className="w-full h-auto max-h-96 object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Vidéo : ${article.title}`}
                />
              </div>
            ) : isImage ? (
              <div className="mb-6 w-full h-64 overflow-hidden rounded-lg">
                <img
                  src={mediaUrl}
                  alt={altText}
                  className="object-cover w-full h-full"
                  loading="eager"
                />
              </div>
            ) : null}

            <header>
              <span className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                {article.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{article.title}</h1>
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <time dateTime={article.publishedAt}>
                    {formatPublishedDate(article.publishedAt)}
                  </time>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>{formatReadTime(article.readTime)}</span>
                </div>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Tag className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-sm bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            <div
              className="prose max-w-none text-gray-700 article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <footer className="mt-8">
              <Link to="/blog" className="text-purple-600 font-semibold">
                ← Retour au blog
              </Link>
            </footer>

            {related.length > 0 && (
              <section className="mt-16" aria-labelledby="related-heading">
                <h2 id="related-heading" className="text-2xl font-bold text-gray-800 mb-6">
                  Articles similaires
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map((rel) => (
                    <ArticleCard key={rel.id} article={rel} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </ErrorBoundary>
    </>
  );
};

export default Article;
