/**
 * BlogContext — fournit les services du blog dynamique à toute l'application.
 * Requirements: 1.6, 10.1
 */

import React, { createContext, useContext, useMemo } from 'react';
import { LocalStorageAdapter } from '../adapters/localStorageAdapter.js';
import { ApiAdapter } from '../adapters/apiAdapter.js';
import { ArticleService } from '../services/articleService.js';
import { MediaService } from '../services/mediaService.js';
import { SearchService } from '../services/searchService.js';
import { useAuth } from './AuthContext.jsx';

const BlogContext = createContext(null);

let sharedAdapter = null;

function getSharedAdapter() {
  if (!sharedAdapter) {
    // En production (Vercel), utiliser l'ApiAdapter qui persiste dans Vercel KV.
    // En développement local, utiliser LocalStorageAdapter pour un dev rapide.
    sharedAdapter =
      process.env.NODE_ENV === 'production'
        ? new ApiAdapter()
        : new LocalStorageAdapter();
  }
  return sharedAdapter;
}

export function BlogProvider({ children, adapter: adapterOverride }) {
  const auth = useAuth();

  const value = useMemo(() => {
    const storage = adapterOverride || getSharedAdapter();
    const articleService = new ArticleService(storage, auth);
    const mediaService = new MediaService(storage);
    const searchService = new SearchService(articleService);

    return { articleService, mediaService, searchService, storage };
  }, [adapterOverride, auth]);

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx) {
    throw new Error('useBlog doit être utilisé dans un BlogProvider');
  }
  return ctx;
}

export default BlogProvider;
