import { Router } from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { readYaml, writeYaml, readJson, writeJson, listMarkdownFiles } from '../lib/data.js';
import { getActiveSite, getAllSites, ROOT } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { contentPage } from '../views/content.js';

const router = Router();

// ─── Main content page ──────────────────────────────────────

router.get('/content', (req, res) => {
  const site = getActiveSite(req.query.site || null);
  const sites = getAllSites();
  const articles = listMarkdownFiles(site.contentDir);
  const keywords = readYaml(path.join(site.dataDir, 'keywords.yaml')) || [];
  const productsData = readJson(path.join(site.dataDir, 'products.json'));
  const products = productsData.products || [];
  const activeTab = req.query.tab || 'articles';
  const message = req.query.msg || null;

  const content = contentPage({ articles, keywords, products, activeTab, message });
  res.send(layout('Content', content, {
    activePage: 'content',
    siteName: site.config.name,
    sites,
  }));
});

// ─── Redirects for old routes ───────────────────────────────

router.get('/articles', (req, res) => res.redirect('/content?tab=articles'));
router.get('/keywords', (req, res) => res.redirect('/content?tab=keywords'));
router.get('/products', (req, res) => res.redirect('/content?tab=products'));

// ─── Keywords actions ───────────────────────────────────────

router.post('/content/keywords', (req, res) => {
  const site = getActiveSite(null);
  const kwFile = path.join(site.dataDir, 'keywords.yaml');
  const keywords = readYaml(kwFile) || [];

  const { keyword, slug, type, category } = req.body;
  const newSlug = slug || keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  keywords.push({ type, keyword, slug: newSlug, category });
  writeYaml(kwFile, keywords);
  res.redirect('/content?tab=keywords&msg=Keyword added: ' + encodeURIComponent(keyword));
});

router.post('/content/keywords/generate', (req, res) => {
  const site = getActiveSite(null);
  const { keyword, force } = req.body;
  const args = ['scripts/generate-content.js', '--keyword', keyword];
  if (force) args.push('--force');

  const env = { ...process.env };
  if (!site.isLegacy) env.ACTIVE_SITE = site.id;

  const child = spawn('node', args, { cwd: ROOT, env });
  child.on('close', () => {
    res.redirect('/content?tab=keywords&msg=Generation triggered for: ' + encodeURIComponent(keyword));
  });
  child.on('error', () => {
    res.redirect('/content?tab=keywords&msg=Generation failed for: ' + encodeURIComponent(keyword));
  });
});

router.post('/content/keywords/generate-all', (req, res) => {
  const site = getActiveSite(null);
  const env = { ...process.env };
  if (!site.isLegacy) env.ACTIVE_SITE = site.id;

  const child = spawn('node', ['scripts/generate-content.js'], { cwd: ROOT, env });
  child.on('close', () => {
    res.redirect('/content?tab=keywords&msg=Batch generation complete');
  });
  child.on('error', () => {
    res.redirect('/content?tab=keywords&msg=Batch generation failed');
  });
});

// ─── Products actions ───────────────────────────────────────

router.post('/content/products', (req, res) => {
  const site = getActiveSite(null);
  const prodFile = path.join(site.dataDir, 'products.json');
  const productsData = readJson(prodFile);
  if (!productsData.products) productsData.products = [];

  const { name, brand, category, price, rating, asin } = req.body;
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  productsData.products.push({
    id, name, brand, category,
    price: parseFloat(price) || 0,
    rating: parseFloat(rating) || 4.0,
    reviewCount: 0,
    asin: asin || '',
    specs: {},
    pros: [],
    cons: [],
  });

  writeJson(prodFile, productsData);
  res.redirect('/content?tab=products&msg=Product added: ' + encodeURIComponent(name));
});

export default router;
