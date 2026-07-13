import React from 'react';
import { VALID_CATEGORIES } from '../../models/article';

/**
 * CategoryFilter — filtre par catégorie.
 * Requirements: 3.6, 3.8
 */
const CategoryFilter = ({ selectedCategory, onCategorySelect }) => {
  return (
    <nav aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onCategorySelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !selectedCategory
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-pressed={!selectedCategory}
      >
        Toutes
      </button>
      {VALID_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() =>
            onCategorySelect(selectedCategory === category ? null : category)
          }
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={selectedCategory === category}
        >
          {category}
        </button>
      ))}
    </nav>
  );
};

export default CategoryFilter;
