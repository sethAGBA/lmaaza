import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Film,
  LayoutGrid,
} from 'lucide-react';

/**
 * MediaLibrary — displays a grid of uploaded media assets, supports drag-and-drop
 * upload, alt text input for images, upload progress, media selection, and deletion.
 *
 * Requirements: 5.3 (featured image upload), 5.4 (insert into article),
 *               5.5 (video support), 5.6 (storage)
 *
 * @param {{
 *   mediaService: import('../../services/mediaService').MediaService,
 *   onMediaSelect?: (asset: import('../../models/mediaAsset').MediaAsset) => void,
 *   allowedTypes?: 'image' | 'video' | 'all',
 *   isModal?: boolean,
 * }} props
 */
const MediaLibrary = ({
  mediaService,
  onMediaSelect,
  allowedTypes = 'all',
  isModal = false,
}) => {
  // ── Media list ──────────────────────────────────────────────────────────────
  const [mediaList, setMediaList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'image' | 'video'

  // ── Upload state ────────────────────────────────────────────────────────────
  const [dragOver, setDragOver] = useState(false);
  /** @type {[File|null, Function]} */
  const [pendingFile, setPendingFile] = useState(null); // file waiting for alt text
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // ── Delete dialog ───────────────────────────────────────────────────────────
  const [deleteDialog, setDeleteDialog] = useState({ open: false, asset: null });
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);
  const altTextInputRef = useRef(null);

  // ── Load media ───────────────────────────────────────────────────────────────
  const loadMedia = useCallback(async () => {
    try {
      setLoadingList(true);
      setListError(null);
      const all = await mediaService.getAllMedia();
      // Sort newest first
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMediaList(all);
    } catch {
      setListError('Impossible de charger les médias. Veuillez réessayer.');
    } finally {
      setLoadingList(false);
    }
  }, [mediaService]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Focus alt-text input when a file is pending
  useEffect(() => {
    if (pendingFile && altTextInputRef.current) {
      altTextInputRef.current.focus();
    }
  }, [pendingFile]);

  // Auto-clear success banner
  useEffect(() => {
    if (uploadSuccess) {
      const t = setTimeout(() => setUploadSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [uploadSuccess]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const visibleMedia = mediaList.filter((asset) => {
    // Respect the prop-level restriction
    if (allowedTypes !== 'all' && asset.type !== allowedTypes) return false;
    // Respect the UI filter
    if (activeFilter !== 'all' && asset.type !== activeFilter) return false;
    return true;
  });

  // ── File validation ──────────────────────────────────────────────────────
  const ACCEPTED_IMAGE = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
  const ACCEPTED_VIDEO = ['video/mp4', 'video/webm', 'video/ogg'];

  const isAccepted = (file) => {
    if (allowedTypes === 'image') return ACCEPTED_IMAGE.includes(file.type);
    if (allowedTypes === 'video') return ACCEPTED_VIDEO.includes(file.type);
    return ACCEPTED_IMAGE.includes(file.type) || ACCEPTED_VIDEO.includes(file.type);
  };

  const acceptAttr = (() => {
    if (allowedTypes === 'image') return ACCEPTED_IMAGE.join(',');
    if (allowedTypes === 'video') return ACCEPTED_VIDEO.join(',');
    return [...ACCEPTED_IMAGE, ...ACCEPTED_VIDEO].join(',');
  })();

  // ── File selection (from input or drop) ──────────────────────────────────
  const handleFileChosen = (file) => {
    setUploadError(null);
    setUploadSuccess(false);

    if (!file) return;

    if (!isAccepted(file)) {
      setUploadError(
        'Format de fichier non supporté. Formats acceptés : PNG, JPEG, WebP, GIF, SVG pour les images ; MP4, WebM, OGG pour les vidéos.'
      );
      return;
    }

    const isImage = ACCEPTED_IMAGE.includes(file.type);

    if (isImage) {
      // Show alt-text panel before uploading
      setPendingFile(file);
      setAltText('');
    } else {
      // Videos: upload immediately
      uploadFile(file, '');
    }
  };

  const handleInputChange = (e) => {
    handleFileChosen(e.target.files?.[0] ?? null);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  // ── Drag and drop ─────────────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileChosen(file);
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const uploadFile = async (file, alt) => {
    setUploading(true);
    setUploadError(null);
    try {
      const isImage = ACCEPTED_IMAGE.includes(file.type);
      if (isImage) {
        await mediaService.uploadImage(file, alt);
      } else {
        await mediaService.uploadVideo(file);
      }
      setUploadSuccess(true);
      setPendingFile(null);
      setAltText('');
      await loadMedia();
    } catch (err) {
      setUploadError(err?.message ?? "L'upload a échoué. Veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUpload = () => {
    if (pendingFile) {
      uploadFile(pendingFile, altText);
    }
  };

  const handleCancelPending = () => {
    setPendingFile(null);
    setAltText('');
    setUploadError(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDeleteDialog = (asset) => {
    setDeleteDialog({ open: true, asset });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, asset: null });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.asset) return;
    setDeleting(true);
    try {
      await mediaService.deleteMedia(deleteDialog.asset.id);
      closeDeleteDialog();
      await loadMedia();
    } catch {
      // Keep dialog open and let user retry
    } finally {
      setDeleting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  // ── Sub-components ────────────────────────────────────────────────────────

  /** Filter pill button */
  const FilterButton = ({ value, label, icon: Icon }) => (
    <button
      onClick={() => setActiveFilter(value)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        activeFilter === value
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      aria-pressed={activeFilter === value}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );

  /** Individual media card in the grid */
  const MediaCard = ({ asset }) => {
    const isImage = asset.type === 'image';

    return (
      <div className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square flex flex-col">
        {/* Thumbnail / preview */}
        <button
          onClick={() => onMediaSelect?.(asset)}
          className="flex-1 flex items-center justify-center w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
          title={isImage ? (asset.altText || asset.fileName) : asset.fileName}
          aria-label={`Sélectionner ${asset.fileName}`}
          disabled={!onMediaSelect}
        >
          {isImage ? (
            <img
              src={asset.url}
              alt={asset.altText || asset.fileName}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 p-4">
              <Film className="w-10 h-10" />
              <span className="text-xs text-center truncate max-w-full px-2">{asset.fileName}</span>
            </div>
          )}
        </button>

        {/* Footer: file name + size */}
        <div className="px-2 py-1.5 bg-white border-t border-gray-100">
          <p className="text-xs text-gray-700 truncate font-medium" title={asset.fileName}>
            {asset.fileName}
          </p>
          <p className="text-xs text-gray-400">{formatSize(asset.size)}</p>
        </div>

        {/* Hover overlay: select + delete */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none group-hover:pointer-events-auto">
          {onMediaSelect && (
            <button
              onClick={() => onMediaSelect(asset)}
              className="bg-white text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-purple-50 transition-colors"
              aria-label={`Insérer ${asset.fileName}`}
            >
              Insérer
            </button>
          )}
          <button
            onClick={() => openDeleteDialog(asset)}
            className="bg-white text-red-600 p-1.5 rounded-lg shadow hover:bg-red-50 transition-colors"
            aria-label={`Supprimer ${asset.fileName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col gap-4 ${isModal ? '' : 'container mx-auto px-4 py-8'}`}>

      {/* Page header (only when not used as a modal) */}
      {!isModal && (
        <div className="flex items-center gap-3 mb-2">
          <LayoutGrid className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Médiathèque</h1>
        </div>
      )}

      {/* Upload success banner */}
      {uploadSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Fichier uploadé avec succès.
        </div>
      )}

      {/* Upload error banner */}
      {uploadError && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {uploadError}
        </div>
      )}

      {/* ── Drag-and-drop / click-to-upload zone ── */}
      {!pendingFile && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Zone de dépôt de fichier. Cliquez ou glissez-déposez un fichier ici."
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors select-none ${
            dragOver
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 bg-white'
          }`}
        >
          <Upload className={`w-8 h-8 ${dragOver ? 'text-purple-500' : 'text-gray-400'}`} />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Glissez un fichier ici ou{' '}
              <span className="text-purple-600 underline underline-offset-2">cliquez pour parcourir</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {allowedTypes === 'image'
                ? 'Images : PNG, JPEG, WebP, GIF, SVG — max 10 Mo'
                : allowedTypes === 'video'
                ? 'Vidéos : MP4, WebM, OGG — max 50 Mo'
                : 'Images (max 10 Mo) et vidéos (max 50 Mo)'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttr}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* ── Alt-text panel (shown after selecting an image) ── */}
      {pendingFile && (
        <div className="border border-purple-200 bg-purple-50 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-purple-800 font-semibold text-sm">
              <ImageIcon className="w-5 h-5 flex-shrink-0" />
              Texte alternatif pour l'image
            </div>
            <button
              onClick={handleCancelPending}
              disabled={uploading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
              aria-label="Annuler l'upload"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">
              Fichier sélectionné :{' '}
              <span className="font-medium text-gray-800">{pendingFile.name}</span>
              {' '}({formatSize(pendingFile.size)})
            </p>
            <label htmlFor="media-alt-text" className="block text-xs font-medium text-gray-700 mb-1">
              Texte alternatif (alt)
              <span className="text-gray-400 font-normal ml-1">— recommandé pour l'accessibilité</span>
            </label>
            <input
              ref={altTextInputRef}
              id="media-alt-text"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Décrivez l'image en quelques mots…"
              disabled={uploading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              onKeyDown={(e) => e.key === 'Enter' && !uploading && handleConfirmUpload()}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancelPending}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Upload en cours…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Uploader
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload spinner (video, no pending panel) */}
      {uploading && !pendingFile && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          Upload en cours, veuillez patienter…
        </div>
      )}

      {/* ── Filters ── */}
      {allowedTypes === 'all' && (
        <div className="flex items-center gap-2 flex-wrap">
          <FilterButton value="all" label="Tout" icon={LayoutGrid} />
          <FilterButton value="image" label="Images" icon={ImageIcon} />
          <FilterButton value="video" label="Vidéos" icon={Video} />
        </div>
      )}

      {/* ── List error ── */}
      {listError && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {listError}
        </div>
      )}

      {/* ── Media grid ── */}
      {loadingList ? (
        <div
          className="flex items-center justify-center py-16 text-gray-500"
          aria-live="polite"
          aria-label="Chargement des médias"
        >
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement des médias…
        </div>
      ) : visibleMedia.length === 0 ? (
        <div className="py-16 text-center text-gray-400 bg-white border border-gray-200 rounded-xl">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Aucun média trouvé</p>
          <p className="text-xs mt-1">Uploadez votre premier fichier ci-dessus.</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          aria-label="Galerie de médias"
        >
          {visibleMedia.map((asset) => (
            <MediaCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* ── Delete confirmation dialog ── */}
      {deleteDialog.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-media-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2
                  id="delete-media-title"
                  className="text-base font-semibold text-gray-900"
                >
                  Confirmer la suppression
                </h2>
                <p className="text-xs text-gray-500">Cette action est irréversible.</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              Voulez-vous vraiment supprimer{' '}
              <strong className="font-semibold">«&nbsp;{deleteDialog.asset?.fileName}&nbsp;»</strong> ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteDialog}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
