import { useState, useCallback, useMemo } from 'react';
import { Search, Info, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * SEOMetadataEditor component.
 * Allows editing SEO title, meta description and keywords for an article,
 * shows character counts, and renders a Google-like search result preview.
 *
 * Requirements: 6.1, 6.2, 6.3
 *
 * @param {{
 *   metadata: {
 *     title: string | null,
 *     description: string | null,
 *     keywords: string[]
 *   },
 *   articleTitle?: string,
 *   articleExcerpt?: string,
 *   articleSlug?: string,
 *   onChange: (metadata: object) => void
 * }} props
 */
const SEOMetadataEditor = ({
  metadata = {},
  articleTitle = '',
  articleExcerpt = '',
  articleSlug = '',
  onChange,
}) => {
  const SEO_TITLE_MAX = 60;
  const SEO_DESC_MAX = 160;
  const KEYWORDS_MAX = 10;
  const KEYWORD_MAX_LENGTH = 50;

  // Local keyword input state
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordError, setKeywordError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  // ── Derived values ─────────────────────────────────────────────────────
  const title = metadata.title ?? '';
  const description = metadata.description ?? '';
  const keywords = useMemo(
    () => (Array.isArray(metadata.keywords) ? metadata.keywords : []),
    [metadata.keywords]
  );

  // Effective preview values (fall back to article title/excerpt if SEO fields empty)
  const previewTitle = title.trim() || articleTitle.trim() || 'Titre de l\'article';
  const previewDesc =
    description.trim() ||
    (articleExcerpt ? articleExcerpt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, SEO_DESC_MAX) : '') ||
    'Description de l\'article…';
  const previewUrl = `https://lmaaza.com/blog/${articleSlug || 'article'}`;

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleTitleChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value.length <= SEO_TITLE_MAX) {
        onChange({ ...metadata, title: value || null });
      }
    },
    [metadata, onChange]
  );

  const handleDescChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value.length <= SEO_DESC_MAX) {
        onChange({ ...metadata, description: value || null });
      }
    },
    [metadata, onChange]
  );

  const handleAddKeyword = useCallback(
    (e) => {
      e.preventDefault();
      const kw = keywordInput.trim();
      if (!kw) return;

      if (kw.length > KEYWORD_MAX_LENGTH) {
        setKeywordError(`Chaque mot-clé ne peut pas dépasser ${KEYWORD_MAX_LENGTH} caractères`);
        return;
      }
      if (keywords.length >= KEYWORDS_MAX) {
        setKeywordError(`Vous ne pouvez pas ajouter plus de ${KEYWORDS_MAX} mots-clés`);
        return;
      }
      if (keywords.includes(kw)) {
        setKeywordInput('');
        return;
      }

      setKeywordError('');
      setKeywordInput('');
      onChange({ ...metadata, keywords: [...keywords, kw] });
    },
    [keywordInput, keywords, metadata, onChange]
  );

  const handleRemoveKeyword = useCallback(
    (kw) => {
      onChange({ ...metadata, keywords: keywords.filter((k) => k !== kw) });
    },
    [keywords, metadata, onChange]
  );

  // ── Character-count colour helpers ─────────────────────────────────────
  const charCountClass = (current, max) => {
    const ratio = current / max;
    if (ratio >= 1) return 'text-red-600 font-semibold';
    if (ratio >= 0.9) return 'text-orange-500 font-semibold';
    if (ratio >= 0.7) return 'text-yellow-600';
    return 'text-gray-400';
  };

  // Indicator: good / warning / danger
  const titleStatus = () => {
    if (!title) return null;
    if (title.length > SEO_TITLE_MAX) return 'danger';
    if (title.length >= SEO_TITLE_MAX * 0.9) return 'warning';
    return 'good';
  };

  const descStatus = () => {
    if (!description) return null;
    if (description.length > SEO_DESC_MAX) return 'danger';
    if (description.length >= SEO_DESC_MAX * 0.9) return 'warning';
    return 'good';
  };

  const StatusIcon = ({ status }) => {
    if (status === 'good') return <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden="true" />;
    if (status === 'danger') return <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />;
    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <section
      aria-labelledby="seo-editor-heading"
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors rounded-xl"
        aria-expanded={!collapsed}
        aria-controls="seo-editor-body"
      >
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-600" aria-hidden="true" />
          <h2 id="seo-editor-heading" className="text-base font-semibold text-gray-800">
            Référencement (SEO)
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            Optionnel
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" />
        )}
      </button>

      {/* Body */}
      {!collapsed && (
        <div id="seo-editor-body" className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-5">

          {/* Info banner */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Si ces champs sont laissés vides, le titre et l'extrait de l'article seront utilisés
              comme métadonnées SEO par défaut.
            </p>
          </div>

          {/* SEO Title */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <label htmlFor="seo-title" className="block text-sm font-medium text-gray-700">
                Titre SEO
              </label>
              <StatusIcon status={titleStatus()} />
            </div>
            <input
              type="text"
              id="seo-title"
              value={title}
              onChange={handleTitleChange}
              maxLength={SEO_TITLE_MAX}
              placeholder={articleTitle || 'Titre affiché dans les résultats de recherche'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Recommandé : 50–60 caractères
              </p>
              <span className={`text-xs ${charCountClass(title.length, SEO_TITLE_MAX)}`}>
                {title.length}/{SEO_TITLE_MAX}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-1.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  title.length >= SEO_TITLE_MAX
                    ? 'bg-red-500'
                    : title.length >= SEO_TITLE_MAX * 0.9
                    ? 'bg-orange-400'
                    : title.length >= SEO_TITLE_MAX * 0.7
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
                }`}
                style={{ width: `${Math.min((title.length / SEO_TITLE_MAX) * 100, 100)}%` }}
                role="progressbar"
                aria-valuenow={title.length}
                aria-valuemin={0}
                aria-valuemax={SEO_TITLE_MAX}
                aria-label="Utilisation du titre SEO"
              />
            </div>
          </div>

          {/* SEO Description */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <label htmlFor="seo-description" className="block text-sm font-medium text-gray-700">
                Meta description
              </label>
              <StatusIcon status={descStatus()} />
            </div>
            <textarea
              id="seo-description"
              value={description}
              onChange={handleDescChange}
              maxLength={SEO_DESC_MAX}
              rows={3}
              placeholder={
                articleExcerpt
                  ? articleExcerpt.replace(/<[^>]*>/g, '').slice(0, SEO_DESC_MAX)
                  : 'Description affichée dans les résultats de recherche'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Recommandé : 120–160 caractères
              </p>
              <span className={`text-xs ${charCountClass(description.length, SEO_DESC_MAX)}`}>
                {description.length}/{SEO_DESC_MAX}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-1.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  description.length >= SEO_DESC_MAX
                    ? 'bg-red-500'
                    : description.length >= SEO_DESC_MAX * 0.9
                    ? 'bg-orange-400'
                    : description.length >= SEO_DESC_MAX * 0.7
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
                }`}
                style={{ width: `${Math.min((description.length / SEO_DESC_MAX) * 100, 100)}%` }}
                role="progressbar"
                aria-valuenow={description.length}
                aria-valuemin={0}
                aria-valuemax={SEO_DESC_MAX}
                aria-label="Utilisation de la meta description"
              />
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="seo-keyword-input" className="block text-sm font-medium text-gray-700 mb-1">
              Mots-clés SEO{' '}
              <span className="text-gray-400 text-xs font-normal">
                (max {KEYWORDS_MAX}, séparés par Entrée)
              </span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                id="seo-keyword-input"
                value={keywordInput}
                onChange={(e) => {
                  setKeywordInput(e.target.value);
                  setKeywordError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddKeyword(e);
                }}
                placeholder="Ex : agriculture, Togo, innovation…"
                maxLength={KEYWORD_MAX_LENGTH}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-describedby={keywordError ? 'kw-error' : undefined}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={keywords.length >= KEYWORDS_MAX}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>

            {keywordError && (
              <p id="kw-error" role="alert" className="text-xs text-red-600 mt-1">
                {keywordError}
              </p>
            )}

            {/* Keyword chips */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Mots-clés SEO">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    role="listitem"
                    className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      aria-label={`Supprimer le mot-clé "${kw}"`}
                      className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200 transition-colors text-purple-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1">{keywords.length}/{KEYWORDS_MAX} mots-clés</p>
          </div>

          {/* ── Google-style search result preview ─────────────────────── */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Aperçu dans les résultats de recherche
            </p>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              {/* Fake Google chrome bar */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                  <Search className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{previewTitle}</span>
                </div>
              </div>

              {/* SERP result card */}
              <div className="max-w-xl">
                {/* URL breadcrumb */}
                <div className="text-xs text-gray-500 mb-0.5 truncate">{previewUrl}</div>

                {/* Title */}
                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="block text-lg font-medium text-blue-700 hover:underline mb-1 leading-tight truncate"
                  aria-label="Titre dans les résultats de recherche (aperçu)"
                >
                  {previewTitle}
                </a>

                {/* Description */}
                <p
                  className="text-sm text-gray-600 leading-snug"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {previewDesc}
                </p>
              </div>
            </div>

            {/* Hints below the preview */}
            <div className="mt-2 space-y-1">
              {title && title.length < 30 && (
                <p className="flex items-center gap-1.5 text-xs text-yellow-700">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  Le titre SEO est court. Essayez de l'allonger pour améliorer le référencement.
                </p>
              )}
              {description && description.length < 70 && (
                <p className="flex items-center gap-1.5 text-xs text-yellow-700">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  La meta description est courte. Une description plus longue est préférable.
                </p>
              )}
              {!title && (
                <p className="flex items-center gap-1.5 text-xs text-blue-600">
                  <Info className="w-3.5 h-3.5" aria-hidden="true" />
                  Le titre de l'article sera utilisé comme titre SEO par défaut.
                </p>
              )}
              {!description && (
                <p className="flex items-center gap-1.5 text-xs text-blue-600">
                  <Info className="w-3.5 h-3.5" aria-hidden="true" />
                  L'extrait de l'article sera utilisé comme meta description par défaut.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SEOMetadataEditor;
