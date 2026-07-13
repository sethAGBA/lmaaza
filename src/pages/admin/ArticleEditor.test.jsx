/**
 * Unit tests for ArticleEditorPage.
 * Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3
 */

import React from 'react';

jest.mock('../../components/admin/RichTextEditor', () => {
  return function MockRichTextEditor({ onChange, initialContent }) {
    return (
      <textarea
        aria-label="Contenu"
        value={initialContent || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

jest.mock('../../components/admin/SEOMetadataEditor', () => {
  return function MockSEOMetadataEditor() {
    return null;
  };
});

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ArticleEditorPage from './ArticleEditor';
import { ArticleService } from '../../services/articleService';
import { InMemoryAdapter } from '../../adapters/inMemoryAdapter';

// ── Test helpers ─────────────────────────────────────────────────────────────

function buildService(initialArticles = []) {
  const adapter = new InMemoryAdapter();
  const service = new ArticleService(adapter, null);
  initialArticles.forEach((a) => adapter._articles.set(a.id, { ...a }));
  return service;
}

/**
 * Render the ArticleEditorPage inside a MemoryRouter.
 * Pass `articleId` to simulate edit mode via /admin/blog/edit/:id route.
 */
function renderEditor(articleService, articleId = null) {
  const initialPath = articleId
    ? `/admin/blog/edit/${articleId}`
    : '/admin/blog/new';

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/admin/blog/new"
          element={<ArticleEditorPage articleService={articleService} />}
        />
        <Route
          path="/admin/blog/edit/:id"
          element={<ArticleEditorPage articleService={articleService} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

/** A minimal valid article input that passes all validations. */
function makeValidArticle(overrides = {}) {
  return {
    title: 'Titre valide de l\'article',
    excerpt: 'Un extrait valide pour cet article.',
    content: 'Ceci est le contenu complet de l\'article. Il doit contenir au moins cent caractères pour passer la validation du formulaire correctement.',
    category: 'Agriculture',
    tags: ['tag1', 'tag2'],
    author: 'Jean Dupont',
    ...overrides,
  };
}

function getTitleInput() {
  return screen.getByPlaceholderText('Entrez le titre de l\'article');
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ArticleEditorPage', () => {
  describe('Rendering', () => {
    it('renders the create form with correct heading', () => {
      const service = buildService();
      renderEditor(service);

      expect(screen.getByText('Nouvel article')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      const service = buildService();
      renderEditor(service);

      expect(getTitleInput()).toBeInTheDocument();
      expect(screen.getByLabelText(/extrait/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contenu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/auteur/i)).toBeInTheDocument();
    });

    it('renders "Save as Draft" and "Publish" buttons', () => {
      const service = buildService();
      renderEditor(service);

      expect(screen.getByRole('button', { name: /enregistrer comme brouillon/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /publier/i })).toBeInTheDocument();
    });

    it('renders all valid category options', () => {
      const service = buildService();
      renderEditor(service);

      const categories = ['Agriculture', 'Santé', 'Éducation', 'Environnement', 'Formation', 'Innovation', 'Technologie'];
      categories.forEach((cat) => {
        expect(screen.getByRole('option', { name: cat })).toBeInTheDocument();
      });
    });
  });

  describe('Edit mode', () => {
    it('loads and populates form with existing article data', async () => {
      const adapter = new InMemoryAdapter();
      const existingArticle = {
        id: 'test-article-id',
        title: 'Article existant',
        excerpt: 'Extrait de l\'article existant',
        content: 'Contenu de l\'article existant. Il est suffisamment long pour passer la validation du formulaire sans problème.',
        category: 'Technologie',
        tags: ['innovation', 'tech'],
        author: 'Marie Martin',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        slug: 'article-existant',
        readTime: 1,
        featuredImage: null,
        seoMetadata: { title: null, description: null, keywords: [], canonicalUrl: '', openGraph: { ogTitle: '', ogDescription: '', ogImage: null, ogType: 'article', ogUrl: '' } },
      };
      adapter._articles.set(existingArticle.id, existingArticle);
      const service = new ArticleService(adapter, null);

      renderEditor(service, existingArticle.id);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Article existant')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue(/Extrait de l'article existant/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Contenu de l'article existant/)).toBeInTheDocument();
    });

    it('shows "Modifier l\'article" heading in edit mode', async () => {
      const adapter = new InMemoryAdapter();
      const existingArticle = {
        id: 'edit-mode-test',
        title: 'Article à modifier',
        excerpt: 'Extrait court',
        content: 'Contenu suffisamment long pour passer la validation minimale de cent caractères, ici on vérifie le mode édition.',
        category: 'Santé',
        tags: [],
        author: 'Admin',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        slug: 'article-a-modifier',
        readTime: 1,
        featuredImage: null,
        seoMetadata: { title: null, description: null, keywords: [], canonicalUrl: '', openGraph: { ogTitle: '', ogDescription: '', ogImage: null, ogType: 'article', ogUrl: '' } },
      };
      adapter._articles.set(existingArticle.id, existingArticle);
      const service = new ArticleService(adapter, null);

      renderEditor(service, existingArticle.id);

      await waitFor(() => {
        expect(screen.getByText(/Modifier l'article/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows validation error when title is empty', async () => {
      const service = buildService();
      renderEditor(service);

      const titleInput = getTitleInput();
      fireEvent.blur(titleInput);
      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        expect(screen.getByText(/le titre est requis/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when category is not selected', async () => {
      const service = buildService();
      renderEditor(service);

      const categorySelect = screen.getByLabelText(/catégorie/i);
      fireEvent.blur(categorySelect);
      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        expect(screen.getByText(/la catégorie est requise/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when content is too short', async () => {
      const service = buildService();
      renderEditor(service);

      const contentTextarea = screen.getByLabelText(/contenu/i);
      fireEvent.change(contentTextarea, { target: { value: 'Trop court' } });
      fireEvent.blur(contentTextarea);
      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        expect(screen.getByText(/au moins 100 caractères/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when author is empty', async () => {
      const service = buildService();
      renderEditor(service);

      const authorInput = screen.getByLabelText(/auteur/i);
      fireEvent.blur(authorInput);
      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        expect(screen.getByText(/l'auteur est requis/i)).toBeInTheDocument();
      });
    });

    it('clears field error when user starts typing', async () => {
      const service = buildService();
      renderEditor(service);

      // Trigger title validation error
      const titleInput = getTitleInput();
      fireEvent.blur(titleInput);
      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        expect(screen.getByText(/le titre est requis/i)).toBeInTheDocument();
      });

      // Start typing to clear the error
      fireEvent.change(titleInput, { target: { value: 'Nouveau titre' } });

      await waitFor(() => {
        expect(screen.queryByText(/le titre est requis/i)).not.toBeInTheDocument();
      });
    });

    it('shows character count for title field', () => {
      const service = buildService();
      renderEditor(service);

      const titleInput = getTitleInput();
      fireEvent.change(titleInput, { target: { value: 'Test' } });

      expect(screen.getByText('4/200')).toBeInTheDocument();
    });
  });

  describe('Tag management', () => {
    it('adds a tag when Ajouter button is clicked', async () => {
      const service = buildService();
      renderEditor(service);

      const tagInput = screen.getByPlaceholderText(/entrez un tag/i);
      fireEvent.change(tagInput, { target: { value: 'agriculture' } });
      fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

      await waitFor(() => {
        expect(screen.getByText('agriculture')).toBeInTheDocument();
      });
    });

    it('adds a tag when Enter key is pressed', async () => {
      const service = buildService();
      renderEditor(service);

      const tagInput = screen.getByPlaceholderText(/entrez un tag/i);
      fireEvent.change(tagInput, { target: { value: 'innovation' } });
      fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('innovation')).toBeInTheDocument();
      });
    });

    it('removes a tag when X button is clicked', async () => {
      const service = buildService();
      renderEditor(service);

      // Add a tag first
      const tagInput = screen.getByPlaceholderText(/entrez un tag/i);
      fireEvent.change(tagInput, { target: { value: 'santé' } });
      fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

      await waitFor(() => {
        expect(screen.getByText('santé')).toBeInTheDocument();
      });

      // Remove the tag
      fireEvent.click(screen.getByRole('button', { name: /supprimer le tag santé/i }));

      await waitFor(() => {
        expect(screen.queryByText('santé')).not.toBeInTheDocument();
      });
    });

    it('shows error when trying to add more than 10 tags', async () => {
      const service = buildService();
      renderEditor(service);

      const tagInput = screen.getByPlaceholderText(/entrez un tag/i);

      // Add 10 tags
      for (let i = 1; i <= 10; i++) {
        fireEvent.change(tagInput, { target: { value: `tag${i}` } });
        fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
      }

      // Try to add the 11th
      fireEvent.change(tagInput, { target: { value: 'tag11' } });
      fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

      await waitFor(() => {
        expect(screen.getByText(/plus de 10 tags/i)).toBeInTheDocument();
      });
    });

    it('does not add duplicate tags', async () => {
      const service = buildService();
      renderEditor(service);

      const tagInput = screen.getByPlaceholderText(/entrez un tag/i);
      
      fireEvent.change(tagInput, { target: { value: 'tech' } });
      fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
      
      fireEvent.change(tagInput, { target: { value: 'tech' } });
      fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

      await waitFor(() => {
        // Only one instance of 'tech' should appear (not duplicated)
        const tagElements = screen.getAllByText('tech');
        expect(tagElements.length).toBe(1);
      });
    });
  });

  describe('Save as Draft', () => {
    it('creates a new article with draft status when form is valid', async () => {
      const service = buildService();
      renderEditor(service);

      const article = makeValidArticle();

      fireEvent.change(getTitleInput(), { target: { value: article.title } });
      fireEvent.change(screen.getByLabelText(/extrait/i), { target: { value: article.excerpt } });
      fireEvent.change(screen.getByLabelText(/contenu/i), { target: { value: article.content } });
      fireEvent.change(screen.getByLabelText(/catégorie/i), { target: { value: article.category } });
      fireEvent.change(screen.getByLabelText(/auteur/i), { target: { value: article.author } });

      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        expect(screen.getByText(/brouillon (créé|enregistré) avec succès/i)).toBeInTheDocument();
      });
    });

    it('does not save when form has validation errors', async () => {
      const service = buildService();
      jest.spyOn(service, 'createArticle');

      renderEditor(service);

      // Click save without filling anything
      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        expect(screen.getByText(/corriger les erreurs/i)).toBeInTheDocument();
      });

      expect(service.createArticle).not.toHaveBeenCalled();
    });
  });

  describe('Publish', () => {
    it('creates article and publishes it when form is valid', async () => {
      const service = buildService();
      const publishSpy = jest.spyOn(service, 'publishArticle');
      renderEditor(service);

      const article = makeValidArticle();

      fireEvent.change(getTitleInput(), { target: { value: article.title } });
      fireEvent.change(screen.getByLabelText(/extrait/i), { target: { value: article.excerpt } });
      fireEvent.change(screen.getByLabelText(/contenu/i), { target: { value: article.content } });
      fireEvent.change(screen.getByLabelText(/catégorie/i), { target: { value: article.category } });
      fireEvent.change(screen.getByLabelText(/auteur/i), { target: { value: article.author } });

      fireEvent.click(screen.getByRole('button', { name: /publier/i }));

      await waitFor(() => {
        expect(publishSpy).toHaveBeenCalled();
      });
    });

    it('shows success message after publishing', async () => {
      const service = buildService();
      renderEditor(service);

      const article = makeValidArticle();

      fireEvent.change(getTitleInput(), { target: { value: article.title } });
      fireEvent.change(screen.getByLabelText(/extrait/i), { target: { value: article.excerpt } });
      fireEvent.change(screen.getByLabelText(/contenu/i), { target: { value: article.content } });
      fireEvent.change(screen.getByLabelText(/catégorie/i), { target: { value: article.category } });
      fireEvent.change(screen.getByLabelText(/auteur/i), { target: { value: article.author } });

      fireEvent.click(screen.getByRole('button', { name: /publier/i }));

      await waitFor(() => {
        expect(screen.getByText(/article publié avec succès/i)).toBeInTheDocument();
      });
    });

    it('does not publish when form has validation errors', async () => {
      const service = buildService();
      jest.spyOn(service, 'publishArticle');

      renderEditor(service);

      // Click publish without filling anything
      fireEvent.click(screen.getByRole('button', { name: /publier/i }));

      await waitFor(() => {
        expect(screen.getByText(/corriger les erreurs/i)).toBeInTheDocument();
      });

      expect(service.publishArticle).not.toHaveBeenCalled();
    });
  });

  describe('Category Validation (Requirement 3.1, 3.2)', () => {
    it('accepts only valid category values from VALID_CATEGORIES', async () => {
      const service = buildService();
      renderEditor(service);

      const select = screen.getByLabelText(/catégorie/i);
      
      // All valid categories should be present as options
      const validCategories = ['Agriculture', 'Santé', 'Éducation', 'Environnement', 'Formation', 'Innovation', 'Technologie'];
      validCategories.forEach((cat) => {
        fireEvent.change(select, { target: { value: cat } });
        fireEvent.blur(select);
        // No error should appear
        expect(screen.queryByText(/catégorie invalide/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Article Status on Create (Requirements 1.1, 8.1)', () => {
    it('creates article with draft status by default (via Save as Draft)', async () => {
      const adapter = new InMemoryAdapter();
      const service = new ArticleService(adapter, null);
      renderEditor(service);

      const article = makeValidArticle();
      fireEvent.change(getTitleInput(), { target: { value: article.title } });
      fireEvent.change(screen.getByLabelText(/extrait/i), { target: { value: article.excerpt } });
      fireEvent.change(screen.getByLabelText(/contenu/i), { target: { value: article.content } });
      fireEvent.change(screen.getByLabelText(/catégorie/i), { target: { value: article.category } });
      fireEvent.change(screen.getByLabelText(/auteur/i), { target: { value: article.author } });

      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        // Check for the specific success message (not the button text)
        expect(screen.getByRole('alert')).toHaveTextContent(/brouillon/i);
      });

      // Verify the article in storage has 'draft' status
      const articles = await service.getAllArticles();
      expect(articles.length).toBe(1);
      expect(articles[0].status).toBe('draft');
    });
  });

  describe('Update Article (Requirement 1.2)', () => {
    it('calls updateArticle when saving an existing article', async () => {
      const adapter = new InMemoryAdapter();
      const existingArticle = {
        id: 'update-test-id',
        title: 'Article original',
        excerpt: 'Extrait original de l\'article',
        content: 'Contenu original suffisamment long pour dépasser la limite de validation de cent caractères exactement comme requis.',
        category: 'Technologie',
        tags: [],
        author: 'Admin',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        slug: 'article-original',
        readTime: 1,
        featuredImage: null,
        seoMetadata: { title: null, description: null, keywords: [], canonicalUrl: '', openGraph: { ogTitle: '', ogDescription: '', ogImage: null, ogType: 'article', ogUrl: '' } },
      };
      adapter._articles.set(existingArticle.id, existingArticle);
      const service = new ArticleService(adapter, null);
      const updateSpy = jest.spyOn(service, 'updateArticle');

      renderEditor(service, existingArticle.id);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Article original')).toBeInTheDocument();
      });

      // Change the title
      fireEvent.change(getTitleInput(), {
        target: { value: 'Titre modifié' },
      });

      fireEvent.click(screen.getByRole('button', { name: /enregistrer comme brouillon/i }));

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
      });

      // Verify the article was updated in storage
      const updatedArticle = await service.getArticle(existingArticle.id);
      expect(updatedArticle.title).toBe('Titre modifié');
    });
  });
});
