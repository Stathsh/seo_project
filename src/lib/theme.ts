/**
 * Theme loader for the Astro site.
 * Reads the active site's theme.json at build time.
 */

import fs from 'fs';
import path from 'path';

export interface Theme {
  id: string;
  name: string;
  colors: {
    brand: Record<string, string>;
    accent: Record<string, string>;
  };
  fonts: {
    googleUrl: string;
    heading: { family: string; fallback: string };
    body: { family: string; fallback: string };
  };
  layout: {
    style: string;
    heroGradient: boolean;
    roundedCards: boolean;
    borderStyle: string;
  };
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default (Blue / Inter)',
  colors: {
    brand: {
      '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd',
      '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8',
      '800': '#1e40af', '900': '#1e3a8a', '950': '#172554',
    },
    accent: { '500': '#f59e0b', '600': '#d97706' },
  },
  fonts: {
    googleUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    heading: { family: 'Inter', fallback: 'system-ui, -apple-system, sans-serif' },
    body: { family: 'Inter', fallback: 'system-ui, -apple-system, sans-serif' },
  },
  layout: { style: 'modern', heroGradient: true, roundedCards: true, borderStyle: 'subtle' },
};

let _cachedTheme: Theme | null = null;

export function getTheme(): Theme {
  if (_cachedTheme) return _cachedTheme;

  const root = process.cwd();
  const siteId = process.env.ACTIVE_SITE || '_default';
  const themePath = path.join(root, 'sites', siteId, 'theme.json');

  if (fs.existsSync(themePath)) {
    try {
      _cachedTheme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
      return _cachedTheme!;
    } catch {
      // Fall through to default
    }
  }

  _cachedTheme = defaultTheme;
  return _cachedTheme;
}
