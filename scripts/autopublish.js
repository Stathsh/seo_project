#!/usr/bin/env node

/**
 * Autopublish Script
 *
 * Finds pending keywords (no article yet) and generates articles for them.
 * Designed to be called by GitHub Actions on a cron schedule.
 *
 * Usage:
 *   node scripts/autopublish.js              # Generate 1 article (default)
 *   node scripts/autopublish.js --count 3    # Generate up to 3 articles
 *   node scripts/autopublish.js --dry-run    # Show what would be generated
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';
import { generateWithRetry } from './utils/claude-client.js';
import { resolveSite } from './resolve-site.js';

dotenv.config();

const site = resolveSite();
const KEYWORDS_FILE = path.join(site.dataDir, 'keywords.yaml');
const PRODUCTS_FILE = path.join(site.dataDir, 'products.json');
const ENGINE_FILE = path.join(site.dataDir, 'content-engine.json');
const ARTICLES_DIR = site.contentDir;
const USAGE_FILE = path.join(site.dataDir, 'api-usage.json');

// ─── Load content engine config ─────────────────────────────

function loadEngineConfig() {
  if (fs.existsSync(ENGINE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ENGINE_FILE, 'utf-8'));
    } catch { /* fall through */ }
  }
  return {};
}

const engineConfig = loadEngineConfig();

// ─── Parse CLI args ─────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let count = 1;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
    }
    if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  // Use schedule config as default if available
  const schedule = engineConfig.schedule || {};
  if (count === 1 && schedule.articlesPerRun) {
    count = schedule.articlesPerRun;
  }

  return { count: Math.max(1, Math.min(count, 10)), dryRun };
}

// ─── Find pending keywords ──────────────────────────────────────

function findPendingKeywords() {
  if (!fs.existsSync(KEYWORDS_FILE)) {
    return [];
  }

  const keywords = yaml.load(fs.readFileSync(KEYWORDS_FILE, 'utf-8'));
  if (!Array.isArray(keywords)) return [];

  return keywords.filter((entry) => {
    const articlePath = path.join(ARTICLES_DIR, `${entry.slug}.md`);
    return !fs.existsSync(articlePath);
  });
}

// ─── Reuse generation logic from generate-content.js ────────────

function loadProducts() {
  if (!fs.existsSync(PRODUCTS_FILE)) return [];
  const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  return JSON.parse(raw).products;
}

function getProductById(products, id) {
  return products.find((p) => p.id === id);
}

function getSystemPrompt(type) {
  const siteName = site.config.name || process.env.SITE_NAME || 'SmartHomeRanked';
  const prompts = engineConfig.prompts || {};
  const base = (prompts.base || `You are an expert smart home product reviewer writing for {{SITE_NAME}}, a trusted smart home review site. Your writing style is:

- Conversational and authoritative — like a knowledgeable friend who's tested everything
- Opinionated with specific recommendations — never wishy-washy "it depends" conclusions
- Detail-oriented with real specs, numbers, and concrete comparisons
- Honest about tradeoffs — every product has cons, and you mention them
- Written for humans first, naturally incorporating keywords without stuffing
- Structured with clear H2/H3 hierarchy in markdown

IMPORTANT FORMATTING RULES:
- Use ## for H2 and ### for H3 headings. Never use # (H1) — the title is handled separately.
- Write in markdown. Do not include frontmatter — that's handled separately.
- Do NOT include an FAQ section — that's generated separately.
- Do NOT wrap the entire output in a markdown code block.
- Aim for genuinely helpful content that would make a real person bookmark the page.`).replace(/\{\{SITE_NAME\}\}/g, siteName);

  const typePrompt = prompts[type];
  if (typePrompt) {
    return `${base}\n\n${typePrompt}`;
  }

  const fallbackInstructions = {
    'best-for': `You are writing a "Best [Product] for [Use Case]" article. Structure:

1. **Opening paragraph (2-3 sentences):** Immediately state your #1 pick and why.
2. **"What to Look For" section (## heading):** 3-4 key factors for this use case.
3. **Individual product reviews (## heading for each):** 150-250 words each.
4. **"How We Tested" section (## heading):** Brief credibility paragraph.
5. **"Bottom Line" section (## heading):** Restate top pick and runner-up.

Content length: 1500-2500 words total.`,

    vs: `You are writing a "[Product A] vs [Product B]" comparison article. Structure:

1. **Opening paragraph:** State the clear winner upfront.
2. **"The Quick Verdict" section:** 3-4 sentence summary.
3. **Category-by-category comparison (## headings):** 5-6 categories, 100-150 words each.
4. **"Who Should Buy [Product A]" section:** Bullet points.
5. **"Who Should Buy [Product B]" section:** Bullet points.
6. **"Final Verdict" section:** Definitive winner.

Content length: 1500-2000 words total.`,

    info: `You are writing an informational/how-to article. Structure:

1. **Opening paragraph:** Directly answer the question.
2. **Detailed explanation (## headings):** 3-5 sections, 150-250 words each.
3. **Practical tips or steps (## heading):** Actionable advice.
4. **"What We Recommend" section:** 1-2 product recommendations.

Content length: 1000-1500 words total.`,
  };

  return fallbackInstructions[type] ? `${base}\n\n${fallbackInstructions[type]}` : base;
}

function buildUserPrompt(entry, products) {
  const productDetails = (entry.products || [])
    .map((p) => {
      const product = getProductById(products, p.id);
      if (!product) return null;
      return `
Product: ${product.name}
Brand: ${product.brand}
Price: $${product.price}
Rating: ${product.rating}/5 (${product.reviewCount} reviews)
Key Specs: ${Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join(', ')}
Pros: ${product.pros.join('; ')}
Cons: ${product.cons.join('; ')}`;
    })
    .filter(Boolean)
    .join('\n');

  const prompts = {
    'best-for': `Write a comprehensive "best products" article targeting the keyword: "${entry.keyword}"

Here are the products to review (in recommended order — first product is the top pick):
${productDetails}

Remember: State your #1 pick in the very first sentence. Be specific with specs and numbers.`,

    vs: `Write a head-to-head comparison article targeting the keyword: "${entry.keyword}"

Here are the two products to compare:
${productDetails}

Remember: Pick a clear winner in the first paragraph.`,

    info: `Write an informational article targeting the keyword: "${entry.keyword}"

Category context: This article is in the "${entry.category}" section.
${productDetails ? `\nRelevant products to mention where appropriate:\n${productDetails}` : ''}

Remember: Answer the question directly in the first paragraph.`,
  };

  return prompts[entry.type] || `Write an article about: "${entry.keyword}"`;
}

function buildFaqPrompt(entry) {
  const prompts = engineConfig.prompts || {};
  if (prompts.faq) {
    return prompts.faq.replace(/\{\{KEYWORD\}\}/g, entry.keyword);
  }
  return `Generate 5 FAQ questions and answers for an article about "${entry.keyword}" in the smart home niche.

Requirements:
- Questions should be "People Also Ask" style
- Answers should be 2-3 sentences each
- Include the keyword or related terms naturally

Output format — return ONLY valid JSON, no markdown code fences:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]`;
}

function toTitleCase(str) {
  const minor = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in', 'of', 'vs', 'is']);
  return str
    .split(' ')
    .map((word, i) => {
      if (i === 0 || !minor.has(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word.toLowerCase();
    })
    .join(' ');
}

function buildFrontmatter(entry, products, faq, allEntries) {
  const today = new Date().toISOString().split('T')[0];
  const affiliateTag = site.config.affiliateTag || process.env.AMAZON_AFFILIATE_TAG || 'YOURTAG-20';

  const resolvedProducts = (entry.products || [])
    .map((p) => {
      const product = getProductById(products, p.id);
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        rating: product.rating,
        reviewCount: product.reviewCount,
        asin: product.asin,
        affiliateTag,
        specs: product.specs,
        pros: product.pros,
        cons: product.cons,
      };
    })
    .filter(Boolean);

  const relatedSlugs = allEntries
    .filter((e) => e.slug !== entry.slug && e.category === entry.category)
    .map((e) => e.slug)
    .slice(0, 5);

  const year = new Date().getFullYear();
  const titles = {
    'best-for': `Best ${toTitleCase(entry.keyword.replace('best ', ''))} in ${year}`,
    vs: `${toTitleCase(entry.keyword)}: Which Is Better in ${year}?`,
    info: `${toTitleCase(entry.keyword)} — Complete Guide (${year})`,
  };
  let title = titles[entry.type] || toTitleCase(entry.keyword);
  if (title.length > 60) title = title.substring(0, 57) + '...';

  const descs = {
    'best-for': `We tested and compared the top options to find the best ${entry.keyword.replace('best ', '')}. See our #1 pick and detailed reviews.`,
    vs: `An honest, side-by-side comparison of ${entry.keyword}. We pick a clear winner based on features, price, and real-world performance.`,
    info: `Everything you need to know about ${entry.keyword}. Expert advice with practical tips and product recommendations.`,
  };
  let description = descs[entry.type] || `Expert guide: ${entry.keyword}`;
  if (description.length > 155) description = description.substring(0, 152) + '...';

  const fm = { title, description, slug: entry.slug, category: entry.category, type: entry.type, datePublished: today, dateModified: today };
  if (resolvedProducts.length > 0) fm.products = resolvedProducts;
  if (faq && faq.length > 0) fm.faq = faq;
  if (relatedSlugs.length > 0) fm.relatedSlugs = relatedSlugs;

  return fm;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  const { count, dryRun } = parseArgs();

  console.log('\n🤖 Autopublish');
  console.log('─'.repeat(50));

  // Respect the dashboard schedule toggle
  const schedule = engineConfig.schedule || {};
  if (!schedule.enabled && !dryRun) {
    console.log('Autopublish is disabled. Enable it in the dashboard under Content Engine → Publishing Schedule.');
    process.exit(0);
  }

  const pending = findPendingKeywords();

  if (pending.length === 0) {
    console.log('No pending keywords to generate. Add more keywords to keywords.yaml or run trend-research.');
    process.exit(0);
  }

  const batch = pending.slice(0, count);
  console.log(`Found ${pending.length} pending keyword(s), generating ${batch.length}\n`);

  if (dryRun) {
    console.log('DRY RUN — would generate:');
    batch.forEach((entry) => {
      console.log(`  [${entry.type}] ${entry.keyword} → ${entry.slug}.md`);
    });
    process.exit(0);
  }

  const allEntries = yaml.load(fs.readFileSync(KEYWORDS_FILE, 'utf-8'));
  const products = loadProducts();
  let generated = 0;
  let errors = 0;

  for (const entry of batch) {
    console.log(`🔄 Generating: "${entry.keyword}" (${entry.type})`);

    try {
      // Step 1: Generate main content
      const aiModel = engineConfig.model || undefined;
      const aiKey = engineConfig.apiKey || undefined;
      console.log('   → Writing article...');
      const content = await generateWithRetry({
        system: getSystemPrompt(entry.type),
        prompt: buildUserPrompt(entry, products),
        maxTokens: engineConfig.maxTokens || 4096,
        model: aiModel,
        apiKey: aiKey,
        usageFile: USAGE_FILE,
      });

      // Step 2: Generate FAQ
      console.log('   → Generating FAQ...');
      let faq = [];
      try {
        const faqRaw = await generateWithRetry({
          system: 'You are a helpful assistant that generates FAQ content in JSON format. Return only valid JSON, no code fences.',
          prompt: buildFaqPrompt(entry),
          maxTokens: engineConfig.faqMaxTokens || 1500,
          model: aiModel,
          apiKey: aiKey,
          usageFile: USAGE_FILE,
        });
        const jsonMatch = faqRaw.match(/\[[\s\S]*\]/);
        if (jsonMatch) faq = JSON.parse(jsonMatch[0]);
      } catch {
        console.log('   ⚠ FAQ generation failed, continuing without FAQ');
      }

      // Step 3: Write file
      const frontmatter = buildFrontmatter(entry, products, faq, allEntries);
      const filePath = path.join(ARTICLES_DIR, `${frontmatter.slug}.md`);
      const yamlFm = yaml.dump(frontmatter, { lineWidth: -1, quotingType: '"', forceQuotes: true });
      const fileContent = `---\n${yamlFm}---\n\n${content}\n`;

      fs.mkdirSync(ARTICLES_DIR, { recursive: true });
      fs.writeFileSync(filePath, fileContent, 'utf-8');

      console.log(`   ✅ Published: ${entry.slug}.md`);
      generated++;

      // Rate limiting
      if (batch.indexOf(entry) < batch.length - 1) {
        const delay = engineConfig.schedule?.delayBetweenMs || 2000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ Generated: ${generated}`);
  console.log(`📋 Remaining: ${pending.length - generated}`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);

  // Exit with error code if nothing was generated
  if (generated === 0 && errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
