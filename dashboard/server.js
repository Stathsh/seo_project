#!/usr/bin/env node

/**
 * SEO Dashboard Server
 *
 * Usage: npm run dashboard
 * Opens at: http://localhost:3456
 */

import 'dotenv/config';
import express from 'express';
import { sessionMiddleware, requireAuth } from './lib/auth.js';
import authRoutes from './routes/auth.js';
import indexRoutes from './routes/index.js';
import contentRoutes from './routes/content.js';
import sitesRoutes from './routes/sites.js';
import templatesRoutes from './routes/templates.js';

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3456;

// Body parsing
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

// Session & auth
app.use(sessionMiddleware());
app.use(requireAuth);

// Routes
app.use(authRoutes);
app.use(indexRoutes);
app.use(contentRoutes);
app.use(sitesRoutes);
app.use(templatesRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`\n  SEO Dashboard running at http://localhost:${PORT}\n`);
});
