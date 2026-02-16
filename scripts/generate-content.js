#!/usr/bin/env node

/**
 * Content Generation Pipeline
 *
 * Usage:
 *   npm run generate                          # Generate all pages
 *   npm run generate -- --keyword "keyword"   # Generate one specific page
 *   npm run generate -- --type best-for       # Generate all of a type
 *   npm run generate -- --force               # Regenerate even if exists
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
const ARTICLES_DIR = site.contentDir;
const SITE_NAME = site.config.name || process.env.SITE_NAME || 'SmartHomePicks';

// ─── Load data ───────────────────────────────────────────────────

function loadKeywords() {
  const raw = fs.readFileSync(KEYWORDS_FILE, 'utf-8');
  return yaml.load(raw);
}

function loadProducts() {
  const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  return JSON.parse(raw).products;
}

function getProductById(products, id) {
  return products.find((p) => p.id === id);
}

// ─── System prompts by page type ─────────────────────────────────

function getSystemPrompt(type) {
  const base = `You are an expert smart home product reviewer writing for ${SITE_NAME}, a trusted smart home review site. Your writing style is:

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
- Aim for genuinely helpful content that would make a real person bookmark the page.`;

  const typeInstructions = {
    'best-for': `${base}

You are writing a "Best [Product] for [Use Case]" article. Structure:

1. **Opening paragraph (2-3 sentences):** Immediately state your #1 pick and why. Include the primary keyword naturally. This paragraph should be featured-snippet-worthy — direct and useful.
2. **"What to Look For" section (## heading):** 3-4 key factors buyers should consider for this specific use case. Be specific, not generic.
3. **Individual product reviews (## heading for each product):** For each product, write 150-250 words covering:
   - Why it's good for this specific use case
   - 2-3 standout features with specific specs
   - Who it's best for (and who should skip it)
   - Any notable limitations
4. **"How We Tested" section (## heading):** Brief credibility-building paragraph about testing methodology.
5. **"Bottom Line" section (## heading):** Restate your top pick and runner-up in 2-3 sentences.

Content length: 1500-2500 words total.`,

    vs: `${base}

You are writing a "[Product A] vs [Product B]" comparison article. Structure:

1. **Opening paragraph (2-3 sentences):** State the clear winner upfront. Don't make readers scroll — tell them who wins and why in the first paragraph.
2. **"The Quick Verdict" section (## heading):** 3-4 sentence summary of who should buy which product.
3. **Category-by-category comparison (## headings):** Compare in 5-6 categories relevant to these products (e.g., Video Quality, Smart Home Integration, Value for Money, etc.). Each category:
   - 100-150 words of direct comparison
   - End with a clear "Winner: [Product]" declaration
4. **"Who Should Buy [Product A]" section (## heading):** Bullet points of ideal buyer profiles
5. **"Who Should Buy [Product B]" section (## heading):** Bullet points of ideal buyer profiles
6. **"Final Verdict" section (## heading):** Definitive winner with nuance about edge cases.

Content length: 1500-2000 words total. The winner must be CLEAR — this is not a "both are great" article.`,

    info: `${base}

You are writing an informational/how-to article that builds topical authority. Structure:

1. **Opening paragraph (2-3 sentences):** Directly answer the question in the first paragraph. This should be featured-snippet-optimized — imagine Google pulling this exact text.
2. **Detailed explanation (## headings):** Break the topic into 3-5 logical sections with ## headings. Each section should be 150-250 words.
3. **Practical tips or steps (## heading):** Actionable advice readers can use immediately.
4. **"What We Recommend" section (## heading):** Tie it back to 1-2 specific product recommendations with brief explanations of why they're relevant to this topic.

Content length: 1000-1500 words total.`,
  };

  return typeInstructions[type] || base;
}

// ─── Build user prompts ──────────────────────────────────────────

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

Remember: State your #1 pick (${getProductById(products, entry.products[0].id)?.name}) in the very first sentence. Be specific with specs and numbers. Write for someone actively shopping.`,

    vs: `Write a head-to-head comparison article targeting the keyword: "${entry.keyword}"

Here are the two products to compare:
${productDetails}

Remember: Pick a clear winner in the first paragraph. Compare category by category with a winner declared in each section. Be opinionated.`,

    info: `Write an informational article targeting the keyword: "${entry.keyword}"

Category context: This article is in the "${entry.category}" section of our smart home review site.
${productDetails ? `\nRelevant products to mention where appropriate:\n${productDetails}` : ''}

Remember: Answer the question directly in the first paragraph. Write for someone searching this exact question on Google.`,
  };

  return prompts[entry.type] || `Write an article about: "${entry.keyword}"`;
}

// ─── FAQ Generation ──────────────────────────────────────────────

function buildFaqPrompt(entry) {
  return `Generate 5 FAQ questions and answers for an article about "${entry.keyword}" in the smart home niche.

Requirements:
- Questions should be "People Also Ask" style — the kind of questions Google shows
- Answers should be 2-3 sentences each, direct and helpful
- Include the keyword or related terms naturally
- Mix of practical questions, comparison questions, and "is it worth it" questions

Output format — return ONLY valid JSON, no markdown code fences:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]`;
}

// ─── Build frontmatter ───────────────────────────────────────────

function buildFrontmatter(entry, products, faq, allEntries) {
  const today = new Date().toISOString().split('T')[0];

  // Resolve product data for frontmatter
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
        affiliateTag: p.affiliate_tag && p.affiliate_tag !== 'PLACEHOLDER' ? p.affiliate_tag : (site.config.affiliateTag || process.env.AMAZON_AFFILIATE_TAG || 'YOURTAG-20'),
        specs: product.specs,
        pros: product.pros,
        cons: product.cons,
      };
    })
    .filter(Boolean);

  // Find related articles (same category, different slug)
  const relatedSlugs = allEntries
    .filter((e) => e.slug !== entry.slug && e.category === entry.category)
    .map((e) => e.slug)
    .slice(0, 5);

  const fm = {
    title: generateTitle(entry),
    description: generateDescription(entry),
    slug: entry.slug,
    category: entry.category,
    type: entry.type,
    datePublished: today,
    dateModified: today,
  };

  if (resolvedProducts.length > 0) {
    fm.products = resolvedProducts;
  }

  if (faq && faq.length > 0) {
    fm.faq = faq;
  }

  if (relatedSlugs.length > 0) {
    fm.relatedSlugs = relatedSlugs;
  }

  return fm;
}

function generateTitle(entry) {
  const year = new Date().getFullYear();
  const titles = {
    'best-for': `Best ${toTitleCase(entry.keyword.replace('best ', ''))} in ${year}`,
    vs: `${toTitleCase(entry.keyword)}: Which Is Better in ${year}?`,
    info: `${toTitleCase(entry.keyword)} — Complete Guide (${year})`,
  };
  // Trim to under 60 chars
  let title = titles[entry.type] || toTitleCase(entry.keyword);
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  return title;
}

function generateDescription(entry) {
  const descs = {
    'best-for': `We tested and compared the top options to find the best ${entry.keyword.replace('best ', '')}. See our #1 pick and detailed reviews.`,
    vs: `An honest, side-by-side comparison of ${entry.keyword}. We pick a clear winner based on features, price, and real-world performance.`,
    info: `Everything you need to know about ${entry.keyword}. Expert advice with practical tips and product recommendations.`,
  };
  let desc = descs[entry.type] || `Expert guide: ${entry.keyword}`;
  if (desc.length > 155) {
    desc = desc.substring(0, 152) + '...';
  }
  return desc;
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

// ─── Write article file ─────────────────────────────────────────

function writeArticle(frontmatter, content) {
  const filePath = path.join(ARTICLES_DIR, `${frontmatter.slug}.md`);
  const yamlFm = yaml.dump(frontmatter, { lineWidth: -1, quotingType: '"', forceQuotes: true });
  const fileContent = `---\n${yamlFm}---\n\n${content}\n`;

  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  return filePath;
}

// ─── Main pipeline ───────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const forceFlag = args.includes('--force');

  let filterKeyword = null;
  let filterType = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--keyword' && args[i + 1]) {
      filterKeyword = args[i + 1];
    }
    if (args[i] === '--type' && args[i + 1]) {
      filterType = args[i + 1];
    }
  }

  console.log('\n📝 Content Generation Pipeline');
  console.log('─'.repeat(50));

  const allEntries = loadKeywords();
  const products = loadProducts();

  // Filter entries based on flags
  let entries = allEntries;
  if (filterKeyword) {
    entries = entries.filter((e) => e.keyword.toLowerCase().includes(filterKeyword.toLowerCase()));
    console.log(`Filtering by keyword: "${filterKeyword}" (${entries.length} matches)`);
  }
  if (filterType) {
    entries = entries.filter((e) => e.type === filterType);
    console.log(`Filtering by type: "${filterType}" (${entries.length} matches)`);
  }

  if (entries.length === 0) {
    console.log('No matching keywords found. Check your filters.');
    return;
  }

  console.log(`Found ${entries.length} keyword(s) to process\n`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of entries) {
    const filePath = path.join(ARTICLES_DIR, `${entry.slug}.md`);
    const exists = fs.existsSync(filePath);

    if (exists && !forceFlag) {
      console.log(`⏭  Skipping "${entry.keyword}" (already exists, use --force to regenerate)`);
      skipped++;
      continue;
    }

    console.log(`🔄 Generating: "${entry.keyword}" (${entry.type})`);

    try {
      // Step 1: Generate main content
      const system = getSystemPrompt(entry.type);
      const userPrompt = buildUserPrompt(entry, products);
      console.log('   → Generating article content...');
      const content = await generateWithRetry({
        system,
        prompt: userPrompt,
        maxTokens: 4096,
      });

      // Step 2: Generate FAQ
      console.log('   → Generating FAQ...');
      let faq = [];
      try {
        const faqRaw = await generateWithRetry({
          system: 'You are a helpful assistant that generates FAQ content in JSON format. Return only valid JSON, no code fences.',
          prompt: buildFaqPrompt(entry),
          maxTokens: 1500,
        });
        // Extract JSON from response (handle potential markdown fences)
        const jsonMatch = faqRaw.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          faq = JSON.parse(jsonMatch[0]);
        }
      } catch (faqError) {
        console.log('   ⚠ FAQ generation failed, continuing without FAQ');
      }

      // Step 3: Build frontmatter and write file
      const frontmatter = buildFrontmatter(entry, products, faq, allEntries);
      const outputPath = writeArticle(frontmatter, content);
      console.log(`   ✅ Written: ${path.relative(process.cwd(), outputPath)}`);
      generated++;

      // Rate limiting delay between API calls
      if (entries.indexOf(entry) < entries.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ Generated: ${generated}`);
  console.log(`⏭  Skipped: ${skipped}`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);
  console.log('');
}

main().catch(console.error);
