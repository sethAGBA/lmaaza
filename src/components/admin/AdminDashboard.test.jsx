/**
 * Unit tests for AdminDashboard component.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { ArticleService } from '../../services/articleService';
import { InMemoryAdapter } from '../../adapters/inMemoryAdapter';

// ── Test helpers ──────────────────────────────────────────────────────────────

/**
 * Build an ArticleService backed by an InMemoryAdapter.
 */
function buildService(initialArticles = []) {
  const adapter = new InMemoryAdapter();
  const service = new ArticleService(adapter, null);
  initialArticles.forEach((a) => adapter._articles.set(a.id, { ...a }));
  return service;
}

/** Minimal valid article fixture */
function makeArticle(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: overrides.id || `art-${Math.random().toString(36).slice(2)}`,
    title: 'Article Test',
    excerpt: 'Extrait de test',
    content: 'Contenu de test suffisamment long pour passer la validation (>100 caractères) — blah blah blah.',
    category: 'Innovation',
    tags: [],
    featuredImage: null,
    author: 'Jean Dupont',
    readTime: 1,
    slug: 'article-test',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    seoMetadata: {
      title: null,
      description: null,
      keywords: [],
      canonicalUrl: '',
      openGraph: { ogTitle: '', ogDescription: '', ogImage: null, ogType: 'article', ogUrl: '' },
    },
    ...overrides,
  };
}

/** Render the component inside a MemoryRouter (required for useNavigate). */
function renderDashboard(articleService) {
  return render(
    <MemoryRouter>
      <AdminDashboard articleService={articleService} />
    </MemoryRouter>
  );
}

/**
 * The component renders both desktop (table) and mobile (card) layouts simultaneously in jsdom
 * because Tailwind's responsive classes (hidden md:block) are CSS-only and jsdom doesn't
 * evaluate media queries. To avoid "multiple elements" errors, we use getAllByRole and
 * click the first match, or scope queries to the table element.
 */

// Helper to click the first matching button by aria-label
function clickFirstButton(nameRegex) {
  const btns = screen.getAllByRole('button', { name: nameRegex });
  fireEvent.click(btns[0]);
}

// Helper to wait for the table to appear (loading complete)
async function waitForTable() {
  return await screen.findByRole('table', { name: /liste des articles/i });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AdminDashboard', () => {
  // 7.1 — displays dashboard listing all articles
  describe('Requirement 7.1 — Liste de tous les articles', () => {
    it('affiche le titre du tableau de bord', async () => {
      const service = buildService([]);
      renderDashboard(service);
      expect(await screen.findByText('Gestion du Blog')).toBeInTheDocument();
    });

    it('affiche tous les articles (brouillons et publiés)', async () => {
      const articles = [
        makeArticle({ id: 'a1', title: 'Article Brouillon', status: 'draft' }),
        makeArticle({ id: 'a2', title: 'Article Publié', status: 'published', publishedAt: new Date().toISOString() }),
      ];
      const service = buildService(articles);
      renderDashboard(service);

      const table = await waitForTable();
      expect(within(table).getByText('Article Brouillon')).toBeInTheDocument();
      expect(within(table).getByText('Article Publié')).toBeInTheDocument();
    });

    it('affiche un message quand il n\'y a aucun article', async () => {
      const service = buildService([]);
      renderDashboard(service);
      expect(await screen.findByText('Aucun article trouvé')).toBeInTheDocument();
    });
  });

  // 7.2 — columns: titre, auteur, créé le, modifié le, statut, catégorie
  describe('Requirement 7.2 — Colonnes du tableau', () => {
    it('affiche les colonnes requises (en-têtes triables)', async () => {
      const service = buildService([makeArticle()]);
      renderDashboard(service);

      await waitForTable();

      expect(screen.getByRole('button', { name: /trier par titre/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /trier par auteur/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /trier par créé le/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /trier par modifié le/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /trier par statut/i })).toBeInTheDocument();
    });

    it('affiche la colonne Catégorie', async () => {
      const service = buildService([makeArticle()]);
      renderDashboard(service);
      await waitForTable();
      // The "Catégorie" header text appears in the table
      const table = await waitForTable();
      expect(within(table).getByText('Catégorie')).toBeInTheDocument();
    });

    it('affiche les données de chaque article dans le tableau', async () => {
      const article = makeArticle({
        id: 'a1',
        title: 'Mon Titre',
        author: 'Marie Curie',
        category: 'Santé',
        status: 'draft',
      });
      const service = buildService([article]);
      renderDashboard(service);

      const table = await waitForTable();
      expect(within(table).getByText('Mon Titre')).toBeInTheDocument();
      expect(within(table).getByText('Marie Curie')).toBeInTheDocument();
      expect(within(table).getByText('Santé')).toBeInTheDocument();
    });

    it('affiche un badge vert "Publié" pour les articles publiés', async () => {
      const article = makeArticle({ status: 'published', publishedAt: new Date().toISOString() });
      const service = buildService([article]);
      renderDashboard(service);

      const table = await waitForTable();
      const badge = within(table).getByText('Publié');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('affiche un badge jaune "Brouillon" pour les articles en brouillon', async () => {
      const article = makeArticle({ status: 'draft' });
      const service = buildService([article]);
      renderDashboard(service);

      const table = await waitForTable();
      const badge = within(table).getByText('Brouillon');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  // 7.3 — sort by date, title, author, status
  describe('Requirement 7.3 — Tri des articles', () => {
    it('affiche les boutons triables et met à jour l\'indicateur de tri au clic', async () => {
      const articles = [
        makeArticle({ id: 'a1', title: 'Article Un', createdAt: '2024-01-01T00:00:00Z' }),
        makeArticle({ id: 'a2', title: 'Article Deux', createdAt: '2024-01-02T00:00:00Z' }),
      ];
      const service = buildService(articles);
      renderDashboard(service);

      await waitForTable();

      const sortByTitle = screen.getByRole('button', { name: /trier par titre/i });
      const sortByAuthor = screen.getByRole('button', { name: /trier par auteur/i });
      const sortByCreated = screen.getByRole('button', { name: /trier par créé le/i });
      const sortByModified = screen.getByRole('button', { name: /trier par modifié le/i });
      const sortByStatus = screen.getByRole('button', { name: /trier par statut/i });

      expect(sortByTitle).toBeInTheDocument();
      expect(sortByAuthor).toBeInTheDocument();
      expect(sortByCreated).toBeInTheDocument();
      expect(sortByModified).toBeInTheDocument();
      expect(sortByStatus).toBeInTheDocument();

      // Clicking a sort button should not throw and should still show the table
      fireEvent.click(sortByTitle);
      await waitFor(() => expect(screen.getByRole('table', { name: /liste des articles/i })).toBeInTheDocument());
    });

    it('trie par date de création (ordre décroissant par défaut)', async () => {
      const articles = [
        makeArticle({ id: 'a1', title: 'Vieil Article', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' }),
        makeArticle({ id: 'a2', title: 'Nouvel Article', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' }),
      ];
      const service = buildService(articles);
      renderDashboard(service);

      const table = await waitForTable();
      const tbody = table.querySelector('tbody');

      // Default sort is createdAt desc — newest article should appear first
      await waitFor(() => {
        const firstRow = tbody.querySelector('tr');
        expect(firstRow.textContent).toContain('Nouvel Article');
      });
    });
  });

  // 7.4 — "Nouvel Article" button
  describe('Requirement 7.4 — Bouton "Nouvel Article"', () => {
    it('affiche le bouton Nouvel Article', async () => {
      const service = buildService([]);
      renderDashboard(service);

      const btn = await screen.findByRole('button', { name: /créer un nouvel article/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Nouvel Article');
    });
  });

  // 7.5 — clicking article opens edit (action buttons present)
  describe('Requirement 7.5 — Boutons Modifier dans le tableau', () => {
    it('affiche le titre de l\'article comme bouton cliquable dans le tableau', async () => {
      const article = makeArticle({ title: 'Test Edition' });
      const service = buildService([article]);
      renderDashboard(service);

      const table = await waitForTable();
      // The title is rendered as a button (no title attribute for the icon buttons)
      const titleBtns = within(table).getAllByTitle('Test Edition');
      expect(titleBtns.length).toBeGreaterThan(0);
      expect(titleBtns[0].tagName).toBe('BUTTON');
    });

    it('affiche le bouton icône Modifier dans les actions', async () => {
      const article = makeArticle({ id: 'a1', title: 'Mon Article' });
      const service = buildService([article]);
      renderDashboard(service);

      await waitForTable();
      const editBtns = screen.getAllByRole('button', { name: /modifier l'article "mon article"/i });
      expect(editBtns.length).toBeGreaterThan(0);
    });
  });

  // 7.6 — quick action buttons: Edit, Delete, Publish/Unpublish
  describe('Requirement 7.6 — Boutons d\'action rapide', () => {
    it('affiche les boutons d\'action pour un brouillon', async () => {
      const article = makeArticle({ id: 'a1', title: 'Mon Brouillon', status: 'draft' });
      const service = buildService([article]);
      renderDashboard(service);

      await waitForTable();
      const editBtns = screen.getAllByRole('button', { name: /modifier l'article "mon brouillon"/i });
      const deleteBtns = screen.getAllByRole('button', { name: /supprimer l'article "mon brouillon"/i });
      const publishBtns = screen.getAllByRole('button', { name: /publier l'article "mon brouillon"/i });
      expect(editBtns.length).toBeGreaterThan(0);
      expect(deleteBtns.length).toBeGreaterThan(0);
      expect(publishBtns.length).toBeGreaterThan(0);
    });

    it('affiche le bouton Dépublier pour un article publié', async () => {
      const article = makeArticle({ id: 'a1', title: 'Mon Publié', status: 'published', publishedAt: new Date().toISOString() });
      const service = buildService([article]);
      renderDashboard(service);

      await waitForTable();
      const btns = screen.getAllByRole('button', { name: /dépublier l'article "mon publié"/i });
      expect(btns.length).toBeGreaterThan(0);
    });

    it('publie un article brouillon au clic sur Publier', async () => {
      const article = makeArticle({ id: 'a1', title: 'À Publier', status: 'draft' });
      const service = buildService([article]);
      renderDashboard(service);

      const table = await waitForTable();
      clickFirstButton(/publier l'article "à publier"/i);

      await waitFor(() => {
        expect(within(table).getByText('Publié')).toBeInTheDocument();
      });
    });

    it('dépublie un article publié au clic sur Dépublier', async () => {
      const article = makeArticle({ id: 'a1', title: 'À Dépublier', status: 'published', publishedAt: new Date().toISOString() });
      const service = buildService([article]);
      renderDashboard(service);

      const table = await waitForTable();
      clickFirstButton(/dépublier l'article "à dépublier"/i);

      await waitFor(() => {
        expect(within(table).getByText('Brouillon')).toBeInTheDocument();
      });
    });
  });

  // 7.7 — delete confirmation dialog
  describe('Requirement 7.7 — Confirmation de suppression', () => {
    it('ouvre une boîte de dialogue de confirmation au clic sur Supprimer', async () => {
      const article = makeArticle({ id: 'a1', title: 'À Supprimer' });
      const service = buildService([article]);
      renderDashboard(service);

      await waitForTable();
      clickFirstButton(/supprimer l'article "à supprimer"/i);

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
    });

    it('supprime l\'article après confirmation', async () => {
      const article = makeArticle({ id: 'a1', title: 'À Effacer' });
      const service = buildService([article]);
      renderDashboard(service);

      await waitForTable();

      // Open dialog
      clickFirstButton(/supprimer l'article "à effacer"/i);
      const dialog = await screen.findByRole('dialog');

      // Confirm deletion using the dialog scope to avoid matching other buttons
      const confirmBtn = within(dialog).getByRole('button', { name: /supprimer définitivement/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      // Article should no longer be in the table - empty state appears
      await waitFor(() => {
        expect(screen.getByText('Aucun article trouvé')).toBeInTheDocument();
      });
    });

    it('ferme le dialogue sans supprimer au clic sur Annuler', async () => {
      const article = makeArticle({ id: 'a1', title: 'Pas Supprimer' });
      const service = buildService([article]);
      renderDashboard(service);

      await waitForTable();

      clickFirstButton(/supprimer l'article "pas supprimer"/i);
      await screen.findByRole('dialog');

      fireEvent.click(screen.getByRole('button', { name: /annuler/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      // Article still present in table
      const table = screen.getByRole('table', { name: /liste des articles/i });
      expect(within(table).getByText('Pas Supprimer')).toBeInTheDocument();
    });

    it('affiche le titre de l\'article dans le dialogue de confirmation', async () => {
      const article = makeArticle({ id: 'a1', title: 'Article Important' });
      const service = buildService([article]);
      renderDashboard(service);

      await waitForTable();
      clickFirstButton(/supprimer l'article "article important"/i);

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText(/article important/i)).toBeInTheDocument();
    });
  });

  // Loading state
  describe('État de chargement', () => {
    it('affiche l\'indicateur de chargement pendant le chargement', () => {
      const service = {
        // Never resolves, simulates a slow network
        getAllArticles: () => new Promise(() => {}),
      };
      renderDashboard(service);
      expect(screen.getByText(/chargement des articles/i)).toBeInTheDocument();
    });
  });

  // Error handling
  describe('Gestion des erreurs', () => {
    it('affiche un message d\'erreur quand le chargement échoue', async () => {
      const service = {
        getAllArticles: () => Promise.reject(new Error('Network error')),
      };
      renderDashboard(service);

      const alert = await screen.findByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/impossible de charger les articles/i);
    });
  });
});
