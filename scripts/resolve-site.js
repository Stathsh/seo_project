/**
 * Site Resolution Module
 *
 * Resolves which site to use based on:
 * 1. --site <id> CLI arg
 * 2. ACTIVE_SITE env var
 * 3. If sites/ directory exists → use _default
 * 4. Legacy fallback → data/ and src/content/articles/
 *
 * Returns: { id, config, dataDir, contentDir, outputDir, isLegacy }
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITES_DIR = path.join(ROOT, 'sites');

export function resolveSite(options = {}) {
  // 1. Check --site CLI arg
  let siteId = options.siteId || null;
  if (!siteId) {
    const args = process.argv.slice(2);
    const siteIdx = args.indexOf('--site');
    if (siteIdx !== -1 && args[siteIdx + 1]) {
      siteId = args[siteIdx + 1];
    }
  }

  // 2. Check ACTIVE_SITE env var
  if (!siteId) {
    siteId = process.env.ACTIVE_SITE || null;
  }

  // 3. If sites/ exists and no explicit ID, use _default
  if (!siteId && fs.existsSync(SITES_DIR)) {
    const dirs = fs.readdirSync(SITES_DIR).filter(d =>
      fs.statSync(path.join(SITES_DIR, d)).isDirectory()
    );
    if (dirs.includes('_default')) {
      siteId = '_default';
    }
  }

  // 4. Legacy fallback
  if (!siteId) {
    return {
      id: '_legacy',
      config: loadLegacyConfig(),
      dataDir: path.join(ROOT, 'data'),
      contentDir: path.join(ROOT, 'src', 'content', 'articles'),
      outputDir: path.join(ROOT, 'dist'),
      isLegacy: true,
    };
  }

  // Load site from sites/<id>/
  const siteDir = path.join(SITES_DIR, siteId);
  if (!fs.existsSync(siteDir)) {
    console.error(`Site "${siteId}" not found at ${siteDir}`);
    process.exit(1);
  }

  const configPath = path.join(siteDir, 'site.json');
  if (!fs.existsSync(configPath)) {
    console.error(`Missing site.json for site "${siteId}" at ${configPath}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  return {
    id: siteId,
    config,
    dataDir: path.join(siteDir, 'data'),
    contentDir: path.join(siteDir, 'content', 'articles'),
    outputDir: path.join(ROOT, 'dist', siteId === '_default' ? '' : siteId),
    isLegacy: false,
  };
}

function loadLegacyConfig() {
  return {
    id: '_legacy',
    name: process.env.SITE_NAME || 'SmartHomePicks',
    url: process.env.SITE_URL || 'https://yourdomain.com',
    author: {
      name: 'Alex Chen',
      title: 'Smart Home Editor',
      bio: "Alex has been testing and reviewing smart home devices for over 5 years. He's personally installed 50+ security cameras, tested every major smart speaker, and automated his entire home. When he's not geeking out over the latest Matter-compatible gadget, he's probably adjusting his smart thermostat schedule for the tenth time this week.",
      initials: 'AC',
    },
    affiliateTag: process.env.AMAZON_AFFILIATE_TAG || 'YOURTAG-20',
    branding: {
      heroTitle: 'Smart home advice you can <span class="text-brand-600">actually trust</span>',
      heroDescription: "We test and compare smart home devices so you don't waste money on the wrong one. No corporate fluff — just honest opinions from someone who's installed it all.",
      footerDescription: 'Expert smart home reviews and comparisons to help you build a smarter, more connected home.',
    },
    navigation: [
      { label: 'Security Cameras', href: '/security-cameras/' },
      { label: 'Thermostats', href: '/smart-thermostats/' },
      { label: 'Smart Speakers', href: '/smart-speakers/' },
      { label: 'Doorbells', href: '/smart-doorbells/' },
      { label: 'Lighting', href: '/smart-lighting/' },
    ],
    heroCTAs: [
      { label: 'Security Cameras', href: '/security-cameras/', primary: true },
      { label: 'Smart Thermostats', href: '/smart-thermostats/' },
      { label: 'Smart Speakers', href: '/smart-speakers/' },
    ],
  };
}

/** List all available sites */
export function listSites() {
  const sites = [];

  if (!fs.existsSync(SITES_DIR)) return sites;

  const dirs = fs.readdirSync(SITES_DIR).filter(d =>
    fs.statSync(path.join(SITES_DIR, d)).isDirectory()
  );

  for (const dir of dirs) {
    const configPath = path.join(SITES_DIR, dir, 'site.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      sites.push({ id: dir, config });
    }
  }

  return sites;
}

/** Create a new site scaffold */
export function createSite(id, config) {
  const siteDir = path.join(SITES_DIR, id);

  if (fs.existsSync(siteDir)) {
    throw new Error(`Site "${id}" already exists`);
  }

  // Create directory structure
  fs.mkdirSync(path.join(siteDir, 'data'), { recursive: true });
  fs.mkdirSync(path.join(siteDir, 'content', 'articles'), { recursive: true });

  // Write site config
  fs.writeFileSync(
    path.join(siteDir, 'site.json'),
    JSON.stringify(config, null, 2),
    'utf-8'
  );

  // Create empty data files
  fs.writeFileSync(
    path.join(siteDir, 'data', 'keywords.yaml'),
    '# Keywords for ' + config.name + '\n',
    'utf-8'
  );
  fs.writeFileSync(
    path.join(siteDir, 'data', 'products.json'),
    JSON.stringify({ products: [] }, null, 2),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(siteDir, 'data', 'categories.json'),
    JSON.stringify({ categories: [] }, null, 2),
    'utf-8'
  );

  return siteDir;
}
