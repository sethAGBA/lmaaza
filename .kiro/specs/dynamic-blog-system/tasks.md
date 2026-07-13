# Implementation Plan: Dynamic Blog System

## Overview

This implementation plan transforms the L'Maaza static blog (currently using `data.js`) into a fully dynamic blog system with CRUD capabilities, rich content editing, categorization, search/filtering, SEO optimization, and multimedia support. The implementation will use **JavaScript** with React 18.3.1, maintaining compatibility with the existing architecture (React Router, Tailwind CSS, Lucide React icons).

The plan follows an incremental approach: establish core data models and storage layer first, migrate existing content, build admin interfaces for content management, enhance public interfaces with search and filtering, integrate rich text editing, add multimedia support, implement SEO features, and finally optimize performance and accessibility.

## Tasks

- [x] 1. Set up data models, storage layer, and core services
  - Create directory structure: `src/models/`, `src/services/`, `src/adapters/`
  - Define Article and MediaAsset models with validation functions
  - Implement StorageAdapter interface and LocalStorageAdapter implementation
  - Implement ArticleService with CRUD operations
  - Set up testing infrastructure with Jest and fast-check for property-based testing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 10.1, 10.6_

- [x]* 1.1 Write property test for Article Creation Initialization (Property 1)
  - **Property 1: Article Creation Initialization**
  - **Validates: Requirements 1.1, 8.1**
  - Test that createArticle returns article with unique id, ISO 8601 createdAt, status "draft", updatedAt equals createdAt, publishedAt is null
  - _Requirements: 1.1, 8.1_
  - _Implemented in `src/services/articleService.pbt.test.js`_

- [x]* 1.2 Write property test for Storage Persistence Round-Trip (Property 30)
  - **Property 30: Article Storage Persistence Round-Trip**
  - **Validates: Requirements 10.1**
  - Test that saveArticle followed by getArticle returns equivalent article with all fields preserved
  - _Requirements: 10.1_
  - _Implemented in `src/services/articleService.pbt.test.js`_

- [x] 2. Implement data migration from static blog data
  - [x] 2.1 Create migration script (`src/migration/migrateBlogData.js`, re-exported via `scripts/migrateBlogData.js`)
    - Parse existing blogPosts from `src/data.js`
    - Transform to new Article schema with UUID generation, slug generation, SEO metadata
    - Store migrated articles with status "published" using ArticleService
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  
  - [x]* 2.2 Write integration test for migration script
    - Verify all 4 existing blog posts transform correctly
    - Verify no data loss (title, excerpt, content, author, date, category, readTime)
    - Verify each article has unique UUID, published status, and valid slug
    - _Requirements: 10.2, 10.3, 10.4_
    - _Implemented in `src/migration/migrateBlogData.test.js`_
  
  - [x] 2.3 Execute migration and verify in localStorage
    - Run migration script
    - Verify articles in localStorage browser console
    - Auto-initialized on app startup via `src/utils/initializeStorage.js` in `src/index.js`
    - _Requirements: 10.2, 10.6_

- [x] 3. Checkpoint - Migration complete
  - Ensure migration tests pass, ask the user if questions arise.

- [x] 4. Build Admin Dashboard and Article List
  - [x] 4.1 Create AdminDashboard component (`src/components/admin/AdminDashboard.jsx`)
    - Display table of all articles (draft and published)
    - Show columns: title, author, createdAt, updatedAt, status, category
    - Implement sort functionality by date, title, author, status
    - Add "New Article" button
    - Implement quick action buttons: Edit, Delete, Publish/Unpublish
    - Add delete confirmation dialog
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x]* 4.2 Write unit tests for AdminDashboard
    - Test article list rendering with mock data
    - Test sort functionality
    - Test delete confirmation dialog display
    - Test action buttons render correctly
    - _Requirements: 7.1, 7.2, 7.3, 7.7_
    - _Implemented in `src/components/admin/AdminDashboard.test.jsx`_
  
  - [x] 4.3 Add admin route protection and authorization
    - Create AuthContext for role-based access control
    - Implement admin role check middleware
    - Add redirect to login for unauthorized access
    - Routes wired in `src/App.js` via `ProtectedRoute`
    - _Requirements: 1.6, 7.8, 7.9_
  
  - [ ]* 4.4 Write property test for Authorization Enforcement (Property 6)
    - **Property 6: Authorization Enforcement**
    - **Validates: Requirements 1.6, 7.8**
    - Test that CRUD operations without admin role throw authorization error and don't modify data
    - _Requirements: 1.6, 7.8_

- [x] 5. Implement SEO utilities and services
  - [x] 5.1 Create SEOService (`src/services/seoService.js`)
    - Implement generateSlug with French accent normalization
    - Implement generateMetaDescription (first 160 chars of excerpt)
    - Implement generateCanonicalUrl
    - Implement generateOpenGraphTags
    - Implement validateSEOMetadata
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8, 6.9_
  
  - [ ]* 5.2 Write property test for Slug Generation URL Safety (Property 20)
    - **Property 20: Slug Generation URL Safety**
    - **Validates: Requirements 6.9**
    - Test that generateSlug returns lowercase alphanumeric with hyphens, no accents, no consecutive/leading/trailing hyphens
    - _Requirements: 6.9_
    - _Partial: covered by unit tests in `seoService.test.js` and `migrateBlogData.test.js`_
  
  - [ ]* 5.3 Write property test for SEO Default Fallback Values (Property 19)
    - **Property 19: SEO Default Fallback Values**
    - **Validates: Requirements 6.4, 6.5**
    - Test that null SEO title defaults to article title, null description defaults to first 160 chars of excerpt
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 5.4 Write property test for Open Graph Tag Completeness (Property 22)
    - **Property 22: Open Graph Tag Completeness**
    - **Validates: Requirements 6.8**
    - Test that generateOpenGraphTags returns object with all required fields: ogTitle, ogDescription, ogType "article", ogUrl
    - _Requirements: 6.8_
    - _Partial: covered by unit tests in `seoService.test.js`_
  
  - [x] 5.5 Create SEO component enhancement (`src/components/SEO.jsx`)
    - Inject SEO metadata into HTML head using react-helmet-async
    - Add support for canonical URL, meta description, keywords, Open Graph tags
    - _Requirements: 6.7_
  
  - [ ]* 5.6 Write property test for SEO Metadata Injection (Property 23)
    - **Property 23: SEO Metadata Injection**
    - **Validates: Requirements 6.7**
    - Test that rendered HTML head includes title, meta description, canonical link tags
    - _Requirements: 6.7_
    - _Partial: covered by unit tests in `src/components/SEO.test.jsx`_

- [x] 6. Build Article Editor interface with basic form
  - [x] 6.1 Create ArticleEditorPage component (`src/pages/admin/ArticleEditor.jsx`)
    - Create form with fields: title, excerpt, content (textarea for now), category, tags, author
    - Implement form validation (required fields, max lengths, category validation)
    - Add "Save as Draft" and "Publish" buttons
    - Implement auto-save to draft every 30 seconds
    - Wire to ArticleService for create/update operations
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3_
  
  - [ ]* 6.2 Write property test for Category Validation (Property 8)
    - **Property 8: Category Validation**
    - **Validates: Requirements 3.1, 3.2**
    - Test that validation accepts only seven defined categories: Agriculture, Santé, Éducation, Environnement, Formation, Innovation, Technologie
    - _Requirements: 3.1, 3.2_
    - _Partial: covered by unit tests in `src/models/article.test.js`_
  
  - [ ]* 6.3 Write property test for Article Update Preserves Identity (Property 2)
    - **Property 2: Article Update Preserves Identity and Updates Timestamp**
    - **Validates: Requirements 1.2**
    - Test that updateArticle preserves id, updates updatedAt, reflects specified updates, preserves unspecified fields
    - _Requirements: 1.2_
    - _Partial: covered by unit tests in `src/services/articleService.test.js`_
  
  - [x] 6.4 Create SEOMetadataEditor component (`src/components/admin/SEOMetadataEditor.jsx`)
    - Add fields for SEO title, description, keywords
    - Show character counts (title max 60, description max 160)
    - Display preview of how article will appear in search results
    - Wired into `ArticleEditorPage`
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 6.5 Implement publish/unpublish functionality
    - Add publishArticle and unpublishArticle methods to ArticleService
    - Update ArticleEditorPage to handle publish state transitions
    - Display visual indicator for draft vs published status
    - _Requirements: 8.3, 8.4, 8.7_
  
  - [ ]* 6.6 Write property test for Publish Status Transition (Property 24)
    - **Property 24: Publish Status Transition**
    - **Validates: Requirements 8.3**
    - Test that publishArticle changes status to "published", sets publishedAt timestamp, updates updatedAt
    - _Requirements: 8.3_
    - _Partial: covered by unit tests in `src/services/articleService.test.js`_
  
  - [ ]* 6.7 Write property test for Unpublish Status Transition (Property 25)
    - **Property 25: Unpublish Status Transition**
    - **Validates: Requirements 8.4**
    - Test that unpublishArticle changes status to "draft", preserves publishedAt, updates updatedAt
    - _Requirements: 8.4_
    - _Partial: covered by unit tests in `src/services/articleService.test.js`_

- [x] 7. Checkpoint - Admin CRUD and SEO complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Integrate rich text editor
  - [x] 8.1 Install and configure Lexical editor
    - Install @lexical/react and required Lexical packages
    - Create RichTextEditor component (`src/components/admin/RichTextEditor.jsx`)
    - Configure toolbar with formatting options: bold, italic, underline, strikethrough, headings (H1-H6), lists, links, code blocks, blockquotes
    - Implement image insertion placeholder (will connect to MediaService later)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 8.2 Implement content serialization to HTML
    - Configure Lexical to output HTML format
    - Store HTML content in Article.content field
    - _Requirements: 2.8_
  
  - [x] 8.3 Create ArticlePreview component (`src/components/admin/ArticlePreview.jsx`)
    - Render article content as it will appear on public blog
    - Show preview side-by-side with editor or in modal
    - _Requirements: 2.9_
  
  - [ ]* 8.4 Write property test for Content Serialization Round-Trip (Property 7)
    - **Property 7: Content Serialization Round-Trip**
    - **Validates: Requirements 2.8, 2.9**
    - Test that serializing editor content to HTML and deserializing back preserves all formatting, links, media references
    - _Requirements: 2.8, 2.9_

- [x] 9. Implement MediaService and media upload
  - [x] 9.1 Create MediaService (`src/services/mediaService.js`)
    - Implement uploadImage and uploadVideo methods
    - Store media as base64 data URLs in localStorage (or external URLs for future API)
    - Implement file format validation (PNG, JPEG, WebP, GIF, SVG for images; MP4, WebM, OGG for videos)
    - Implement file size validation (10MB images, 50MB videos)
    - Generate unique ID for each media asset
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [x]* 9.2 Write property test for Media Format Validation (Property 16)
    - **Property 16: Media Format Validation**
    - **Validates: Requirements 5.1, 5.2**
    - Test that image validation accepts only valid MIME types, video validation accepts only valid MIME types
    - _Requirements: 5.1, 5.2_
    - _Implemented in `src/services/mediaService.test.js`_
  
  - [ ]* 9.3 Write property test for Media Storage Round-Trip (Property 17)
    - **Property 17: Media Storage Round-Trip**
    - **Validates: Requirements 5.6, 5.7**
    - Test that saveMedia followed by getMedia returns equivalent MediaAsset with all fields preserved
    - _Requirements: 5.6, 5.7_
    - _Partial: covered by unit tests in `src/services/mediaService.test.js`_
  
  - [x] 9.4 Create MediaLibrary component (`src/components/admin/MediaLibrary.jsx`)
    - Display grid of uploaded media assets
    - Implement file upload UI with drag-and-drop
    - Add alt text input for images (accessibility)
    - Show upload progress indicator
    - Allow media selection for insertion into articles
    - _Requirements: 5.3, 5.4, 5.5, 5.6_
  
  - [x] 9.5 Connect MediaLibrary to RichTextEditor
    - Add "Insert Image" button to editor toolbar
    - Open MediaLibrary modal for media selection
    - Insert selected image into editor content
    - _Requirements: 2.5, 5.4_
  
  - [x] 9.6 Add featured image support to ArticleEditorPage
    - Add featured image upload field
    - Display featured image preview
    - Store featuredImage reference in Article model
    - _Requirements: 5.3_

- [x] 10. Implement search and filtering functionality
  - [x] 10.1 Create SearchService (`src/services/searchService.js`)
    - Implement searchFullText method (search in title, excerpt, content)
    - Implement relevance scoring (title matches rank higher than content matches)
    - Implement highlightMatches method for search term highlighting
    - _Requirements: 4.2, 4.3, 4.7_
  
  - [x]* 10.2 Write property test for Search Scope Correctness (Property 12)
    - **Property 12: Search Scope Correctness**
    - **Validates: Requirements 4.2**
    - Test that articles not containing query in title/excerpt/content don't appear in results
    - _Requirements: 4.2_
    - _Implemented in `src/services/searchService.test.js`_
  
  - [x]* 10.3 Write property test for Search Relevance Ordering (Property 13)
    - **Property 13: Search Relevance Ordering**
    - **Validates: Requirements 4.3**
    - Test that articles with title matches appear before excerpt/content-only matches
    - _Requirements: 4.3_
    - _Implemented in `src/services/searchService.test.js`_
  
  - [x]* 10.4 Write property test for Highlight Preservation (Property 15)
    - **Property 15: Highlight Preservation**
    - **Validates: Requirements 4.7**
    - Test that highlightMatches returns string that, when markup stripped, equals original text
    - _Requirements: 4.7_
    - _Implemented in `src/services/searchService.test.js`_
  
  - [x] 10.5 Add filtering methods to ArticleService
    - Implement getArticlesByCategory
    - Implement getArticlesByTag
    - Implement combined filter logic (category + tag + search query) via `filterPublishedArticles`
    - _Requirements: 3.6, 3.7, 4.4, 4.5_
  
  - [ ]* 10.6 Write property test for Category Filtering Correctness (Property 10)
    - **Property 10: Category Filtering Correctness**
    - **Validates: Requirements 3.6, 3.8**
    - Test that getArticlesByCategory returns only published articles with matching category
    - _Requirements: 3.6, 3.8_
    - _Partial: covered by unit tests in `src/services/articleService.test.js`_
  
  - [ ]* 10.7 Write property test for Tag Filtering Correctness (Property 11)
    - **Property 11: Tag Filtering Correctness**
    - **Validates: Requirements 3.7, 3.8**
    - Test that getArticlesByTag returns only published articles containing specified tag
    - _Requirements: 3.7, 3.8_
    - _Partial: covered by unit tests in `src/services/articleService.test.js`_
  
  - [ ]* 10.8 Write property test for Combined Filter Conjunction (Property 14)
    - **Property 14: Combined Filter Conjunction**
    - **Validates: Requirements 4.4, 4.5**
    - Test that combined filters return only published articles satisfying ALL specified filters (category + tag + query)
    - _Requirements: 4.4, 4.5_

- [x] 11. Checkpoint - Core functionality complete
  - All 369 unit tests pass. App integrated with BlogProvider and admin routes.

- [x] 12. Enhance public blog interface with search and filtering
  - [x] 12.1 Create SearchBar component (`src/components/blog/SearchBar.jsx`)
    - Text input field for search query
    - Search button
    - Wire to SearchService
    - _Requirements: 4.1, 4.2_
  
  - [x] 12.2 Create CategoryFilter component (`src/components/blog/CategoryFilter.jsx`)
    - Display all categories as filter buttons
    - Highlight active category
    - Allow deselection to show all categories
    - _Requirements: 3.6, 3.8_
  
  - [x] 12.3 Create TagCloud component (`src/components/blog/TagCloud.jsx`)
    - Display popular tags with size based on article count
    - Allow tag selection for filtering
    - _Requirements: 3.7, 3.8_
  
  - [x] 12.4 Update BlogListPage (`src/pages/Blog.jsx`)
    - Integrate SearchBar, CategoryFilter, TagCloud components
    - Implement filter state management
    - Update article list based on active filters
    - Display "No results" message when no articles match filters
    - Display article count for current filters
    - _Requirements: 4.1, 4.4, 4.5, 4.6_
  
  - [x] 12.5 Extract ArticleCard component (`src/components/blog/ArticleCard.jsx`)
    - Display article preview: featured image, title, excerpt, author, date, category, readTime
    - Make entire card clickable to navigate to article detail
    - Support grid and list layout variants
    - _Requirements: 9.3_
  
  - [ ]* 12.6 Write property test for Article Card Data Completeness (Property 27)
    - **Property 27: Article Card Data Completeness**
    - **Validates: Requirements 9.3**
    - Test that rendered article card includes all required fields: featuredImage, title, excerpt, author, date, category, readTime
    - _Requirements: 9.3_

- [x] 13. Implement pagination and related articles
  - [x] 13.1 Create Pagination component (`src/components/blog/Pagination.jsx`)
    - Display page numbers and navigation arrows
    - Highlight current page
    - Support configurable items per page (default 12)
    - Utility: `src/utils/paginationUtils.js`
    - _Requirements: 9.6_
  
  - [ ]* 13.2 Write property test for Pagination Boundary Correctness (Property 28)
    - **Property 28: Pagination Boundary Correctness**
    - **Validates: Requirements 9.6**
    - Test that pagination produces correct number of pages, correct items per page, correct items on last page, no duplicate articles
    - _Requirements: 9.6_
  
  - [x] 13.3 Integrate Pagination into BlogListPage
    - Add pagination controls at bottom of article list
    - Update article list to show only current page items
    - Preserve filters and search query when changing pages
    - _Requirements: 9.6_
  
  - [x] 13.4 Implement related articles logic in ArticleService
    - Create getSuggestedRelatedArticles method
    - Find articles with same category or overlapping tags
    - Exclude current article from suggestions
    - Limit to 3-4 suggestions
    - _Requirements: 9.7_
  
  - [ ]* 13.5 Write property test for Related Article Relevance (Property 29)
    - **Property 29: Related Article Relevance**
    - **Validates: Requirements 9.7**
    - Test that all related articles share category or at least one tag with source article
    - _Requirements: 9.7_
  
  - [x] 13.6 Update ArticleDetailPage (`src/pages/Article.jsx`)
    - Display suggested related articles at bottom
    - Enhance with category and tag display
    - SEO via `<SEO article={article} />`
    - Legacy URL redirect (`/blog/1` → slug)
    - _Requirements: 9.5, 9.7_

- [x] 14. Implement published-only visibility and sorting
  - [x] 14.1 Update BlogListPage to show only published articles
    - Filter articles by status === "published"
    - Sort by publishedAt descending (newest first)
    - _Requirements: 1.5, 9.1, 9.2_
  
  - [ ]* 14.2 Write property test for Published Article Visibility Filtering (Property 5)
    - **Property 5: Published Article Visibility Filtering**
    - **Validates: Requirements 1.5, 3.8, 9.1**
    - Test that getPublishedArticles returns only published articles, excludes drafts
    - _Requirements: 1.5, 3.8, 9.1_
    - _Partial: covered by unit tests in `src/services/articleService.test.js` and PBT_
  
  - [ ]* 14.3 Write property test for Default Sort Order (Property 26)
    - **Property 26: Default Sort Order**
    - **Validates: Requirements 9.2**
    - Test that getPublishedArticles with default sort returns articles in descending publishedAt order
    - _Requirements: 9.2_
  
  - [x] 14.4 Update ArticleDetailPage to show only published articles
    - Redirect to 404 if article is draft or not found
    - _Requirements: 1.5_

- [x] 15. Checkpoint - Public blog interface complete
  - Public blog wired to dynamic services. Build succeeds.

- [ ] 16. Implement performance optimizations
  - [x] 16.1 Add lazy loading for images
    - Set loading="lazy" attribute on all images except featured image
    - _Requirements: 5.9, 12.2_
    - _Note: IntersectionObserver fallback not implemented_
  
  - [ ]* 16.2 Write property test for Lazy Loading Attribute (Property 18)
    - **Property 18: Lazy Loading Attribute**
    - **Validates: Requirements 5.9, 12.2**
    - Test that all images except featured image have loading="lazy" attribute
    - _Requirements: 5.9, 12.2_
  
  - [x] 16.3 Optimize React rendering
    - Wrap ArticleCard in React.memo
    - Use useMemo for expensive computations (filtering, sorting)
    - Use useCallback for event handlers passed to child components
    - _Requirements: 12.4_
  
  - [ ] 16.4 Implement article caching
    - Cache recently viewed articles in memory
    - Implement cache invalidation when articles are updated
    - _Requirements: 12.6_
  
  - [x] 16.5 Optimize excerpt display
    - Limit excerpt length to 200 characters in ArticleCard
    - Add ellipsis for truncated text
    - Utility: `truncateExcerpt` in `src/utils/articleDisplayUtils.js`
    - _Requirements: 12.7_

- [ ] 17. Implement responsive design and accessibility
  - [x] 17.1 Add responsive styles using Tailwind CSS
    - Ensure all components work on mobile (320px+), tablet (768-1024px), desktop (1024px+)
    - Optimize ArticleCard layout for different screen sizes
    - Make admin interfaces responsive
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 17.2 Enhance accessibility
    - Add alt text fields to all images (enforce in MediaLibrary)
    - Use semantic HTML tags (article, section, nav, header)
    - Implement keyboard navigation for all interactive elements
    - Add ARIA labels where needed
    - _Requirements: 11.5, 11.6, 11.7, 11.8, 11.9_
    - _Note: Full WCAG 2.1 AA audit not performed_
  
  - [ ]* 17.3 Write automated accessibility tests
    - Use jest-axe to test key components for WCAG violations
    - Test BlogListPage, ArticleDetailPage, AdminDashboard, ArticleEditorPage
    - _Requirements: 11.5, 11.6, 11.7, 11.8_

- [ ] 18. Implement error handling and storage management
  - [x] 18.1 Add error boundaries
    - Wrap admin section in error boundary with fallback UI
    - Wrap public blog in error boundary with fallback
    - Component: `src/components/ErrorBoundary.jsx`
    - _Requirements: 10.8_
  
  - [ ] 18.2 Implement storage quota monitoring
    - Check localStorage usage periodically
    - Display warning banner at 80% quota
    - Show error message if quota exceeded
    - _Requirements: 10.6, 10.8_
    - _Note: `getStorageInfo()` exists in LocalStorageAdapter but no UI banner_
  
  - [x] 18.3 Add validation error handling
    - Display inline field-level errors in ArticleEditorPage
    - Prevent save/publish when validation fails
    - Preserve user input during validation errors
    - _Requirements: 1.1, 1.2_
  
  - [x] 18.4 Add authorization error handling
    - Redirect unauthorized users to login page
    - Display appropriate error message
    - _Requirements: 1.6, 7.8, 7.9_
  
  - [x] 18.5 Add media upload error handling
    - Display errors for invalid format, file too large, upload failed
    - Show user-friendly messages in French
    - _Requirements: 5.1, 5.2_

- [x] 19. Add video support and media enhancements
  - [x] 19.1 Extend MediaService for video handling
    - Validate video formats (MP4, WebM, OGG)
    - _Requirements: 5.2, 5.5_
    - _Note: Video thumbnail generation not implemented_
  
  - [x] 19.2 Add video insertion to RichTextEditor
    - Insert video via ArticleEditor modal (HTML5 video element in content)
    - Add playback controls (play, pause, volume) via native controls
    - _Requirements: 5.5, 5.8, 11.9_
    - _Note: Insert button in editor form, not Lexical toolbar_

- [ ] 20. Final integration and testing
  - [x] 20.1 Run full integration test suite
    - 369 unit tests pass across all services and components
    - Migration tests pass
    - App integration test passes
    - Production build succeeds
    - _Requirements: All_
    - _Note: Dedicated end-to-end CRUD integration test file not created_
  
  - [ ]* 20.2 Run property-based test suite
    - Execute all 30 property tests with at least 100 iterations each
    - Verify no property violations
    - Document any edge cases discovered
    - _Requirements: All_
    - _Partial: Properties 1 and 30 implemented with fast-check (100 iterations)_
  
  - [ ] 20.3 Perform manual accessibility testing
    - Test keyboard navigation through all interfaces
    - Test with screen reader (NVDA or JAWS)
    - Verify color contrast on all pages
    - _Requirements: 11.5, 11.6, 11.7, 11.8_
  
  - [ ] 20.4 Performance testing
    - Run Lighthouse audit on blog list page (target Performance ≥ 80)
    - Verify lazy loading working correctly
    - Test load time on simulated 3G connection (target < 3 seconds)
    - Monitor bundle size (target blog chunk < 100KB)
    - _Requirements: 12.1, 12.2, 12.3_
    - _Note: Main bundle is ~372 KB gzipped (Lexical editor included)_

- [x] 21. Checkpoint - Final verification
  - All 369 tests pass. Production build succeeds. Blog system integrated and deployable.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP delivery
- Property-based tests are critical for correctness guarantees and should be implemented for production readiness
- All property tests use the fast-check library with minimum 100 iterations
- The implementation maintains backward compatibility with existing React Router routes
- The design uses localStorage initially but is architected to support future backend API migration
- All user-facing text should be in French to match the existing L'Maaza platform language
- Migration runs automatically on app startup via `initializeStorage()` in `src/index.js`
- Admin authentication is implemented via `AuthContext` and `ProtectedRoute` before exposing admin routes
- Maintenance mode is controlled by `REACT_APP_MAINTENANCE_MODE=true` environment variable

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "4.1", "4.3", "5.1"] },
    { "id": 3, "tasks": ["4.2", "4.4", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 4, "tasks": ["5.6", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "6.5"] },
    { "id": 6, "tasks": ["6.6", "6.7", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3", "8.4", "9.1"] },
    { "id": 8, "tasks": ["9.2", "9.3", "9.4"] },
    { "id": 9, "tasks": ["9.5", "9.6", "10.1"] },
    { "id": 10, "tasks": ["10.2", "10.3", "10.4", "10.5"] },
    { "id": 11, "tasks": ["10.6", "10.7", "10.8", "12.1", "12.2", "12.3"] },
    { "id": 12, "tasks": ["12.4"] },
    { "id": 13, "tasks": ["12.5", "12.6", "13.1"] },
    { "id": 14, "tasks": ["13.2", "13.3", "13.4"] },
    { "id": 15, "tasks": ["13.5", "13.6", "14.1"] },
    { "id": 16, "tasks": ["14.2", "14.3", "14.4", "16.1"] },
    { "id": 17, "tasks": ["16.2", "16.3", "16.4", "16.5", "17.1", "17.2"] },
    { "id": 18, "tasks": ["17.3", "18.1", "18.2", "18.3", "18.4", "18.5", "19.1"] },
    { "id": 19, "tasks": ["19.2", "20.1"] },
    { "id": 20, "tasks": ["20.2", "20.3", "20.4"] }
  ]
}
```
