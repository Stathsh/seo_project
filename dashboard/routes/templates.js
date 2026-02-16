import { Router } from 'express';
import { getActiveSite, getAllSites } from '../lib/site-manager.js';
import { getAllTemplates, getTemplateById } from '../lib/templates.js';
import { layout } from '../views/layout.js';
import { templatesPage } from '../views/templates.js';
import { templatePreviewPage } from '../views/template-preview.js';

const router = Router();

router.get('/templates', (req, res) => {
  const site = getActiveSite(req.query.site || null);
  const sites = getAllSites();
  const templates = getAllTemplates();

  const content = templatesPage({ templates });
  res.send(layout('Templates', content, {
    activePage: 'templates',
    siteName: site.config.name,
    sites,
  }));
});

router.get('/templates/preview/:id', (req, res) => {
  const template = getTemplateById(req.params.id);
  if (!template) {
    return res.status(404).send('Template not found');
  }
  res.send(templatePreviewPage(template));
});

export default router;
