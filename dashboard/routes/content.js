import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { readYaml, writeYaml, readJson, writeJson, listMarkdownFiles, readArticle, writeArticle } from '../lib/data.js';
import { getActiveSite, getAllSites, ROOT } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { contentPage } from '../views/content.js';
import { articleEditPage } from '../views/article-edit.js';

const router = Router();

// ─── Main content page ──────────────────────────────────────

router.get('/content', (req, res) => {
  const site = getActiveSite(req.query.site || null);
  const sites = getAllSites();
  const articles = listMarkdownFiles(site.contentDir);
  const keywords = readYaml(path.join(site.dataDir, 'keywords.yaml')) || [];
  const productsData = readJson(path.join(site.dataDir, 'products.json'));
  const products = productsData.products || [];
  const engineConfig = readJson(path.join(site.dataDir, 'content-engine.json'));
  const apiUsage = readJson(path.join(site.dataDir, 'api-usage.json'));
  const activeTab = req.query.tab || 'articles';
  const message = req.query.msg || null;

  const content = contentPage({ articles, keywords, products, engineConfig, activeTab, message, apiUsage });
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

// ─── Article actions ────────────────────────────────────────

router.get('/content/articles/:slug/edit', (req, res) => {
  const site = getActiveSite(null);
  const sites = getAllSites();
  const slug = req.params.slug;
  const filePath = path.join(site.contentDir, `${slug}.md`);
  const article = readArticle(filePath);

  if (!article) {
    return res.redirect('/content?tab=articles&msg=' + encodeURIComponent('Article not found'));
  }

  const categoriesData = readJson(path.join(site.dataDir, 'categories.json'));
  const categories = categoriesData.categories || [];
  const message = req.query.msg || null;

  const content = articleEditPage({ article, slug, categories, message });
  res.send(layout('Edit Article', content, {
    activePage: 'content',
    siteName: site.config.name,
    sites,
  }));
});

router.post('/content/articles/:slug/edit', (req, res) => {
  const site = getActiveSite(null);
  const slug = req.params.slug;
  const filePath = path.join(site.contentDir, `${slug}.md`);
  const existing = readArticle(filePath);

  if (!existing) {
    return res.redirect('/content?tab=articles&msg=' + encodeURIComponent('Article not found'));
  }

  const updatedFm = {
    ...existing.frontmatter,
    title: req.body.title || existing.frontmatter.title,
    description: req.body.description || existing.frontmatter.description,
    type: req.body.type || existing.frontmatter.type,
    category: req.body.category || existing.frontmatter.category,
    dateModified: new Date().toISOString().split('T')[0],
  };

  const updatedBody = req.body.body !== undefined ? req.body.body : existing.body;

  writeArticle(filePath, updatedFm, updatedBody);
  res.redirect(`/content/articles/${encodeURIComponent(slug)}/edit?msg=` + encodeURIComponent('Article saved'));
});

router.post('/content/articles/:slug/archive', (req, res) => {
  const site = getActiveSite(null);
  const slug = req.params.slug;
  const filePath = path.join(site.contentDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return res.redirect('/content?tab=articles&msg=' + encodeURIComponent('Article not found'));
  }

  const archiveDir = path.join(site.contentDir, 'archived');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  fs.renameSync(filePath, path.join(archiveDir, `${slug}.md`));
  res.redirect('/content?tab=articles&msg=' + encodeURIComponent(`Article "${slug}" archived`));
});

router.post('/content/articles/:slug/delete', (req, res) => {
  const site = getActiveSite(null);
  const slug = req.params.slug;
  const filePath = path.join(site.contentDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return res.redirect('/content?tab=articles&msg=' + encodeURIComponent('Article not found'));
  }

  fs.unlinkSync(filePath);
  res.redirect('/content?tab=articles&msg=' + encodeURIComponent(`Article "${slug}" deleted`));
});

// ─── Trend Research actions ─────────────────────────────────

router.post('/content/trend-research/run', (req, res) => {
  const site = getActiveSite(null);
  const env = { ...process.env };
  if (!site.isLegacy) env.ACTIVE_SITE = site.id;

  const child = spawn('node', ['scripts/trend-research.js'], { cwd: ROOT, env });
  child.on('close', (code) => {
    const engineFile = path.join(site.dataDir, 'content-engine.json');
    const existing = readJson(engineFile);
    if (!existing.trendResearch) existing.trendResearch = {};
    existing.trendResearch.lastRunDate = new Date().toISOString();
    writeJson(engineFile, existing);

    const msg = code === 0 ? 'Trend research complete' : 'Trend research failed';
    res.redirect('/content?tab=engine&msg=' + encodeURIComponent(msg));
  });
  child.on('error', () => {
    res.redirect('/content?tab=engine&msg=' + encodeURIComponent('Trend research failed to start'));
  });
});

router.post('/content/engine/trend-prompt', (req, res) => {
  const site = getActiveSite(null);
  const engineFile = path.join(site.dataDir, 'content-engine.json');
  const existing = readJson(engineFile);

  if (!existing.trendResearch) existing.trendResearch = {};
  existing.trendResearch.systemPrompt = req.body.trendSystemPrompt || '';

  writeJson(engineFile, existing);
  res.redirect('/content?tab=engine&msg=' + encodeURIComponent('Trend research prompt saved'));
});

// ─── Content Engine actions ──────────────────────────────────

router.post('/content/engine', (req, res) => {
  const site = getActiveSite(null);
  const engineFile = path.join(site.dataDir, 'content-engine.json');
  const existing = readJson(engineFile);

  const updated = {
    model: req.body.model || existing.model || 'claude-sonnet-4-20250514',
    maxTokens: parseInt(req.body.maxTokens, 10) || existing.maxTokens || 4096,
    faqMaxTokens: parseInt(req.body.faqMaxTokens, 10) || existing.faqMaxTokens || 1500,
    apiKey: req.body.apiKey !== undefined ? req.body.apiKey : (existing.apiKey || ''),
    schedule: {
      enabled: req.body['schedule.enabled'] === 'on',
      articlesPerRun: parseInt(req.body['schedule.articlesPerRun'], 10) || existing.schedule?.articlesPerRun || 1,
      delayBetweenMs: parseInt(req.body['schedule.delayBetweenMs'], 10) || existing.schedule?.delayBetweenMs || 2000,
    },
    prompts: {
      base: req.body['prompts.base'] || existing.prompts?.base || '',
      'best-for': req.body['prompts.best-for'] || existing.prompts?.['best-for'] || '',
      vs: req.body['prompts.vs'] || existing.prompts?.vs || '',
      info: req.body['prompts.info'] || existing.prompts?.info || '',
      faq: req.body['prompts.faq'] || existing.prompts?.faq || '',
    },
  };

  writeJson(engineFile, updated);
  res.redirect('/content?tab=engine&msg=Content engine settings saved');
});

export default router;
