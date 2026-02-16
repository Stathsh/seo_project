/**
 * Astro-side site config loader
 *
 * Loads the active site's configuration for use in layouts and components.
 * Resolution: ACTIVE_SITE env var → sites/_default → legacy hardcoded values
 */

import fs from 'fs';
import path from 'path';

export interface SiteConfig {
  id: string;
  name: string;
  url: string;
  author: {
    name: string;
    title: string;
    bio: string;
    initials: string;
  };
  affiliateTag: string;
  branding: {
    heroTitle: string;
    heroDescription: string;
    footerDescription: string;
    colors?: {
      brand?: Record<string, string>;
      accent?: Record<string, string>;
    };
  };
  navigation: Array<{ label: string; href: string }>;
  heroCTAs: Array<{ label: string; href: string; primary?: boolean }>;
}

let _cachedConfig: SiteConfig | null = null;

export function getSiteConfig(): SiteConfig {
  if (_cachedConfig) return _cachedConfig;

  const root = process.cwd();
  const siteId = process.env.ACTIVE_SITE || null;

  // Try loading from sites/ directory
  if (siteId) {
    const configPath = path.join(root, 'sites', siteId, 'site.json');
    if (fs.existsSync(configPath)) {
      _cachedConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return _cachedConfig!;
    }
  }

  // Try _default site
  const defaultPath = path.join(root, 'sites', '_default', 'site.json');
  if (fs.existsSync(defaultPath)) {
    _cachedConfig = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
    return _cachedConfig!;
  }

  // Legacy fallback
  _cachedConfig = {
    id: '_legacy',
    name: import.meta.env?.SITE_NAME || process.env.SITE_NAME || 'SmartHomeRanked',
    url: import.meta.env?.SITE_URL || process.env.SITE_URL || 'https://yourdomain.com',
    author: {
      name: 'Alex Chen',
      title: 'Smart Home Editor',
      bio: "Alex has been testing and reviewing smart home devices for over 5 years. He's personally installed 50+ security cameras, tested every major smart speaker, and automated his entire home. When he's not geeking out over the latest Matter-compatible gadget, he's probably adjusting his smart thermostat schedule for the tenth time this week.",
      initials: 'AC',
    },
    affiliateTag: import.meta.env?.AMAZON_AFFILIATE_TAG || process.env.AMAZON_AFFILIATE_TAG || 'YOURTAG-20',
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

  return _cachedConfig!;
}
