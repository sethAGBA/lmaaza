import { useEffect, useRef } from 'react';
import { X, Clock, User, Tag, Folder, Calendar } from 'lucide-react';

/**
 * ArticlePreview — renders an article exactly as it will appear on the public blog.
 *
 * Requirements: 2.9 (preview shows article as it will appear publicly)
 *
 * @param {{
 *   article: {
 *     title?: string,
 *     content?: string,        // HTML from the Lexical editor
 *     excerpt?: string,
 *     author?: string,
 *     category?: string,
 *     tags?: string[],
 *     readTime?: number,
 *     publishedAt?: string,
 *     createdAt?: string,
 *     featuredImage?: { url?: string, altText?: string } | null,
 *   },
 *   isModal?: boolean,
 *   onClose?: () => void,
 * }} props
 */
const ArticlePreview = ({ article = {}, isModal = false, onClose }) => {
  const overlayRef = useRef(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!isModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModal, onClose]);

  // Close modal when clicking outside the content panel
  const handleOverlayClick = (e) => {
    if (isModal && e.target === overlayRef.current && onClose) {
      onClose();
    }
  };

  // ── Date formatting ──────────────────────────────────────────────────
  const displayDate = article.publishedAt || article.createdAt;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // ── Featured image ───────────────────────────────────────────────────
  const featuredImageUrl = article.featuredImage?.url ?? null;
  const featuredImageAlt = article.featuredImage?.altText || article.title || 'Image de couverture';

  // ── Article body ─────────────────────────────────────────────────────
  const ArticleBody = () => (
    <article className="bg-gray-50 min-h-full">
      {/* Hero / Featured image */}
      {featuredImageUrl && (
        <div className="w-full h-64 md:h-80 overflow-hidden">
          <img
            src={featuredImageUrl}
            alt={featuredImageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Placeholder image when none is set */}
      {!featuredImageUrl && (
        <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
          <span className="text-purple-400 text-sm italic">Aucune image de couverture</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Category badge */}
        {article.category && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wide">
              <Folder className="w-3 h-3" />
              {article.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
          {article.title || <span className="text-gray-400 italic">Sans titre</span>}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg text-gray-600 mb-6 leading-relaxed border-l-4 border-purple-400 pl-4 italic">
            {article.excerpt}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
          {article.author && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-gray-700">{article.author}</span>
            </span>
          )}

          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-500" />
              {formattedDate}
            </span>
          )}

          {article.readTime != null && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-500" />
              {article.readTime} min de lecture
            </span>
          )}
        </div>

        {/* Rich HTML content */}
        {article.content ? (
          <div
            className="article-content text-gray-700 leading-relaxed"
            /* Content comes from the admin's own Lexical editor — safe to render as HTML */
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-gray-400 italic">Aucun contenu à afficher.</p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-purple-100 hover:text-purple-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );

  // ── Modal wrapper ────────────────────────────────────────────────────
  if (isModal) {
    return (
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Prévisualisation de l'article"
        className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
        onClick={handleOverlayClick}
      >
        {/* Modal toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
              APERÇU
            </span>
            <span className="text-sm text-gray-500">
              Voici comment l'article apparaîtra sur le blog public
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la prévisualisation"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Fermer
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <ArticleBody />
        </div>
      </div>
    );
  }

  // ── Inline (non-modal) rendering ─────────────────────────────────────
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Inline header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
          APERÇU
        </span>
        <span className="text-xs text-gray-500">
          Rendu public de l'article
        </span>
      </div>
      <ArticleBody />
    </div>
  );
};

export default ArticlePreview;
