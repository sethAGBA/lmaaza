/**
 * Unit tests for ArticleService.
 */

import { ArticleService } from './articleService';
import { InMemoryAdapter } from '../adapters/inMemoryAdapter';
import { ARTICLE_STATUS } from '../models/article';

const validInput = {
  title: 'Test Article Title',
  excerpt: 'Test article excerpt for blog post',
  content:
    'This is valid test content that meets the minimum requirement of 100 characters for article content validation in the blog system.',
  category: 'Agriculture',
  author: 'Test Author',
  tags: ['tag1', 'tag2'],
};

function createService() {
  const adapter = new InMemoryAdapter();
  return { service: new ArticleService(adapter, null), adapter };
}

describe('ArticleService', () => {
  describe('createArticle', () => {
    it('should create article with unique ID and draft status', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);

      expect(article.id).toBeDefined();
      expect(article.id).not.toBe('');
      expect(article.status).toBe(ARTICLE_STATUS.DRAFT);
    });

    it('should set createdAt and updatedAt to the same ISO timestamp', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);

      expect(article.createdAt).toBeDefined();
      expect(article.updatedAt).toBe(article.createdAt);
    });

    it('should set publishedAt to null', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);

      expect(article.publishedAt).toBeNull();
    });

    it('should generate unique IDs for different articles', async () => {
      const { service } = createService();
      const a1 = await service.createArticle(validInput);
      const a2 = await service.createArticle(validInput);

      expect(a1.id).not.toBe(a2.id);
    });

    it('should throw validation error for invalid input', async () => {
      const { service } = createService();
      const badInput = { ...validInput, title: '' };

      await expect(service.createArticle(badInput)).rejects.toThrow();
    });

    it('should throw validation error for invalid category', async () => {
      const { service } = createService();
      const badInput = { ...validInput, category: 'InvalidCategory' };

      await expect(service.createArticle(badInput)).rejects.toThrow();
    });
  });

  describe('getArticle', () => {
    it('should retrieve a created article', async () => {
      const { service } = createService();
      const created = await service.createArticle(validInput);
      const retrieved = await service.getArticle(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved.id).toBe(created.id);
    });

    it('should return null for nonexistent article', async () => {
      const { service } = createService();
      const result = await service.getArticle('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllArticles', () => {
    it('should return all articles regardless of status (admin view)', async () => {
      const { service } = createService();
      const a1 = await service.createArticle(validInput);
      const a2 = await service.createArticle(validInput);
      await service.publishArticle(a2.id);

      const articles = await service.getAllArticles();
      expect(articles).toHaveLength(2);
    });

    it('should return empty array when no articles exist', async () => {
      const { service } = createService();
      const articles = await service.getAllArticles();
      expect(articles).toHaveLength(0);
    });
  });

  describe('getPublishedArticles', () => {
    it('should return only published articles', async () => {
      const { service } = createService();
      const draft = await service.createArticle(validInput);
      const published = await service.createArticle(validInput);
      await service.publishArticle(published.id);

      const result = await service.getPublishedArticles();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(published.id);
      expect(result[0].status).toBe(ARTICLE_STATUS.PUBLISHED);
    });

    it('should not include draft articles', async () => {
      const { service } = createService();
      await service.createArticle(validInput);

      const result = await service.getPublishedArticles();
      expect(result).toHaveLength(0);
    });

    it('should return articles sorted by publishedAt descending by default', async () => {
      const { service } = createService();
      const a1 = await service.createArticle(validInput);
      const a2 = await service.createArticle(validInput);

      await service.publishArticle(a1.id);
      await new Promise((r) => setTimeout(r, 5)); // slight delay to ensure different timestamps
      await service.publishArticle(a2.id);

      const result = await service.getPublishedArticles();
      expect(result[0].id).toBe(a2.id); // newest first
      expect(result[1].id).toBe(a1.id);
    });
  });

  describe('updateArticle', () => {
    it('should update specified fields', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const updated = await service.updateArticle(article.id, { title: 'Updated Title' });

      expect(updated.title).toBe('Updated Title');
    });

    it('should preserve article ID', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const updated = await service.updateArticle(article.id, { title: 'Updated Title' });

      expect(updated.id).toBe(article.id);
    });

    it('should preserve unspecified fields', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const updated = await service.updateArticle(article.id, { title: 'Updated Title' });

      expect(updated.author).toBe(validInput.author);
      expect(updated.content).toBe(validInput.content);
    });

    it('should update updatedAt timestamp', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const originalUpdatedAt = article.updatedAt;

      await new Promise((r) => setTimeout(r, 5));
      const updated = await service.updateArticle(article.id, { title: 'Updated Title' });

      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('should throw for nonexistent article', async () => {
      const { service } = createService();
      await expect(
        service.updateArticle('nonexistent', { title: 'Updated' })
      ).rejects.toThrow();
    });
  });

  describe('publishArticle', () => {
    it('should change status to published', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const published = await service.publishArticle(article.id);

      expect(published.status).toBe(ARTICLE_STATUS.PUBLISHED);
    });

    it('should set publishedAt timestamp', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const published = await service.publishArticle(article.id);

      expect(published.publishedAt).toBeDefined();
      expect(published.publishedAt).not.toBeNull();
      expect(() => new Date(published.publishedAt)).not.toThrow();
    });

    it('should update updatedAt', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const before = article.updatedAt;

      await new Promise((r) => setTimeout(r, 5));
      const published = await service.publishArticle(article.id);

      expect(new Date(published.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime()
      );
    });
  });

  describe('unpublishArticle', () => {
    it('should change status back to draft', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      await service.publishArticle(article.id);
      const unpublished = await service.unpublishArticle(article.id);

      expect(unpublished.status).toBe(ARTICLE_STATUS.DRAFT);
    });

    it('should preserve publishedAt timestamp', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const published = await service.publishArticle(article.id);
      const publishedAt = published.publishedAt;

      const unpublished = await service.unpublishArticle(article.id);

      expect(unpublished.publishedAt).toBe(publishedAt);
    });

    it('should update updatedAt', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      const published = await service.publishArticle(article.id);

      await new Promise((r) => setTimeout(r, 5));
      const unpublished = await service.unpublishArticle(article.id);

      expect(new Date(unpublished.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(published.updatedAt).getTime()
      );
    });
  });

  describe('deleteArticle', () => {
    it('should delete article from storage', async () => {
      const { service } = createService();
      const article = await service.createArticle(validInput);
      await service.deleteArticle(article.id);

      const result = await service.getArticle(article.id);
      expect(result).toBeNull();
    });
  });

  describe('getArticlesByCategory', () => {
    it('should return only published articles with matching category', async () => {
      const { service } = createService();
      const agri = await service.createArticle({ ...validInput, category: 'Agriculture' });
      const sante = await service.createArticle({ ...validInput, category: 'Santé' });

      await service.publishArticle(agri.id);
      await service.publishArticle(sante.id);

      const result = await service.getArticlesByCategory('Agriculture');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Agriculture');
    });

    it('should not return draft articles', async () => {
      const { service } = createService();
      const draft = await service.createArticle({ ...validInput, category: 'Agriculture' });
      // Not published

      const result = await service.getArticlesByCategory('Agriculture');
      expect(result).toHaveLength(0);
    });
  });

  describe('getArticlesByTag', () => {
    it('should return only published articles with matching tag', async () => {
      const { service } = createService();
      const a1 = await service.createArticle({ ...validInput, tags: ['agriculture', 'tech'] });
      const a2 = await service.createArticle({ ...validInput, tags: ['health'] });

      await service.publishArticle(a1.id);
      await service.publishArticle(a2.id);

      const result = await service.getArticlesByTag('tech');
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('tech');
    });

    it('should not return draft articles', async () => {
      const { service } = createService();
      await service.createArticle({ ...validInput, tags: ['tech'] });

      const result = await service.getArticlesByTag('tech');
      expect(result).toHaveLength(0);
    });
  });
});
