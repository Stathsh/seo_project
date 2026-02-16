import { Router } from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { readYaml, writeYaml, listMarkdownFiles } from '../lib/data.js';
import { getActiveSite, getAllSites, ROOT } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { keywordsPage } from '../views/keywords.js';

const router = Router();

router.get('/keywords', (req, res) => {
  const site = getActiveSite(req.query.site || null);
  const sites = getAllSites();
  const keywords = readYaml(path.join(site.dataDir, 'keywords.yaml')) || [];
  const articles = listMarkdownFiles(site.contentDir);
  const message = req.query.msg || null;

  const content = keywordsPage({ keywords, articles, message });
  res.send(layout('Keywords', content, {
    activePage: 'keywords',
    siteName: site.config.name,
    sites,
  }));
});

// Add a keyword
router.post('/keywords', (req, res) => {
  const site = getActiveSite(null);
  const kwFile = path.join(site.dataDir, 'keywords.yaml');
  const keywords = readYaml(kwFile) || [];

  const { keyword, slug, type, category } = req.body;
  const newSlug = slug || keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  keywords.push({
    type,
    keyword,
    slug: newSlug,
    category,
  });

  writeYaml(kwFile, keywords);
  res.redirect('/keywords?msg=Keyword added: ' + encodeURIComponent(keyword));
});

// Generate content for a single keyword
router.post('/keywords/generate', (req, res) => {
  const site = getActiveSite(null);
  const { keyword, force } = req.body;
  const args = ['scripts/generate-content.js', '--keyword', keyword];
  if (force) args.push('--force');

  const env = { ...process.env };
  if (!site.isLegacy) {
    env.ACTIVE_SITE = site.id;
  }

  const child = spawn('node', args, { cwd: ROOT, env });
  child.on('close', () => {
    res.redirect('/keywords?msg=Generation triggered for: ' + encodeURIComponent(keyword));
  });
  child.on('error', () => {
    res.redirect('/keywords?msg=Generation failed for: ' + encodeURIComponent(keyword));
  });
});

// Generate all pending keywords
router.post('/keywords/generate-all', (req, res) => {
  const site = getActiveSite(null);
  const env = { ...process.env };
  if (!site.isLegacy) {
    env.ACTIVE_SITE = site.id;
  }

  const child = spawn('node', ['scripts/generate-content.js'], { cwd: ROOT, env });
  child.on('close', () => {
    res.redirect('/keywords?msg=Batch generation complete');
  });
  child.on('error', () => {
    res.redirect('/keywords?msg=Batch generation failed');
  });
});

export default router;
