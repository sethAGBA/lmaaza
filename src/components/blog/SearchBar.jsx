import React, { useState } from 'react';
import { Search } from 'lucide-react';

/**
 * SearchBar — recherche textuelle sur le blog.
 * Requirements: 4.1
 */
const SearchBar = ({ onSearch, placeholder = 'Rechercher des articles…', initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl" role="search">
      <label htmlFor="blog-search" className="sr-only">
        Rechercher des articles
      </label>
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          aria-hidden="true"
        />
        <input
          id="blog-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap"
      >
        Rechercher
      </button>
    </form>
  );
};

export default SearchBar;
