import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Eye,
  Upload,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { generateSlug } from '../../services/seoService';
import { VALID_CATEGORIES, createDefaultSEOMetadata } from '../../models/article';
import RichTextEditor from '../../components/admin/RichTextEditor';
import ArticlePreview from '../../components/admin/ArticlePreview';
import MediaLibrary from '../../components/admin/MediaLibrary';
import SEOMetadataEditor from '../../components/admin/SEOMetadataEditor';

/**
 * ArticleEditorPage component for creating and editing articles.
 * Requirements: 1.1, 1.2, 2.5, 2.9, 3.1, 3.2, 3.3, 3.4, 5.3, 5.4, 8.1, 8.2, 8.3
 *
 * @param {{
 *   articleService: import('../../services/articleService').ArticleService,
 *   mediaService: import('../../services/mediaService').MediaService
 * }} props
 */
const ArticleEditorPage = ({ articleService, mediaService }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // ── Form state ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    author: '',
    featuredImage: null,
    seoMetadata: createDefaultSEOMetadata(),
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ── UI state ───────────────────────────────────────────────────────────
  const [articleStatus, setArticleStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  // ── Preview state ──────────────────────────────────────────────────────
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Media modals state (Tasks 9.5 & 9.6) ──────────────────────────────
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = useState(false);
  const [contentImageModalOpen, setContentImageModalOpen] = useState(false);
  const [contentVideoModalOpen, setContentVideoModalOpen] = useState(false);
  const [imageToInsert, setImageToInsert] = useState(null);

  // ── Auto-save timer ref ────────────────────────────────────────────────
  const autoSaveTimerRef = useRef(null);
  const currentArticleIdRef = useRef(null);

  // ── Load article for editing ───────────────────────────────────────────
  useEffect(() => {
    if (isEditMode) {
      loadArticle(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const loadArticle = async (articleId) => {
    try {
      setLoading(true);
      setError(null);
      const article = await articleService.getArticle(articleId);

      if (!article) {
        setError('Article non trouvé.');
        return;
      }

      setFormData({
        title: article.title || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        category: article.category || '',
        tags: article.tags || [],
        author: article.author || '',
        featuredImage: article.featuredImage || null,
        seoMetadata: article.seoMetadata || createDefaultSEOMetadata(),
      });
      setArticleStatus(article.status || 'draft');
      currentArticleIdRef.current = articleId;
    } catch (err) {
      setError('Impossible de charger l\'article. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-save every 30 seconds ─────────────────────────────────────────
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(() => {
      if (formData.title.trim() || formData.content.trim()) {
        handleAutoSave();
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleAutoSave = async () => {
    if (saving || publishing) return;

    try {
      setAutoSaveStatus('saving');

      const articleData = {
        ...formData,
        slug: generateSlug(formData.title || 'article'),
      };

      if (currentArticleIdRef.current) {
        await articleService.updateArticle(currentArticleIdRef.current, articleData, {
          skipAuth: true,
        });
      } else {
        const created = await articleService.createArticle(articleData, {
          skipAuth: true,
        });
        currentArticleIdRef.current = created.id;
        window.history.replaceState(null, '', `/admin/blog/edit/${created.id}`);
      }

      setAutoSaveStatus('saved');
      setLastSaved(new Date());

      setTimeout(() => {
        setAutoSaveStatus('');
      }, 3000);
    } catch (err) {
      setAutoSaveStatus('error');
      console.error('Auto-save failed:', err);
    }
  };

  // ── Form validation ────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Le titre ne peut pas dépasser 200 caractères';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'L\'extrait est requis';
    } else if (formData.excerpt.length > 200) {
      newErrors.excerpt = 'L\'extrait ne peut pas dépasser 200 caractères';
    }

    const plainContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!plainContent) {
      newErrors.content = 'Le contenu est requis';
    } else if (plainContent.length < 100) {
      newErrors.content = 'Le contenu doit contenir au moins 100 caractères';
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    } else if (!VALID_CATEGORIES.includes(formData.category)) {
      newErrors.category = 'Catégorie invalide';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'L\'auteur est requis';
    } else if (formData.author.length > 100) {
      newErrors.author = 'Le nom de l\'auteur ne peut pas dépasser 100 caractères';
    }

    if (formData.tags.length > 10) {
      newErrors.tags = 'Un article ne peut pas avoir plus de 10 tags';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ── Form handlers ──────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();

    const tag = tagInput.trim();
    if (!tag) return;

    if (formData.tags.length >= 10) {
      setErrors((prev) => ({
        ...prev,
        tags: 'Un article ne peut pas avoir plus de 10 tags',
      }));
      return;
    }

    if (tag.length > 50) {
      setErrors((prev) => ({
        ...prev,
        tags: 'Chaque tag ne peut pas dépasser 50 caractères',
      }));
      return;
    }

    if (formData.tags.includes(tag)) {
      setTagInput('');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
    setTagInput('');

    if (errors.tags) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tags;
        return newErrors;
      });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // ── Save handlers ──────────────────────────────────────────────────────
  const handleSaveAsDraft = async () => {
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const articleData = {
        ...formData,
        slug: generateSlug(formData.title),
      };

      if (currentArticleIdRef.current) {
        await articleService.updateArticle(currentArticleIdRef.current, articleData, {
          skipAuth: true,
        });
        setSuccessMessage('Brouillon enregistré avec succès');
      } else {
        const created = await articleService.createArticle(articleData, {
          skipAuth: true,
        });
        currentArticleIdRef.current = created.id;
        window.history.replaceState(null, '', `/admin/blog/edit/${created.id}`);
        setSuccessMessage('Brouillon créé avec succès');
      }

      setLastSaved(new Date());

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Impossible d\'enregistrer le brouillon');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      setPublishing(true);
      setError(null);
      setSuccessMessage(null);

      const articleData = {
        ...formData,
        slug: generateSlug(formData.title),
      };

      let articleId = currentArticleIdRef.current;

      if (!articleId) {
        const created = await articleService.createArticle(articleData, {
          skipAuth: true,
        });
        articleId = created.id;
        currentArticleIdRef.current = articleId;
      } else {
        await articleService.updateArticle(articleId, articleData, {
          skipAuth: true,
        });
      }

      await articleService.publishArticle(articleId, { skipAuth: true });

      setArticleStatus('published');
      setSuccessMessage('Article publié avec succès');

      setTimeout(() => {
        navigate('/admin/blog');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Impossible de publier l\'article');
    } finally {
      setPublishing(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/blog');
  };

  // ── Preview handler — Requirement 2.9 ─────────────────────────────────
  const handlePreview = () => setPreviewOpen(true);
  const handleClosePreview = () => setPreviewOpen(false);

  // ── Unpublish handler ──────────────────────────────────────────────────
  const handleUnpublish = async () => {
    if (!currentArticleIdRef.current) return;

    try {
      setUnpublishing(true);
      setError(null);
      setSuccessMessage(null);

      await articleService.unpublishArticle(currentArticleIdRef.current, { skipAuth: true });

      setArticleStatus('draft');
      setSuccessMessage('Article dépublié et repassé en brouillon');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Impossible de dépublier l\'article');
    } finally {
      setUnpublishing(false);
    }
  };

  // ── Media modal handlers (Tasks 9.5 & 9.6) ────────────────────────────

  /** Task 9.5 — opens MediaLibrary to select an image for editor insertion */
  const handleOpenContentImageModal = useCallback(() => {
    setContentImageModalOpen(true);
  }, []);

  /** Task 9.5 — called when user picks an image in the content modal */
  const handleContentImageSelected = useCallback((asset) => {
    setImageToInsert(asset);
    setContentImageModalOpen(false);
  }, []);

  /** Task 9.5 — called by ImageInsertPlugin after it inserts the image */
  const handleImageInserted = useCallback(() => {
    setImageToInsert(null);
  }, []);

  /** Task 19.2 — insert video HTML into article content */
  const handleOpenContentVideoModal = useCallback(() => {
    setContentVideoModalOpen(true);
  }, []);

  const handleContentVideoSelected = useCallback((asset) => {
    const videoHtml = `<video src="${asset.url}" controls playsinline preload="metadata" class="w-full rounded-lg my-4"></video>`;
    setFormData((prev) => ({
      ...prev,
      content: `${prev.content || ''}${videoHtml}`,
    }));
    setContentVideoModalOpen(false);
  }, []);

  /** Task 9.6 — opens MediaLibrary to select the featured image */
  const handleOpenFeaturedImageModal = useCallback(() => {
    setFeaturedImageModalOpen(true);
  }, []);

  /** Task 9.6 — called when user picks a featured image */
  const handleFeaturedImageSelected = useCallback((asset) => {
    setFormData((prev) => ({ ...prev, featuredImage: asset }));
    setFeaturedImageModalOpen(false);
  }, []);

  /** Task 9.6 — removes the featured image */
  const handleRemoveFeaturedImage = useCallback(() => {
    setFormData((prev) => ({ ...prev, featuredImage: null }));
  }, []);

  // ── Character count helpers ────────────────────────────────────────────
  const getCharCountClass = (current, max) => {
    const ratio = current / max;
    if (ratio >= 0.9) return 'text-red-600 font-semibold';
    if (ratio >= 0.7) return 'text-yellow-600';
    return 'text-gray-500';
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Modifier l\'article' : 'Nouvel article'}
            </h1>
            {/* Visual status indicator — Requirement 8.7 */}
            {articleStatus === 'published' ? (
              <span
                aria-label="Statut : publié"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Publié
              </span>
            ) : (
              <span
                aria-label="Statut : brouillon"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
              >
                <Clock className="w-3.5 h-3.5" />
                Brouillon
              </span>
            )}
          </div>

          {/* Auto-save status */}
          <div className="flex items-center gap-2 text-sm">
            {autoSaveStatus === 'saving' && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Enregistrement automatique...</span>
              </div>
            )}
            {autoSaveStatus === 'saved' && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Enregistré automatiquement</span>
              </div>
            )}
            {autoSaveStatus === 'error' && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Échec de l'enregistrement automatique</span>
              </div>
            )}
            {lastSaved && !autoSaveStatus && (
              <span className="text-gray-400">
                Dernière sauvegarde : {lastSaved.toLocaleTimeString('fr-FR')}
              </span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Success banner */}
        {successMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* ── Featured image (Task 9.6 — Requirement 5.3) ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de couverture{' '}
              <span className="text-gray-400 text-xs">(optionnel)</span>
            </label>

            {formData.featuredImage ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={formData.featuredImage.url}
                  alt={formData.featuredImage.altText || formData.featuredImage.fileName}
                  className="w-full max-h-56 object-cover"
                />
                <div className="p-3 flex items-center justify-between bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                    <ImageIcon className="w-4 h-4 flex-shrink-0 text-purple-600" />
                    <span className="truncate font-medium">{formData.featuredImage.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={handleOpenFeaturedImageModal}
                      className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                    >
                      Changer
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFeaturedImage}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      aria-label="Supprimer l'image de couverture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenFeaturedImageModal}
                disabled={!mediaService}
                className="flex items-center gap-2 px-4 py-3 w-full border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon className="w-5 h-5 flex-shrink-0" />
                Sélectionner l'image de couverture
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                touched.title && errors.title
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Entrez le titre de l'article"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-1">
              {touched.title && errors.title ? (
                <p className="text-sm text-red-600">{errors.title}</p>
              ) : (
                <p className="text-sm text-gray-500">Maximum 200 caractères</p>
              )}
              <span className={`text-xs ${getCharCountClass(formData.title.length, 200)}`}>
                {formData.title.length}/200
              </span>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Extrait <span className="text-red-500">*</span>
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              onBlur={() => handleBlur('excerpt')}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                touched.excerpt && errors.excerpt
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Entrez un résumé de l'article"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-1">
              {touched.excerpt && errors.excerpt ? (
                <p className="text-sm text-red-600">{errors.excerpt}</p>
              ) : (
                <p className="text-sm text-gray-500">Maximum 200 caractères</p>
              )}
              <span className={`text-xs ${getCharCountClass(formData.excerpt.length, 200)}`}>
                {formData.excerpt.length}/200
              </span>
            </div>
          </div>

          {/* Content — RichTextEditor (Requirement 2.8 / 2.9) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              initialContent={formData.content}
              onChange={(html) => {
                handleChange('content', html);
                handleBlur('content');
              }}
              onImageInsert={handleOpenContentImageModal}
              imageToInsert={imageToInsert}
              onImageInserted={handleImageInserted}
              className={touched.content && errors.content ? 'ring-2 ring-red-400' : ''}
            />
            {mediaService && (
              <button
                type="button"
                onClick={handleOpenContentVideoModal}
                className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Insérer une vidéo dans le contenu
              </button>
            )}
            <div className="flex justify-between items-center mt-1">
              {touched.content && errors.content ? (
                <p className="text-sm text-red-600">{errors.content}</p>
              ) : (
                <p className="text-sm text-gray-500">Minimum 100 caractères</p>
              )}
              <span
                className={`text-xs ${
                  formData.content.replace(/<[^>]*>/g, '').trim().length < 100
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {formData.content.replace(/<[^>]*>/g, '').trim().length} caractères
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              onBlur={() => handleBlur('category')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                touched.category && errors.category
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez une catégorie</option>
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {touched.category && errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-1">
              Tags <span className="text-gray-400 text-xs">(optionnel, max 10)</span>
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Entrez un tag et appuyez sur Entrée"
                maxLength={50}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Ajouter
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                      aria-label={`Supprimer le tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {errors.tags && (
              <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.tags.length}/10 tags
            </p>
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Auteur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              onBlur={() => handleBlur('author')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                touched.author && errors.author
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Entrez le nom de l'auteur"
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-1">
              {touched.author && errors.author ? (
                <p className="text-sm text-red-600">{errors.author}</p>
              ) : (
                <p className="text-sm text-gray-500">Maximum 100 caractères</p>
              )}
              <span className={`text-xs ${getCharCountClass(formData.author.length, 100)}`}>
                {formData.author.length}/100
              </span>
            </div>
          </div>

          {/* SEO Metadata */}
          <SEOMetadataEditor
            metadata={formData.seoMetadata}
            articleTitle={formData.title}
            articleExcerpt={formData.excerpt}
            articleSlug={generateSlug(formData.title || 'article')}
            onChange={(metadata) => handleChange('seoMetadata', metadata)}
          />

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>

            <div className="flex-1" />

            {/* Preview button — Requirement 2.9 */}
            <button
              type="button"
              onClick={handlePreview}
              disabled={saving || publishing || unpublishing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Prévisualiser
            </button>

            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={saving || publishing || unpublishing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer comme brouillon
                </>
              )}
            </button>

            {/* Unpublish / Publish toggle */}
            {articleStatus === 'published' ? (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={saving || publishing || unpublishing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unpublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Dépublication...
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Dépublier
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving || publishing || unpublishing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Publier
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Article preview modal — Requirement 2.9 */}
      {previewOpen && (
        <ArticlePreview
          article={formData}
          isModal={true}
          onClose={handleClosePreview}
        />
      )}

      {/* ── Featured image modal (Task 9.6 — Requirement 5.3) ── */}
      {featuredImageModalOpen && mediaService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="featured-image-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <h2 id="featured-image-modal-title" className="text-base font-semibold text-gray-800">
                  Sélectionner l'image de couverture
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFeaturedImageModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Fermer la médiathèque"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-4">
              <MediaLibrary
                mediaService={mediaService}
                onMediaSelect={handleFeaturedImageSelected}
                allowedTypes="image"
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Content image modal (Task 9.5 — Requirement 2.5, 5.4) ── */}
      {contentImageModalOpen && mediaService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="content-image-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <h2 id="content-image-modal-title" className="text-base font-semibold text-gray-800">
                  Insérer une image dans le contenu
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setContentImageModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Fermer la médiathèque"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-4">
              <MediaLibrary
                mediaService={mediaService}
                onMediaSelect={handleContentImageSelected}
                allowedTypes="image"
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Content video modal (Task 19.2) ── */}
      {contentVideoModalOpen && mediaService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="content-video-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 id="content-video-modal-title" className="text-base font-semibold text-gray-800">
                Insérer une vidéo dans le contenu
              </h2>
              <button
                type="button"
                onClick={() => setContentVideoModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <MediaLibrary
                mediaService={mediaService}
                onMediaSelect={handleContentVideoSelected}
                allowedTypes="video"
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleEditorPage;
