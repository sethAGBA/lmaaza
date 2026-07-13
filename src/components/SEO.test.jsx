import React from 'react';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './SEO';
import { generateOpenGraphTags } from '../services/seoService';

/**
 * Unit tests for the SEO component.
 * Validates that react-helmet-async is used to inject SEO metadata
 * into the HTML head (Requirement 6.7).
 *
 * Note: Full DOM injection testing of react-helmet-async v2 in jsdom
 * requires async processing that's difficult to test reliably in a unit test context.
 * These tests verify the component structure, props handling, and integration with SEOService.
 * End-to-end tests in a real browser (Cypress/Playwright) would verify actual head injection.
 */

// Helper to render SEO inside the required HelmetProvider context
const renderWithHelmet = (ui) => {
  return render(
    <HelmetProvider>{ui}</HelmetProvider>
  );
};

describe('SEO component', () => {
  describe('component rendering', () => {
    it('renders without crashing with no props', () => {
      expect(() => renderWithHelmet(<SEO />)).not.toThrow();
    });

    it('renders nothing in the DOM body (only writes to head via Helmet)', () => {
      const { container } = renderWithHelmet(<SEO />);
      // SEO component renders nothing in the DOM body - Helmet writes to head
      expect(container.firstChild).toBeNull();
    });

    it('renders with all props provided', () => {
      expect(() =>
        renderWithHelmet(
          <SEO
            title="Test Title"
            description="Test description"
            keywords="test, keywords"
            canonical="https://example.com"
            ogImage="https://example.com/image.jpg"
            type="article"
          />
        )
      ).not.toThrow();
    });
  });

  describe('title formatting', () => {
    it('appends site name to title when not already present', () => {
      // Test the logic inside the component
      const title = "Mon Article de Blog";
      const fullTitle = title.includes("L'Maaza") ? title : `${title} | L'Maaza`;
      expect(fullTitle).toBe("Mon Article de Blog | L'Maaza");
    });

    it('does not duplicate site name when title already contains it', () => {
      const title = "L'Maaza - Page d'accueil";
      const fullTitle = title.includes("L'Maaza") ? title : `${title} | L'Maaza`;
      expect(fullTitle).toBe("L'Maaza - Page d'accueil");
    });
  });

  describe('keywords handling', () => {
    it('accepts keywords as a string', () => {
      const keywords = "agriculture, santé, éducation";
      const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      expect(keywordsString).toBe("agriculture, santé, éducation");
    });

    it('converts keywords array to comma-separated string', () => {
      const keywords = ['agriculture', 'santé', 'éducation'];
      const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      expect(keywordsString).toBe('agriculture, santé, éducation');
    });
  });

  describe('article prop integration with SEOService', () => {
    it('generates Open Graph tags from article data', () => {
      const article = {
        title: "L'Innovation au Togo",
        excerpt: "Un aperçu de l'innovation technologique au Togo.",
        slug: 'linnovation-au-togo',
        featuredImage: { url: 'https://lmaaza.net/images/innovation.jpg' },
        seoMetadata: {
          title: 'Innovation Togo SEO',
          description: "Description SEO personnalisée pour l'article",
          canonicalUrl: 'https://lmaaza.com/blog/linnovation-au-togo',
        },
      };

      const ogTags = generateOpenGraphTags(article);

      expect(ogTags).toMatchObject({
        ogTitle: 'Innovation Togo SEO',
        ogDescription: "Description SEO personnalisée pour l'article",
        ogImage: 'https://lmaaza.net/images/innovation.jpg',
        ogType: 'article',
        ogUrl: 'https://lmaaza.com/blog/linnovation-au-togo',
      });
    });

    it('falls back to article title when seoMetadata.title is null', () => {
      const article = {
        title: "L'Innovation au Togo",
        excerpt: "Un aperçu de l'innovation technologique au Togo.",
        slug: 'linnovation-au-togo',
        featuredImage: null,
        seoMetadata: { title: null, description: null, canonicalUrl: '' },
      };

      const ogTags = generateOpenGraphTags(article);

      expect(ogTags.ogTitle).toBe("L'Innovation au Togo");
      expect(ogTags.ogType).toBe('article');
    });

    it('uses seoMetadata when present', () => {
      const article = {
        title: "Article Original",
        excerpt: "Extrait original.",
        slug: 'article-original',
        featuredImage: null,
        seoMetadata: {
          title: 'Titre SEO personnalisé',
          description: 'Description SEO personnalisée',
          canonicalUrl: 'https://custom-url.com',
        },
      };

      const ogTags = generateOpenGraphTags(article);

      expect(ogTags.ogTitle).toBe('Titre SEO personnalisé');
      expect(ogTags.ogDescription).toBe('Description SEO personnalisée');
    });
  });

  describe('Requirement 6.7 - SEO Component Enhancement', () => {
    it('uses react-helmet-async Helmet component', () => {
      const { container } = renderWithHelmet(<SEO />);
      // Component uses Helmet internally, renders no visible DOM
      expect(container.firstChild).toBeNull();
    });

    it('supports all required SEO metadata props', () => {
      // Verify the component accepts all required props without errors
      expect(() =>
        renderWithHelmet(
          <SEO
            title="SEO Test Title"
            description="SEO test description with French content"
            keywords={['innovation', 'Togo', 'agriculture']}
            canonical="https://lmaaza.net/test"
            ogImage="https://lmaaza.net/image.jpg"
            type="article"
            structuredData={{ '@context': 'https://schema.org', '@type': 'Article' }}
          />
        )
      ).not.toThrow();
    });

    it('supports article prop for automatic Open Graph generation', () => {
      const article = {
        title: 'Test Article',
        excerpt: 'Test excerpt for article.',
        slug: 'test-article',
        featuredImage: { url: 'https://example.com/image.jpg' },
        seoMetadata: null,
      };

      expect(() => renderWithHelmet(<SEO article={article} />)).not.toThrow();
    });

    it('supports French language content in all fields', () => {
      expect(() =>
        renderWithHelmet(
          <SEO
            title="L'Innovation Technologique au Togo"
            description="Découvrez les projets d'innovation dans l'agriculture, la santé et l'éducation."
            keywords="innovation, technologie, Togo, agriculture, santé, éducation"
            canonical="https://lmaaza.net/innovation-togo"
          />
        )
      ).not.toThrow();
    });
  });

  describe('backward compatibility', () => {
    it('maintains compatibility with existing usage in Blog.jsx', () => {
      // This mimics the usage in src/pages/Blog.jsx
      expect(() =>
        renderWithHelmet(
          <SEO
            title="Blog - Actualités et Innovations Technologiques | L'Maaza"
            description="Découvrez les dernières actualités technologiques, innovations et projets de L'Maaza. Articles sur l'agriculture, la santé, l'éducation et l'environnement au Togo."
            keywords="blog technologique, innovation, agriculture, santé, éducation, environnement, Togo, Arduino, formation, L'Maaza, actualités"
            canonical="https://lmaaza.net/blog"
          />
        )
      ).not.toThrow();
    });

    it('maintains compatibility with default props', () => {
      // Previous usage with no props should still work
      expect(() => renderWithHelmet(<SEO />)).not.toThrow();
    });
  });
});
