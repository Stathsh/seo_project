#!/usr/bin/env node

/**
 * Trend Research Script
 *
 * Uses Claude to brainstorm trending/seasonal smart home topics,
 * deduplicates against existing keywords, and appends new ones.
 *
 * Usage:
 *   node scripts/trend-research.js                          # Auto-detect niche from site config
 *   node scripts/trend-research.js --topic "smart locks"    # Focus on a specific sub-topic
 *   node scripts/trend-research.js --count 20               # Generate ~20 keywords (default: 15)
 *   node scripts/trend-research.js --dry-run                # Show results without saving
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
const CATEGORIES_FILE = path.join(site.dataDir, 'categories.json');
const ENGINE_FILE = path.join(site.dataDir, 'content-engine.json');
const USAGE_FILE = path.join(site.dataDir, 'api-usage.json');

// ─── Parse CLI args ─────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let topic = null;
  let count = 15;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
    }
    if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
    }
    if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  return { topic, count: Math.max(5, Math.min(count, 50)), dryRun };
}

// ─── Load existing data ─────────────────────────────────────────

function loadExistingKeywords() {
  if (!fs.existsSync(KEYWORDS_FILE)) return [];
  const data = yaml.load(fs.readFileSync(KEYWORDS_FILE, 'utf-8'));
  return Array.isArray(data) ? data : [];
}

function loadProducts() {
  if (!fs.existsSync(PRODUCTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8')).products || [];
}

function loadCategories() {
  if (!fs.existsSync(CATEGORIES_FILE)) return [];
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));
  return (data.categories || data || []).map((c) => c.slug || c.name);
}

// ─── Build the research prompt ──────────────────────────────────

function buildResearchPrompt(existingKeywords, products, categories, topic, count) {
  const existingSlugs = existingKeywords.map((k) => k.slug);
  const existingKeywordList = existingKeywords.map((k) => k.keyword).join('\n- ');
  const productNames = products.map((p) => `${p.name} (${p.brand})`).join(', ');
  const categoryList = categories.join(', ');

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const topicFocus = topic
    ? `Focus specifically on: "${topic}"`
    : `Cover a mix of categories: ${categoryList}`;

  return `You are an SEO keyword researcher for a smart home review site. It is currently ${currentMonth}.

${topicFocus}

Our available product database includes: ${productNames}
Our categories: ${categoryList}

EXISTING keywords we already have (DO NOT duplicate these):
- ${existingKeywordList || '(none yet)'}

Generate ${count} NEW keyword ideas that we don't already cover. Focus on:
1. **Seasonal/timely topics** — what people are searching for right now
2. **Emerging products** — new devices or product categories gaining traction
3. **Problem-solving queries** — specific issues people need help with
4. **Comparison opportunities** — products people are deciding between
5. **Long-tail opportunities** — specific, low-competition queries

For each keyword, classify it as:
- **best-for**: "Best [product] for [use case]" — commercial intent, these drive revenue
- **vs**: "[Product A] vs [Product B]" — comparison intent
- **info**: Informational/how-to — builds authority, lower competition

Output format — return ONLY valid YAML, no markdown code fences:

- type: best-for
  keyword: "best smart lock for renters"
  slug: "best-smart-lock-for-renters"
  category: "smart-locks"

- type: info
  keyword: "how to set up matter devices"
  slug: "how-to-set-up-matter-devices"
  category: "smart-hubs"

RULES:
- Slugs must be URL-friendly (lowercase, hyphens only)
- Do NOT include any of these existing slugs: ${existingSlugs.join(', ') || '(none)'}
- Prioritize keywords with commercial or high-intent search volume
- Mix the types: ~40% best-for, ~25% vs, ~35% info
- Categories can be existing (${categoryList}) or new ones if the topic demands it
- Do NOT include product IDs or affiliate tags`;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  const { topic, count, dryRun } = parseArgs();

  console.log('\n🔍 Trend Research');
  console.log('─'.repeat(50));

  const existingKeywords = loadExistingKeywords();
  const products = loadProducts();
  const categories = loadCategories();

  console.log(`Existing keywords: ${existingKeywords.length}`);
  console.log(`Products in database: ${products.length}`);
  console.log(`Target: ~${count} new keywords`);
  if (topic) console.log(`Focus topic: "${topic}"`);
  console.log('');

  // Load configurable system prompt from content-engine.json
  let engineConfig = {};
  if (fs.existsSync(ENGINE_FILE)) {
    try { engineConfig = JSON.parse(fs.readFileSync(ENGINE_FILE, 'utf-8')); } catch {}
  }
  const system = engineConfig.trendResearch?.systemPrompt ||
    `You are an expert SEO keyword researcher specializing in smart home and consumer electronics. You generate practical, search-optimized keyword ideas that real people search for. Always return valid YAML.`;

  const prompt = buildResearchPrompt(existingKeywords, products, categories, topic, count);

  console.log('Researching trending topics via Claude...\n');

  const result = await generateWithRetry({
    system,
    prompt,
    maxTokens: 4000,
    model: engineConfig.model || undefined,
    apiKey: engineConfig.apiKey || undefined,
    usageFile: USAGE_FILE,
  });

  // Parse the YAML result — handle cases where Claude adds preamble text
  let yamlContent = result.replace(/```ya?ml\n?/g, '').replace(/```\n?/g, '');

  // Extract just the YAML array portion (starts with "- type:")
  const yamlStart = yamlContent.indexOf('- type:');
  if (yamlStart > 0) {
    yamlContent = yamlContent.substring(yamlStart);
  }

  let newKeywords;
  try {
    newKeywords = yaml.load(yamlContent);
  } catch (parseError) {
    console.error('Failed to parse generated YAML. Saving raw output for review.');
    const rawPath = path.join(site.dataDir, 'trend-research-raw.txt');
    fs.writeFileSync(rawPath, result, 'utf-8');
    console.error(`Raw output saved to: ${rawPath}`);
    process.exit(1);
  }

  if (!Array.isArray(newKeywords)) {
    // Last resort: try to find any YAML array in the content
    console.error('Generated content is not a YAML array. Saving raw output for review.');
    const rawPath = path.join(site.dataDir, 'trend-research-raw.txt');
    fs.writeFileSync(rawPath, result, 'utf-8');
    console.error(`Raw output saved to: ${rawPath}`);
    process.exit(1);
  }

  // Deduplicate against existing keywords
  const existingSlugs = new Set(existingKeywords.map((k) => k.slug));
  const dedupedKeywords = newKeywords.filter((k) => {
    if (!k.slug || !k.keyword || !k.type) return false;
    return !existingSlugs.has(k.slug);
  });

  const duplicates = newKeywords.length - dedupedKeywords.length;

  // Summary
  const bestFor = dedupedKeywords.filter((k) => k.type === 'best-for');
  const vs = dedupedKeywords.filter((k) => k.type === 'vs');
  const info = dedupedKeywords.filter((k) => k.type === 'info');

  console.log(`Generated ${newKeywords.length} keywords, ${duplicates} duplicates removed`);
  console.log(`New keywords to add: ${dedupedKeywords.length}`);
  console.log(`  Best-for: ${bestFor.length}`);
  console.log(`  VS: ${vs.length}`);
  console.log(`  Info: ${info.length}`);
  console.log('');

  // Print all new keywords
  dedupedKeywords.forEach((k) => {
    console.log(`  [${k.type}] ${k.keyword}`);
  });

  if (dryRun) {
    console.log('\nDRY RUN — no changes saved.');
    return;
  }

  if (dedupedKeywords.length === 0) {
    console.log('No new keywords to add.');
    return;
  }

  // Append to keywords.yaml
  const separator = `\n# ─── Trend Research (${new Date().toISOString().split('T')[0]}) ───\n\n`;
  const newYaml = yaml.dump(dedupedKeywords, { lineWidth: -1, quotingType: '"', forceQuotes: true });

  fs.appendFileSync(KEYWORDS_FILE, separator + newYaml, 'utf-8');

  console.log(`\n✅ Appended ${dedupedKeywords.length} keywords to keywords.yaml`);
  console.log(`Total keywords now: ${existingKeywords.length + dedupedKeywords.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
