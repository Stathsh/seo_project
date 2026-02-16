#!/usr/bin/env node

/**
 * Keyword Research Helper
 *
 * Usage:
 *   npm run keywords "smart home security"
 *   npm run keywords "robot vacuums"
 *
 * Generates 50-100 long-tail keyword ideas organized by page type,
 * then outputs them in the seed file format.
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

function loadProducts() {
  const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  return JSON.parse(raw).products;
}

async function main() {
  const seedTopic = process.argv.slice(2).join(' ').trim();

  if (!seedTopic) {
    console.error('Usage: npm run keywords "seed topic"');
    console.error('Example: npm run keywords "smart home security"');
    process.exit(1);
  }

  console.log(`\n🔍 Brainstorming keywords for: "${seedTopic}"`);
  console.log('─'.repeat(50));

  const products = loadProducts();
  const productNames = products.map((p) => `${p.name} (${p.brand})`).join(', ');

  const system = `You are an expert SEO keyword researcher specializing in smart home and consumer electronics content. You understand:
- Search intent (informational, commercial, transactional)
- Long-tail keyword targeting for programmatic SEO
- "People Also Ask" style queries
- Low-competition keyword opportunities

Your job is to generate keyword ideas that a smart home review site can target with programmatic content.`;

  const prompt = `Generate keyword ideas for the topic: "${seedTopic}"

Available products on our site: ${productNames}

Generate keywords organized into three categories. For each keyword, include a suggested slug and the most relevant category from: security-cameras, smart-thermostats, smart-speakers, smart-lighting, smart-doorbells, robot-vacuums, smart-plugs, smart-hubs.

Categories:
1. **best-for** (15-20 keywords): "Best [product] for [use case]" patterns targeting commercial intent
2. **vs** (10-15 keywords): "[Product A] vs [Product B]" comparison queries
3. **info** (20-30 keywords): Informational/how-to queries that build topical authority

Output format — return ONLY valid YAML, no markdown code fences. Use this exact structure for each entry:

- type: best-for
  keyword: "best security camera for apartments"
  slug: "best-security-camera-for-apartments"
  category: "security-cameras"

- type: vs
  keyword: "ring vs arlo"
  slug: "ring-vs-arlo"
  category: "security-cameras"

- type: info
  keyword: "do security cameras work without wifi"
  slug: "do-security-cameras-work-without-wifi"
  category: "security-cameras"

IMPORTANT:
- Keywords should be realistic search queries people actually type
- Focus on long-tail, low-competition opportunities
- Slugs should be URL-friendly (lowercase, hyphens, no special chars)
- Don't include product IDs or affiliate tags — those are added later
- Generate at least 50 total keywords`;

  try {
    console.log('Calling Claude API...\n');
    const result = await generateWithRetry({
      system,
      prompt,
      maxTokens: 6000,
    });

    // Extract YAML content
    let yamlContent = result;
    // Remove potential markdown fences
    yamlContent = yamlContent.replace(/```ya?ml\n?/g, '').replace(/```\n?/g, '');

    // Validate it parses as YAML
    let keywords;
    try {
      keywords = yaml.load(yamlContent);
    } catch (parseError) {
      console.error('Failed to parse generated YAML. Raw output saved to data/keywords-new-raw.txt');
      fs.writeFileSync(path.join(site.dataDir, 'keywords-new-raw.txt'), result, 'utf-8');
      return;
    }

    if (!Array.isArray(keywords)) {
      console.error('Generated content is not a YAML array.');
      return;
    }

    // Show summary
    const bestFor = keywords.filter((k) => k.type === 'best-for');
    const vs = keywords.filter((k) => k.type === 'vs');
    const info = keywords.filter((k) => k.type === 'info');

    console.log(`Generated ${keywords.length} keywords:`);
    console.log(`  📦 Best-for: ${bestFor.length}`);
    console.log(`  ⚔️  VS: ${vs.length}`);
    console.log(`  ℹ️  Info: ${info.length}`);

    // Write to a new file (don't overwrite existing)
    const outputFile = path.join(site.dataDir, 'keywords-generated.yaml');
    const yamlOutput = yaml.dump(keywords, { lineWidth: -1, quotingType: '"', forceQuotes: true });
    fs.writeFileSync(outputFile, `# Generated keywords for: ${seedTopic}\n# Date: ${new Date().toISOString()}\n# Review and merge into keywords.yaml\n\n${yamlOutput}`, 'utf-8');
    console.log(`\n✅ Saved to: data/keywords-generated.yaml`);
    console.log('Review the file and merge the keywords you want into data/keywords.yaml');

    // Print preview
    console.log('\nPreview (first 10):');
    keywords.slice(0, 10).forEach((k) => {
      console.log(`  [${k.type}] ${k.keyword}`);
    });
    if (keywords.length > 10) {
      console.log(`  ... and ${keywords.length - 10} more`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
