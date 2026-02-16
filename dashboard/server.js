#!/usr/bin/env node

/**
 * SEO Dashboard Server
 *
 * Usage: npm run dashboard
 * Opens at: http://localhost:3456
 */

import express from 'express';
import indexRoutes from './routes/index.js';
import articlesRoutes from './routes/articles.js';
import keywordsRoutes from './routes/keywords.js';
import productsRoutes from './routes/products.js';
import sitesRoutes from './routes/sites.js';
import buildRoutes from './routes/build.js';

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3456;

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use(indexRoutes);
app.use(articlesRoutes);
app.use(keywordsRoutes);
app.use(productsRoutes);
app.use(sitesRoutes);
app.use(buildRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`\n  SEO Dashboard running at http://localhost:${PORT}\n`);
});
