import { Router } from 'express';
import path from 'path';
import { readJson, writeJson, listMarkdownFiles } from '../lib/data.js';
import { getActiveSite, getAllSites } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { homePage } from '../views/home.js';

const router = Router();

function getQuicklinksPath(site) {
  return path.join(site.dataDir, 'quicklinks.json');
}

function loadQuicklinks(site) {
  const data = readJson(getQuicklinksPath(site));
  return data.links || [];
}

router.get('/', (req, res) => {
  const siteId = req.query.site || process.env.ACTIVE_SITE || null;
  const site = getActiveSite(siteId);
  const sites = getAllSites();

  const productsData = readJson(path.join(site.dataDir, 'products.json'));
  const products = productsData.products || [];
  const articles = listMarkdownFiles(site.contentDir);
  const totalWords = articles.reduce((sum, a) => sum + (a.wordCount || 0), 0);
  const quicklinks = loadQuicklinks(site);

  const content = homePage({ articles, products, totalWords, siteName: site.config.name, quicklinks });
  res.send(layout('Overview', content, {
    activePage: 'home',
    siteName: site.config.name,
    sites,
  }));
});

router.post('/quicklinks/add', (req, res) => {
  const siteId = req.query.site || process.env.ACTIVE_SITE || null;
  const site = getActiveSite(siteId);
  const { name, url } = req.body;

  if (!name || !url) {
    return res.redirect('/');
  }

  const links = loadQuicklinks(site);
  links.push({ name: name.trim(), url: url.trim() });
  writeJson(getQuicklinksPath(site), { links });

  res.redirect('/');
});

router.post('/quicklinks/delete', (req, res) => {
  const siteId = req.query.site || process.env.ACTIVE_SITE || null;
  const site = getActiveSite(siteId);
  const index = parseInt(req.body.index, 10);

  const links = loadQuicklinks(site);
  if (index >= 0 && index < links.length) {
    links.splice(index, 1);
    writeJson(getQuicklinksPath(site), { links });
  }

  res.redirect('/');
});

export default router;
