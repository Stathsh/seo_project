import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getActiveSite, getAllSites } from '../lib/site-manager.js';
import { getAllTemplates, getTemplateById, getActiveTemplateId } from '../lib/templates.js';
import { layout } from '../views/layout.js';
import { templatesPage } from '../views/templates.js';
import { templatePreviewPage } from '../views/template-preview.js';

const router = Router();

router.get('/templates', (req, res) => {
  const site = getActiveSite(req.query.site || null);
  const sites = getAllSites();
  const templates = getAllTemplates();
  const activeTemplateId = getActiveTemplateId(site.dataDir);
  const message = req.query.msg || null;

  const content = templatesPage({ templates, activeTemplateId, message });
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

router.post('/templates/apply/:id', (req, res) => {
  const template = getTemplateById(req.params.id);
  if (!template) {
    return res.redirect('/templates?msg=' + encodeURIComponent('Template not found'));
  }

  const site = getActiveSite(null);

  // Build theme.json from template
  const themeData = {
    id: template.id,
    name: template.name,
    colors: template.colors,
    fonts: template.fonts,
    layout: template.layout,
  };

  // Write theme.json to the site directory (one level up from dataDir)
  const themePath = path.join(site.dataDir, '..', 'theme.json');
  fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2) + '\n');

  res.redirect('/templates?msg=' + encodeURIComponent(`Template "${template.name}" applied! Go to Build to rebuild your site.`));
});

export default router;
