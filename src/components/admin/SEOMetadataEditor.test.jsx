import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SEOMetadataEditor from './SEOMetadataEditor';

// ── Helpers ──────────────────────────────────────────────────────────────────

const defaultMetadata = { title: null, description: null, keywords: [] };

function renderEditor(props = {}) {
  const onChange = props.onChange || jest.fn();
  const utils = render(
    <SEOMetadataEditor
      metadata={defaultMetadata}
      articleTitle="Article de test"
      articleExcerpt="Ceci est l'extrait de l'article de test."
      articleSlug="article-de-test"
      onChange={onChange}
      {...props}
    />
  );
  return { ...utils, onChange };
}

/** Returns the SERP preview container element */
function getPreviewContainer() {
  return screen.getByText('Aperçu dans les résultats de recherche').closest('div');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SEOMetadataEditor', () => {
  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders the section heading', () => {
      renderEditor();
      expect(screen.getByText('Référencement (SEO)')).toBeInTheDocument();
    });

    it('renders SEO title input', () => {
      renderEditor();
      expect(screen.getByRole('textbox', { name: /titre seo/i })).toBeInTheDocument();
    });

    it('renders meta description textarea', () => {
      renderEditor();
      expect(screen.getByRole('textbox', { name: /meta description/i })).toBeInTheDocument();
    });

    it('renders keyword input', () => {
      renderEditor();
      expect(screen.getByRole('textbox', { name: /mots-clés seo/i })).toBeInTheDocument();
    });

    it('shows the search result preview section', () => {
      renderEditor();
      expect(screen.getByText('Aperçu dans les résultats de recherche')).toBeInTheDocument();
    });

    it('is expanded by default', () => {
      renderEditor();
      // Fields should be visible
      expect(screen.getByRole('textbox', { name: /titre seo/i })).toBeVisible();
    });

    it('collapses when the header button is clicked', () => {
      renderEditor();
      const toggle = screen.getByRole('button', { name: /référencement/i });
      fireEvent.click(toggle);
      // Fields should no longer be in the DOM
      expect(screen.queryByRole('textbox', { name: /titre seo/i })).not.toBeInTheDocument();
    });

    it('re-expands after a second click', () => {
      renderEditor();
      const toggle = screen.getByRole('button', { name: /référencement/i });
      fireEvent.click(toggle); // collapse
      fireEvent.click(toggle); // expand
      expect(screen.getByRole('textbox', { name: /titre seo/i })).toBeInTheDocument();
    });
  });

  // ── Character counts ───────────────────────────────────────────────────────
  describe('Character counts', () => {
    it('shows 0/60 for an empty SEO title', () => {
      renderEditor();
      expect(screen.getByText('0/60')).toBeInTheDocument();
    });

    it('shows 0/160 for an empty meta description', () => {
      renderEditor();
      expect(screen.getByText('0/160')).toBeInTheDocument();
    });

    it('reflects the length of the current title value', () => {
      const meta = { ...defaultMetadata, title: 'Bonjour' }; // 7 chars
      renderEditor({ metadata: meta });
      expect(screen.getByText('7/60')).toBeInTheDocument();
    });

    it('reflects the length of the current description value', () => {
      const meta = { ...defaultMetadata, description: 'Hello world' }; // 11 chars
      renderEditor({ metadata: meta });
      expect(screen.getByText('11/160')).toBeInTheDocument();
    });
  });

  // ── onChange callbacks ─────────────────────────────────────────────────────
  describe('onChange callbacks', () => {
    it('calls onChange with updated title when user types in the title field', async () => {
      const onChange = jest.fn();
      renderEditor({ onChange });
      const input = screen.getByRole('textbox', { name: /titre seo/i });
      // Simulate typing a single character — each keystroke calls onChange with the delta
      await userEvent.type(input, 'A');
      expect(onChange).toHaveBeenCalled();
      const call = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(typeof call.title).toBe('string');
      expect(call.title).toContain('A');
    });

    it('calls onChange with updated description when user types in the description field', async () => {
      const onChange = jest.fn();
      renderEditor({ onChange });
      const textarea = screen.getByRole('textbox', { name: /meta description/i });
      await userEvent.type(textarea, 'Z');
      expect(onChange).toHaveBeenCalled();
      const call = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(typeof call.description).toBe('string');
      expect(call.description).toContain('Z');
    });

    it('calls onChange with new keyword when user adds a keyword via the button', async () => {
      const onChange = jest.fn();
      renderEditor({ onChange });
      const input = screen.getByPlaceholderText(/agriculture/i);
      await userEvent.type(input, 'technologie');
      fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.keywords).toContain('technologie');
    });

    it('calls onChange with new keyword when user presses Enter', async () => {
      const onChange = jest.fn();
      renderEditor({ onChange });
      const input = screen.getByPlaceholderText(/agriculture/i);
      await userEvent.type(input, 'innovation{enter}');
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.keywords).toContain('innovation');
    });

    it('calls onChange without the removed keyword when user clicks the remove button', async () => {
      const meta = { ...defaultMetadata, keywords: ['agriculture', 'santé'] };
      const onChange = jest.fn();
      renderEditor({ metadata: meta, onChange });
      const removeBtn = screen.getByRole('button', { name: /supprimer le mot-clé "agriculture"/i });
      fireEvent.click(removeBtn);
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.keywords).not.toContain('agriculture');
      expect(lastCall.keywords).toContain('santé');
    });
  });

  // ── Keyword validation ─────────────────────────────────────────────────────
  describe('Keyword validation', () => {
    it('shows an error when attempting to add more than 10 keywords', async () => {
      const tenKeywords = Array.from({ length: 10 }, (_, i) => `kw${i}`);
      const meta = { ...defaultMetadata, keywords: tenKeywords };
      const onChange = jest.fn();
      renderEditor({ metadata: meta, onChange });
      const input = screen.getByPlaceholderText(/agriculture/i);
      await userEvent.type(input, 'onzième{enter}');
      expect(screen.getByRole('alert')).toHaveTextContent(/10 mots-clés/i);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not add a duplicate keyword', async () => {
      const meta = { ...defaultMetadata, keywords: ['agriculture'] };
      const onChange = jest.fn();
      renderEditor({ metadata: meta, onChange });
      const input = screen.getByPlaceholderText(/agriculture/i);
      await userEvent.type(input, 'agriculture{enter}');
      // onChange should not have been called because it's a duplicate
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ── Search result preview ──────────────────────────────────────────────────
  describe('Search result preview', () => {
    it('shows the article title as fallback preview title when SEO title is empty', () => {
      renderEditor({ articleTitle: 'Mon Article Génial' });
      // The preview link shows the article title as its visible text content
      const preview = getPreviewContainer();
      expect(within(preview).getByRole('link')).toHaveTextContent('Mon Article Génial');
    });

    it('shows the SEO title in the preview when provided', () => {
      const meta = { ...defaultMetadata, title: 'Titre SEO spécifique' };
      renderEditor({ metadata: meta });
      const preview = getPreviewContainer();
      expect(within(preview).getByRole('link')).toHaveTextContent('Titre SEO spécifique');
    });

    it('shows the canonical URL in the preview', () => {
      renderEditor({ articleSlug: 'article-test' });
      expect(screen.getByText('https://lmaaza.com/blog/article-test')).toBeInTheDocument();
    });

    it('shows the article excerpt as fallback preview description when SEO description is empty', () => {
      const excerpt = 'Extrait de démonstration pour le preview SEO.';
      renderEditor({ articleExcerpt: excerpt });
      // The preview paragraph (not the textarea) shows the excerpt
      const preview = getPreviewContainer();
      // Find the description paragraph inside the preview card
      const card = preview.querySelector('.max-w-xl');
      expect(card).toHaveTextContent(excerpt);
    });

    it('shows the SEO description in the preview when provided', () => {
      const meta = { ...defaultMetadata, description: 'Ma meta description personnalisée' };
      renderEditor({ metadata: meta });
      // Use getAllByText and verify at least one match is the preview paragraph (not textarea)
      const preview = getPreviewContainer();
      const card = preview.querySelector('.max-w-xl');
      expect(card).toHaveTextContent('Ma meta description personnalisée');
    });
  });

  // ── Fallback info hints ────────────────────────────────────────────────────
  describe('Fallback info hints', () => {
    it('shows an info hint when SEO title is empty', () => {
      renderEditor();
      expect(
        screen.getByText(/le titre de l'article sera utilisé comme titre seo par défaut/i)
      ).toBeInTheDocument();
    });

    it('shows an info hint when SEO description is empty', () => {
      renderEditor();
      expect(
        screen.getByText(/l'extrait de l'article sera utilisé comme meta description par défaut/i)
      ).toBeInTheDocument();
    });

    it('hides the title hint once the SEO title is filled', () => {
      // Use a title long enough to avoid the "too short" warning but not the "no title" hint
      const meta = { ...defaultMetadata, title: 'Un titre SEO suffisamment long pour le test' };
      renderEditor({ metadata: meta });
      expect(
        screen.queryByText(/le titre de l'article sera utilisé comme titre seo par défaut/i)
      ).not.toBeInTheDocument();
    });
  });

  // ── Progress bars ──────────────────────────────────────────────────────────
  describe('Progress bars', () => {
    it('renders two progress bars (title and description)', () => {
      renderEditor();
      const bars = screen.getAllByRole('progressbar');
      expect(bars).toHaveLength(2);
    });

    it('title progress bar has correct aria-valuemax of 60', () => {
      renderEditor();
      const titleBar = screen.getByRole('progressbar', { name: 'Utilisation du titre SEO' });
      expect(titleBar).toHaveAttribute('aria-valuemax', '60');
    });

    it('description progress bar has correct aria-valuemax of 160', () => {
      renderEditor();
      const descBar = screen.getByRole('progressbar', { name: 'Utilisation de la meta description' });
      expect(descBar).toHaveAttribute('aria-valuemax', '160');
    });
  });
});
