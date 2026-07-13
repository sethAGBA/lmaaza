import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

/**
 * AdminDashboard component — lists all articles (draft + published) for admin management.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 *
 * @param {{ articleService: import('../../services/articleService').ArticleService }} props
 */
const AdminDashboard = ({ articleService }) => {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sort state: { field: string, order: 'asc' | 'desc' }
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, article: null });
  const [deleting, setDeleting] = useState(false);

  // ── Data loading ─────────────────────────────────────────────────────────
  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await articleService.getAllArticles({
        sortBy: sort.field,
        sortOrder: sort.order,
      });
      setArticles(data);
    } catch (err) {
      setError("Impossible de charger les articles. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [articleService, sort]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // ── Sort handling ─────────────────────────────────────────────────────────
  const handleSort = (field) => {
    setSort((prev) =>
      prev.field === field
        ? { field, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { field, order: 'asc' }
    );
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleEdit = (article) => {
    navigate(`/admin/blog/edit/${article.id}`);
  };

  const handleTogglePublish = async (article) => {
    try {
      if (article.status === 'published') {
        await articleService.unpublishArticle(article.id, { skipAuth: true });
      } else {
        await articleService.publishArticle(article.id, { skipAuth: true });
      }
      await loadArticles();
    } catch (err) {
      setError("Impossible de modifier le statut de l'article.");
    }
  };

  const openDeleteDialog = (article) => {
    setDeleteDialog({ open: true, article });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, article: null });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.article) return;
    try {
      setDeleting(true);
      await articleService.deleteArticle(deleteDialog.article.id, { skipAuth: true });
      closeDeleteDialog();
      await loadArticles();
    } catch (err) {
      setError("Impossible de supprimer l'article.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return <ChevronsUpDown className="w-4 h-4 ml-1 opacity-40" />;
    return sort.order === 'asc'
      ? <ChevronUp className="w-4 h-4 ml-1 text-purple-600" />
      : <ChevronDown className="w-4 h-4 ml-1 text-purple-600" />;
  };

  const SortableHeader = ({ field, label }) => (
    <th className="py-3 px-4 text-left">
      <button
        onClick={() => handleSort(field)}
        className="flex items-center font-semibold text-gray-600 uppercase text-xs tracking-wider hover:text-purple-700 transition-colors"
        aria-label={`Trier par ${label}`}
      >
        {label}
        <SortIcon field={field} />
      </button>
    </th>
  );

  const StatusBadge = ({ status }) =>
    status === 'published' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Publié
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Brouillon
      </span>
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion du Blog</h1>
        <button
          onClick={() => navigate('/admin/blog/new')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          aria-label="Créer un nouvel article"
        >
          <Plus className="w-4 h-4" />
          Nouvel Article
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500" aria-live="polite" aria-label="Chargement des articles">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement des articles…
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {articles.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg font-medium mb-1">Aucun article trouvé</p>
              <p className="text-sm">Commencez par créer un nouvel article.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full" aria-label="Liste des articles">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <SortableHeader field="title" label="Titre" />
                      <SortableHeader field="author" label="Auteur" />
                      <SortableHeader field="createdAt" label="Créé le" />
                      <SortableHeader field="updatedAt" label="Modifié le" />
                      <SortableHeader field="status" label="Statut" />
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {articles.map((article) => (
                      <tr
                        key={article.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleEdit(article)}
                            className="text-sm font-medium text-gray-900 hover:text-purple-700 text-left max-w-xs truncate block"
                            title={article.title}
                          >
                            {article.title}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                          {article.author}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(article.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(article.updatedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={article.status} />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {article.category}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(article)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                              title="Modifier"
                              aria-label={`Modifier l'article "${article.title}"`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Publish / Unpublish */}
                            <button
                              onClick={() => handleTogglePublish(article)}
                              className={`p-1.5 rounded-md transition-colors ${
                                article.status === 'published'
                                  ? 'text-green-600 hover:text-yellow-700 hover:bg-yellow-50'
                                  : 'text-yellow-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                              title={article.status === 'published' ? 'Dépublier' : 'Publier'}
                              aria-label={
                                article.status === 'published'
                                  ? `Dépublier l'article "${article.title}"`
                                  : `Publier l'article "${article.title}"`
                              }
                            >
                              {article.status === 'published' ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => openDeleteDialog(article)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Supprimer"
                              aria-label={`Supprimer l'article "${article.title}"`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-gray-100">
                {articles.map((article) => (
                  <div key={article.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-sm font-semibold text-gray-900 hover:text-purple-700 text-left"
                      >
                        {article.title}
                      </button>
                      <StatusBadge status={article.status} />
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                      <p>
                        <span className="font-medium">Auteur :</span> {article.author}
                      </p>
                      <p>
                        <span className="font-medium">Catégorie :</span> {article.category}
                      </p>
                      <p>
                        <span className="font-medium">Créé le :</span> {formatDate(article.createdAt)}
                      </p>
                      <p>
                        <span className="font-medium">Modifié le :</span> {formatDate(article.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(article)}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
                        aria-label={`Modifier l'article "${article.title}"`}
                      >
                        <Pencil className="w-3.5 h-3.5" /> Modifier
                      </button>
                      <button
                        onClick={() => handleTogglePublish(article)}
                        className={`flex items-center gap-1 text-xs font-medium ${
                          article.status === 'published'
                            ? 'text-yellow-600 hover:text-yellow-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        aria-label={
                          article.status === 'published'
                            ? `Dépublier l'article "${article.title}"`
                            : `Publier l'article "${article.title}"`
                        }
                      >
                        {article.status === 'published' ? (
                          <><EyeOff className="w-3.5 h-3.5" /> Dépublier</>
                        ) : (
                          <><Eye className="w-3.5 h-3.5" /> Publier</>
                        )}
                      </button>
                      <button
                        onClick={() => openDeleteDialog(article)}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                        aria-label={`Supprimer l'article "${article.title}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteDialog.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 id="delete-dialog-title" className="text-lg font-semibold text-gray-900">
                  Confirmer la suppression
                </h2>
                <p className="text-sm text-gray-500">Cette action est irréversible.</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              Voulez-vous vraiment supprimer l'article{' '}
              <strong className="font-semibold">«&nbsp;{deleteDialog.article?.title}&nbsp;»</strong> ?
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
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
