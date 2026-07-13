/**
 * CLI runner for the blog data migration.
 * This CommonJS wrapper builds the project and runs the migration,
 * outputting migrated articles to a JSON file.
 *
 * Usage:
 *   node scripts/runMigration.cjs [output.json]
 *
 * Since migrateBlogData.js is an ES module (uses `export`), this runner
 * uses a dynamic import() to load it. Requires Node.js >= 12.
 */

'use strict';

const path = require('path');
const fs = require('fs');

const outputArg = process.argv[2] || null;
const outputPath = outputArg
  ? path.resolve(outputArg)
  : path.resolve(__dirname, 'migrated-articles.json');

// Dynamic import of the ES module
import('./migrateBlogData.js')
  .then(({ migrateArticles }) => {
    const articles = migrateArticles();

    fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');

    console.log(`✅ Migration complete. ${articles.length} articles migrated.`);
    console.log(`📄 Output written to: ${outputPath}`);

    articles.forEach((article, index) => {
      console.log(`\n  [${index + 1}] ${article.title}`);
      console.log(`      id:       ${article.id}`);
      console.log(`      slug:     ${article.slug}`);
      console.log(`      status:   ${article.status}`);
      console.log(`      category: ${article.category}`);
      console.log(`      author:   ${article.author}`);
      console.log(`      readTime: ${article.readTime} min`);
    });
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
