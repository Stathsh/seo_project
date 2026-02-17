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
  const activeTab = req.query.tab || 'articles';
  const message = req.query.msg || null;

  const content = contentPage({ articles, keywords, products, engineConfig, activeTab, message });
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

  keywords.push({ type, keyword, slug: newSlug, category, dateAdded: new Date().toISOString().split('T')[0] });
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

// ─── Autopublish actions ─────────────────────────────────────

router.post('/content/autopublish/run', (req, res) => {
  const site = getActiveSite(null);
  const engineFile = path.join(site.dataDir, 'content-engine.json');
  const engineConfig = readJson(engineFile);
  const count = engineConfig.schedule?.articlesPerRun || engineConfig.schedule?.amount || 1;

  const env = { ...process.env };
  if (!site.isLegacy) env.ACTIVE_SITE = site.id;

  // --force bypasses the schedule.enabled check (manual override)
  const child = spawn('node', ['scripts/autopublish.js', '--count', String(count), '--force'], { cwd: ROOT, env });
  child.on('close', (code) => {
    const msg = code === 0
      ? `Article generation complete (${count} requested)`
      : 'Article generation failed';
    res.redirect('/content?tab=engine&msg=' + encodeURIComponent(msg));
  });
  child.on('error', () => {
    res.redirect('/content?tab=engine&msg=' + encodeURIComponent('Article generation failed to start'));
  });
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

router.post('/content/trend-prompts/save', (req, res) => {
  const site = getActiveSite(null);
  const engineFile = path.join(site.dataDir, 'content-engine.json');
  const existing = readJson(engineFile);

  if (!existing.trendResearch) existing.trendResearch = {};
  if (!Array.isArray(existing.trendResearch.prompts)) existing.trendResearch.prompts = [];

  const { promptId, promptName, promptText } = req.body;
  const name = (promptName || '').trim();
  const text = (promptText || '').trim();

  if (!name || !text) {
    return res.redirect('/content?tab=engine&msg=' + encodeURIComponent('Name and prompt text are required'));
  }

  if (promptId) {
    // Update existing prompt
    const idx = existing.trendResearch.prompts.findIndex(p => p.id === promptId);
    if (idx !== -1) {
      existing.trendResearch.prompts[idx].name = name;
      existing.trendResearch.prompts[idx].prompt = text;
    }
  } else {
    // Add new prompt
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    existing.trendResearch.prompts.push({ id, name, prompt: text });
    // Auto-activate if it's the first prompt
    if (existing.trendResearch.prompts.length === 1) {
      existing.trendResearch.activePromptId = id;
    }
  }

  writeJson(engineFile, existing);
  res.redirect('/content?tab=engine&msg=' + encodeURIComponent('Prompt saved'));
});

router.post('/content/trend-prompts/activate', (req, res) => {
  const site = getActiveSite(null);
  const engineFile = path.join(site.dataDir, 'content-engine.json');
  const existing = readJson(engineFile);

  if (!existing.trendResearch) existing.trendResearch = {};
  existing.trendResearch.activePromptId = req.body.promptId || null;

  writeJson(engineFile, existing);
  res.redirect('/content?tab=engine&msg=' + encodeURIComponent('Active prompt updated'));
});

router.post('/content/trend-prompts/delete', (req, res) => {
  const site = getActiveSite(null);
  const engineFile = path.join(site.dataDir, 'content-engine.json');
  const existing = readJson(engineFile);

  if (!existing.trendResearch) existing.trendResearch = {};
  if (!Array.isArray(existing.trendResearch.prompts)) existing.trendResearch.prompts = [];

  const { promptId } = req.body;
  existing.trendResearch.prompts = existing.trendResearch.prompts.filter(p => p.id !== promptId);

  // Clear activePromptId if the deleted prompt was active
  if (existing.trendResearch.activePromptId === promptId) {
    existing.trendResearch.activePromptId = existing.trendResearch.prompts[0]?.id || null;
  }

  writeJson(engineFile, existing);
  res.redirect('/content?tab=engine&msg=' + encodeURIComponent('Prompt deleted'));
});

// ─── Content Engine actions ──────────────────────────────────

router.post('/content/engine', (req, res) => {
  const site = getActiveSite(null);
  const engineFile = path.join(site.dataDir, 'content-engine.json');
  const existing = readJson(engineFile);

  // Compute articlesPerRun from the friendly schedule fields
  const frequency = req.body['schedule.frequency'] || existing.schedule?.frequency || 'daily';
  const amount = parseInt(req.body['schedule.amount'], 10) || existing.schedule?.amount || 1;
  // Enforce limits per frequency
  const maxAmounts = { hourly: 2, daily: 5, weekly: 20 };
  const clampedAmount = Math.min(amount, maxAmounts[frequency] || 5);

  const updated = {
    model: existing.model || 'claude-sonnet-4-20250514',
    maxTokens: existing.maxTokens || 4096,
    faqMaxTokens: existing.faqMaxTokens || 1500,
    apiKey: existing.apiKey || '',
    schedule: {
      enabled: req.body['schedule.enabled'] === 'on',
      frequency,
      amount: clampedAmount,
      articlesPerRun: clampedAmount,
      delayBetweenMs: 3000,
    },
    prompts: {
      base: req.body['prompts.base'] || existing.prompts?.base || '',
      'best-for': req.body['prompts.best-for'] || existing.prompts?.['best-for'] || '',
      vs: req.body['prompts.vs'] || existing.prompts?.vs || '',
      info: req.body['prompts.info'] || existing.prompts?.info || '',
      faq: req.body['prompts.faq'] || existing.prompts?.faq || '',
    },
  };

  // Preserve trendResearch settings
  if (existing.trendResearch) {
    updated.trendResearch = existing.trendResearch;
  }

  writeJson(engineFile, updated);
  res.redirect('/content?tab=engine&msg=Content engine settings saved');
});

export default router;
