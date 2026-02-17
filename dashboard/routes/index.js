import { Router } from 'express';
import path from 'path';
import { readJson, listMarkdownFiles } from '../lib/data.js';
import { getActiveSite, getAllSites } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { homePage } from '../views/home.js';

const router = Router();

router.get('/', (req, res) => {
  const siteId = req.query.site || process.env.ACTIVE_SITE || null;
  const site = getActiveSite(siteId);
  const sites = getAllSites();

  const productsData = readJson(path.join(site.dataDir, 'products.json'));
  const products = productsData.products || [];
  const articles = listMarkdownFiles(site.contentDir);
  const totalWords = articles.reduce((sum, a) => sum + (a.wordCount || 0), 0);

  const content = homePage({ articles, products, totalWords, siteName: site.config.name });
  res.send(layout('Overview', content, {
    activePage: 'home',
    siteName: site.config.name,
    sites,
  }));
});

export default router;
