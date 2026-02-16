import { Router } from 'express';
import path from 'path';
import { readJson, writeJson } from '../lib/data.js';
import { getActiveSite, getAllSites } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { productsPage } from '../views/products.js';

const router = Router();

router.get('/products', (req, res) => {
  const site = getActiveSite(req.query.site || null);
  const sites = getAllSites();
  const productsData = readJson(path.join(site.dataDir, 'products.json'));
  const products = productsData.products || [];
  const message = req.query.msg || null;

  const content = productsPage({ products, message });
  res.send(layout('Products', content, {
    activePage: 'products',
    siteName: site.config.name,
    sites,
  }));
});

// Add a product
router.post('/products', (req, res) => {
  const site = getActiveSite(null);
  const prodFile = path.join(site.dataDir, 'products.json');
  const productsData = readJson(prodFile);
  if (!productsData.products) productsData.products = [];

  const { name, brand, category, price, rating, asin } = req.body;
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  productsData.products.push({
    id,
    name,
    brand,
    category,
    price: parseFloat(price) || 0,
    rating: parseFloat(rating) || 4.0,
    reviewCount: 0,
    asin: asin || '',
    specs: {},
    pros: [],
    cons: [],
  });

  writeJson(prodFile, productsData);
  res.redirect('/products?msg=Product added: ' + encodeURIComponent(name));
});

export default router;
