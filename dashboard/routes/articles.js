import { Router } from 'express';
import { listMarkdownFiles } from '../lib/data.js';
import { getActiveSite, getAllSites } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { articlesPage } from '../views/articles.js';

const router = Router();

router.get('/articles', (req, res) => {
  const site = getActiveSite(req.query.site || null);
  const sites = getAllSites();
  const articles = listMarkdownFiles(site.contentDir);

  const content = articlesPage({ articles });
  res.send(layout('Articles', content, {
    activePage: 'articles',
    siteName: site.config.name,
    sites,
  }));
});

export default router;
