/**
 * Site manager for the dashboard
 * Wraps resolve-site.js and adds dashboard-specific helpers
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { resolveSite, listSites, createSite } from '../../scripts/resolve-site.js';

const ROOT = path.resolve(import.meta.dirname, '../..');

export function getActiveSite(siteId = null) {
  return resolveSite({ siteId: siteId || null });
}

export function getAllSites() {
  return listSites();
}

export function createNewSite(id, config) {
  return createSite(id, config);
}

export function getSiteStats(site) {
  const stats = {
    articles: { total: 0, bestFor: 0, vs: 0, info: 0 },
    keywords: { total: 0, withArticles: 0, pending: 0 },
    products: { total: 0 },
    totalWords: 0,
  };

  // Count articles
  if (fs.existsSync(site.contentDir)) {
    const files = fs.readdirSync(site.contentDir).filter(f => f.endsWith('.md'));
    stats.articles.total = files.length;

    for (const file of files) {
      const raw = fs.readFileSync(path.join(site.contentDir, file), 'utf-8');
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        if (raw.includes('type: "best-for"') || raw.includes("type: 'best-for'") || raw.includes('type: best-for')) stats.articles.bestFor++;
        else if (raw.includes('type: "vs"') || raw.includes("type: 'vs'") || raw.includes('type: vs')) stats.articles.vs++;
        else if (raw.includes('type: "info"') || raw.includes("type: 'info'") || raw.includes('type: info')) stats.articles.info++;
      }
      const content = raw.replace(/^---\n[\s\S]*?\n---\n*/, '');
      stats.totalWords += content.split(/\s+/).filter(Boolean).length;
    }
  }

  // Count keywords
  const kwFile = path.join(site.dataDir, 'keywords.yaml');
  if (fs.existsSync(kwFile)) {
    try {
      const kwData = yaml.load(fs.readFileSync(kwFile, 'utf-8')) || [];
      stats.keywords.total = kwData.length;
    } catch (e) {}
  }

  // Count products
  const prodFile = path.join(site.dataDir, 'products.json');
  if (fs.existsSync(prodFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(prodFile, 'utf-8'));
      stats.products.total = data.products?.length || 0;
    } catch (e) {}
  }

  return stats;
}

export { ROOT };
