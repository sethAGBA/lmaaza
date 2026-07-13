import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — navigation entre les pages d'articles.
 * Requirements: 9.6
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Pagination du blog" className="flex items-center justify-center gap-2 mt-10">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {start > 1 && (
        <>
          <PageButton page={1} currentPage={currentPage} onPageChange={onPageChange} />
          {start > 2 && <span className="text-gray-400 px-1">…</span>}
        </>
      )}

      {pages.map((page) => (
        <PageButton
          key={page}
          page={page}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400 px-1">…</span>}
          <PageButton
            page={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors"
        aria-label="Page suivante"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
};

function PageButton({ page, currentPage, onPageChange }) {
  const isActive = page === currentPage;
  return (
    <button
      type="button"
      onClick={() => onPageChange(page)}
      className={`min-w-[2.5rem] h-10 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-purple-600 text-white'
          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
      }`}
      aria-label={`Page ${page}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {page}
    </button>
  );
}

export default Pagination;
