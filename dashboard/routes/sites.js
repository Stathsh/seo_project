import { Router } from 'express';
import { getAllSites, createNewSite } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { sitesPage } from '../views/sites.js';

const router = Router();

router.get('/sites', (req, res) => {
  const sites = getAllSites();
  const message = req.query.msg || null;

  const content = sitesPage({ sites, message });
  res.send(layout('Sites', content, {
    activePage: 'sites',
    siteName: sites[0]?.config.name || 'No sites',
    sites,
  }));
});

// Create a new site
router.post('/sites', (req, res) => {
  const { id, name, url, authorName, authorTitle, affiliateTag, heroDescription } = req.body;

  const initials = authorName
    ? authorName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'XX';

  const config = {
    id,
    name,
    url,
    author: {
      name: authorName || 'Editor',
      title: authorTitle || 'Editor',
      bio: `${authorName || 'Our editor'} covers the latest products and trends in this space.`,
      initials,
    },
    affiliateTag: affiliateTag || 'YOURTAG-20',
    branding: {
      heroTitle: `Expert advice you can <span class="text-brand-600">actually trust</span>`,
      heroDescription: heroDescription || `Honest reviews and comparisons to help you make the right choice.`,
      footerDescription: `Expert reviews and buying guides from ${name}.`,
    },
    navigation: [],
    heroCTAs: [],
  };

  try {
    createNewSite(id, config);
    res.redirect('/sites?msg=Site created: ' + encodeURIComponent(name));
  } catch (err) {
    res.redirect('/sites?msg=Error: ' + encodeURIComponent(err.message));
  }
});

export default router;
