import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import RenderContent from '../components/RenderContent';
import SEO from '../components/SEO';
import ErrorBoundary from '../components/ErrorBoundary';
import SearchBar from '../components/blog/SearchBar';
import CategoryFilter from '../components/blog/CategoryFilter';
import TagCloud from '../components/blog/TagCloud';
import ArticleCard from '../components/blog/ArticleCard';
import Pagination from '../components/blog/Pagination';
import { useBlog } from '../contexts/BlogContext';
import { paginate } from '../utils/paginationUtils';

const ITEMS_PER_PAGE = 12;

const Blog = ({ menuItems }) => {
  const { articleService, searchService } = useBlog();
  const [searchParams, setSearchParams] = useSearchParams();
  const blogPage = menuItems.find((item) => item.id === 'blog');

  const [articles, setArticles] = useState([]);
  const [tagCounts, setTagCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(() => searchParams.get('tag'));
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVideo, setModalVideo] = useState(null);

  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) setSelectedTag(tagFromUrl);
  }, [searchParams]);

  useEffect(() => {
    articleService.getPublishedArticles().then((published) => {
      const counts = {};
      published.forEach((a) => {
        (a.tags || []).forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });
      setTagCounts(
        Object.entries(counts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
      );
    });
  }, [articleService]);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await articleService.filterPublishedArticles({
        category: selectedCategory,
        tag: selectedTag,
        query: searchQuery,
        searchService,
      });
      setArticles(results);
    } catch (err) {
      setError('Impossible de charger les articles. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [articleService, searchService, selectedCategory, selectedTag, searchQuery]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTag]);

  const handleTagSelect = useCallback(
    (tag) => {
      setSelectedTag(tag);
      if (tag) {
        setSearchParams({ tag });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams]
  );

  const { items: pageArticles, totalPages, totalItems } = useMemo(
    () => paginate(articles, currentPage, ITEMS_PER_PAGE),
    [articles, currentPage]
  );

  const highlight = useCallback(
    (text, query) => searchService.highlightMatches(text, query),
    [searchService]
  );

  const hasActiveFilters = searchQuery || selectedCategory || selectedTag;

  return (
    <>
      <SEO
        title="Blog - Actualités et Innovations Technologiques | L'Maaza"
        description="Découvrez les dernières actualités technologiques, innovations et projets de L'Maaza. Articles sur l'agriculture, la santé, l'éducation et l'environnement au Togo."
        keywords="blog technologique, innovation, agriculture, santé, éducation, environnement, Togo, Arduino, formation, L'Maaza, actualités"
        canonical="https://lmaaza.net/blog"
      />

      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Notre Blog</h1>
            <div className="text-xl text-gray-600">
              {blogPage ? (
                <RenderContent content={blogPage.content} />
              ) : (
                'Chargement du contenu...'
              )}
            </div>
          </header>

          <section className="mb-8 space-y-4" aria-label="Recherche et filtres">
            <div className="flex justify-center">
              <SearchBar onSearch={setSearchQuery} initialQuery={searchQuery} />
            </div>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            <TagCloud
              tags={tagCounts}
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
            />
            {hasActiveFilters && (
              <p className="text-sm text-gray-600 text-center">
                {totalItems} article{totalItems !== 1 ? 's' : ''} trouvé
                {totalItems !== 1 ? 's' : ''}
              </p>
            )}
          </section>

          <ErrorBoundary title="Erreur d'affichage du blog">
            {loading ? (
              <p className="text-center text-gray-500 py-12">Chargement des articles…</p>
            ) : error ? (
              <p className="text-center text-red-600 py-12" role="alert">
                {error}
              </p>
            ) : pageArticles.length === 0 ? (
              <p className="text-center text-gray-600 py-12">
                Aucun article ne correspond à vos critères de recherche.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pageArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      searchQuery={searchQuery}
                      highlightFn={highlight}
                      onVideoClick={setModalVideo}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </ErrorBoundary>

          <aside className="mt-12 text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Restez Informé</h2>
              <p className="text-gray-600 mb-6">
                Abonnez-vous à notre newsletter pour recevoir les derniers articles et
                actualités technologiques.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  aria-label="Adresse email pour la newsletter"
                />
                <button
                  type="button"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  S&apos;abonner
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {modalVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setModalVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Lecteur vidéo"
        >
          <div
            className="relative bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalVideo(null)}
              className="absolute top-3 right-3 bg-gray-800 text-white rounded-full p-2 z-10 hover:bg-gray-700 transition-colors"
              aria-label="Fermer la vidéo"
            >
              <X className="w-6 h-6" />
            </button>
            <video
              src={modalVideo}
              className="w-full h-auto max-h-[80vh]"
              controls
              autoPlay
              playsInline
              preload="metadata"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>
      )}
    </>
  );
};

export default Blog;
