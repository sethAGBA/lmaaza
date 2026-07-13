import React from 'react';

/**
 * TagCloud — filtre par tags populaires.
 * Requirements: 3.7, 3.8
 */
const TagCloud = ({ tags = [], selectedTag, onTagSelect }) => {
  if (tags.length === 0) return null;

  const maxCount = Math.max(...tags.map((t) => t.count), 1);

  return (
    <nav aria-label="Filtrer par tag" className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-gray-600 mr-1">Tags :</span>
      {tags.map(({ tag, count }) => {
        const scale = 0.85 + (count / maxCount) * 0.35;
        const isActive = selectedTag === tag;

        return (
          <button
            key={tag}
            type="button"
            onClick={() => onTagSelect(isActive ? null : tag)}
            className={`px-3 py-1 rounded-full transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
            style={{ fontSize: `${scale}rem` }}
            aria-pressed={isActive}
          >
            {tag}
            <span className="sr-only"> ({count} articles)</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TagCloud;
