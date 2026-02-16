import { Router } from 'express';
import { spawn } from 'child_process';
import { getActiveSite, getAllSites, ROOT } from '../lib/site-manager.js';
import { layout } from '../views/layout.js';
import { buildPage } from '../views/build.js';

const router = Router();
let lastBuildStatus = null;

router.get('/build', (req, res) => {
  const site = getActiveSite(req.query.site || null);
  const sites = getAllSites();

  const content = buildPage({
    buildStatus: lastBuildStatus,
    siteName: site.config.name,
    siteId: site.id,
  });
  res.send(layout('Build', content, {
    activePage: 'build',
    siteName: site.config.name,
    sites,
  }));
});

// Trigger a build
router.post('/build', (req, res) => {
  const site = getActiveSite(null);
  const env = { ...process.env };
  if (!site.isLegacy) {
    env.ACTIVE_SITE = site.id;
  }

  let output = '';
  const child = spawn('npx', ['astro', 'build'], { cwd: ROOT, env, shell: true });

  child.stdout.on('data', (data) => { output += data.toString(); });
  child.stderr.on('data', (data) => { output += data.toString(); });

  child.on('close', (code) => {
    lastBuildStatus = {
      success: code === 0,
      message: code === 0 ? 'Build completed successfully!' : `Build failed with exit code ${code}`,
      log: output,
      timestamp: new Date().toISOString(),
    };
    res.redirect('/build');
  });

  child.on('error', (err) => {
    lastBuildStatus = {
      success: false,
      message: 'Build failed: ' + err.message,
      log: output,
      timestamp: new Date().toISOString(),
    };
    res.redirect('/build');
  });
});

export default router;
