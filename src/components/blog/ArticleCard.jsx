import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User, Video, Pencil } from 'lucide-react';
import {
  formatPublishedDate,
  formatReadTime,
  getArticleMediaUrl,
  isImageUrl,
  isVideoUrl,
  truncateExcerpt,
} from '../../utils/articleDisplayUtils';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ArticleCard — aperçu d'un article publié.
 * Requirements: 9.3, 12.7
 */
const ArticleCard = memo(function ArticleCard({
  article,
  searchQuery = '',
  onVideoClick,
  highlightFn,
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const mediaUrl = getArticleMediaUrl(article);
  const isImage = mediaUrl && isImageUrl(mediaUrl);
  const isVideo = mediaUrl && isVideoUrl(mediaUrl);
  const altText =
    article.featuredImage?.altText || article.title || 'Image de l\'article';

  const titleHtml =
    searchQuery && highlightFn
      ? highlightFn(article.title, searchQuery)
      : article.title;

  const excerptText = truncateExcerpt(article.excerpt, 200);
  const excerptHtml =
    searchQuery && highlightFn
      ? highlightFn(excerptText, searchQuery)
      : excerptText;

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col relative">
      {/* Bouton d'édition admin */}
      {isAdmin && (
        <Link
          to={`/admin/blog/edit/${article.id}`}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-2 py-1 rounded-md shadow transition-colors"
          title="Modifier cet article"
          aria-label={`Modifier l'article "${article.title}"`}
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="w-3 h-3" />
          Modifier
        </Link>
      )}
      <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden relative">
        {isVideo ? (
          <div className="relative w-full h-full">
            <img
              src="/images/video-poster.jpg"
              alt=""
              className="object-cover w-full h-full"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <button
                type="button"
                onClick={() => onVideoClick?.(mediaUrl)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                aria-label={`Voir la vidéo : ${article.title}`}
              >
                <Video className="w-5 h-5" aria-hidden="true" />
                Voir la vidéo
              </button>
            </div>
          </div>
        ) : isImage ? (
          <img
            src={mediaUrl}
            alt={altText}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="text-6xl text-gray-400" aria-hidden="true">
            📄
          </div>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center mb-3">
          <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
            {article.category}
          </span>
        </div>

        <h3
          className="text-xl font-bold text-gray-800 mb-3 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />

        <p
          className="text-gray-600 mb-4 line-clamp-3 flex-grow"
          dangerouslySetInnerHTML={{ __html: excerptHtml }}
        />

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" aria-hidden="true" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
            <span>{formatReadTime(article.readTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
            <time dateTime={article.publishedAt} className="text-sm">
              {formatPublishedDate(article.publishedAt)}
            </time>
          </div>
          <Link
            to={`/blog/${article.slug || article.id}`}
            className="text-purple-600 hover:text-purple-800 font-semibold flex items-center"
          >
            Lire la suite
            <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
});

export default ArticleCard;
