/**
 * verifyMigration.js
 *
 * Verification helper for the L'Maaza blog data migration.
 *
 * TWO WAYS TO VERIFY:
 *
 * 1. NODE (offline) — verifies the migrated-articles.json output file.
 *    Run:  node scripts/verifyMigration.js
 *
 * 2. BROWSER — paste the snippet at the bottom of this file into the
 *    browser DevTools console after the app has loaded and initialized
 *    localStorage via initializeStorage().
 *
 * Requirements: 10.2, 10.6
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Node verification
// ---------------------------------------------------------------------------

const jsonPath = resolve(__dirname, 'migrated-articles.json');

let articles;
try {
  articles = JSON.parse(readFileSync(jsonPath, 'utf-8'));
} catch (err) {
  console.error(`❌ Could not read ${jsonPath}`);
  console.error('   Run `node scripts/runMigration.cjs` first to generate the file.');
  process.exit(1);
}

console.log(`\n📋 Verifying migrated-articles.json\n`);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

// Top-level checks
check('Exactly 4 articles migrated', articles.length === 4);

articles.forEach((article, i) => {
  const n = i + 1;
  console.log(`\n  Article [${n}]: ${article.title}`);

  check(`[${n}] Has valid UUID v4 id`, UUID_RE.test(article.id));
  check(`[${n}] Has non-empty title`, typeof article.title === 'string' && article.title.length > 0);
  check(`[${n}] Has non-empty excerpt`, typeof article.excerpt === 'string' && article.excerpt.length > 0);
  check(`[${n}] Has non-empty content`, typeof article.content === 'string' && article.content.length > 0);
  check(`[${n}] Has non-empty category`, typeof article.category === 'string' && article.category.length > 0);
  check(`[${n}] Has non-empty author`, typeof article.author === 'string' && article.author.length > 0);
  check(`[${n}] Status is "published"`, article.status === 'published');
  check(`[${n}] Has valid URL-safe slug`, SLUG_RE.test(article.slug));
  check(`[${n}] readTime is a positive number`, typeof article.readTime === 'number' && article.readTime >= 1);
  check(`[${n}] createdAt is an ISO date`, !isNaN(Date.parse(article.createdAt)));
  check(`[${n}] publishedAt is an ISO date`, !isNaN(Date.parse(article.publishedAt)));
  check(`[${n}] Has seoMetadata`, article.seoMetadata && typeof article.seoMetadata === 'object');
  check(
    `[${n}] canonicalUrl contains slug`,
    article.seoMetadata && article.seoMetadata.canonicalUrl.includes(article.slug)
  );
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log(`  🎉 All verification checks passed!\n`);
} else {
  console.log(`  ⚠️  Some checks failed — review the output above.\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Browser verification snippet
//
// After the app loads and initializeStorage() has run, open DevTools and
// paste the following snippet into the Console tab:
//
// ─────────────────────────────────────────────────────────────────────────────
// (function() {
//   const KEY = 'lmaaza_blog_articles';
//   const raw = localStorage.getItem(KEY);
//   if (!raw) { console.error('No articles in localStorage. Run initializeStorage() first.'); return; }
//   const articles = JSON.parse(raw);
//   console.log(`✅ Found ${articles.length} articles in localStorage`);
//   articles.forEach((a, i) => {
//     console.group(`[${i+1}] ${a.title}`);
//     console.log('id      :', a.id);
//     console.log('slug    :', a.slug);
//     console.log('status  :', a.status);
//     console.log('category:', a.category);
//     console.log('author  :', a.author);
//     console.log('readTime:', a.readTime, 'min');
//     console.groupEnd();
//   });
// })();
// ─────────────────────────────────────────────────────────────────────────────
