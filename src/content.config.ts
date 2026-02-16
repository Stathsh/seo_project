import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import fs from 'fs';
import path from 'path';

function resolveContentBase(): string {
  const siteId = process.env.ACTIVE_SITE;
  if (siteId) {
    const sitePath = `./sites/${siteId}/content/articles`;
    if (fs.existsSync(sitePath)) return sitePath;
  }
  // Try _default site
  const defaultPath = './sites/_default/content/articles';
  if (fs.existsSync(defaultPath)) return defaultPath;
  // Legacy fallback
  return './src/content/articles';
}

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: resolveContentBase() }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    category: z.string(),
    type: z.enum(['best-for', 'vs', 'info']),
    datePublished: z.string(),
    dateModified: z.string(),
    products: z.array(z.object({
      id: z.string(),
      name: z.string(),
      brand: z.string().optional(),
      price: z.number().optional(),
      rating: z.number().optional(),
      reviewCount: z.number().optional(),
      asin: z.string().optional(),
      affiliateTag: z.string().optional(),
      specs: z.record(z.string()).optional(),
      pros: z.array(z.string()).optional(),
      cons: z.array(z.string()).optional(),
      badge: z.string().optional(),
    })).optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
    relatedSlugs: z.array(z.string()).optional(),
  }),
});

export const collections = { articles };
