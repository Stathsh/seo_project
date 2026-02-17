/**
 * Template definitions for site theming.
 * Each template contains colors, fonts, and layout metadata.
 */

import fs from 'fs';
import path from 'path';

const templates = [
  {
    id: 'default',
    name: 'Default (Blue / Inter)',
    description: 'Clean, modern affiliate site theme with a blue brand palette, orange accents, and the Inter sans-serif font. Matches the current site styling.',
    colors: {
      brand: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
      accent: {
        500: '#f59e0b',
        600: '#d97706',
      },
    },
    fonts: {
      googleUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
      heading: { family: 'Inter', fallback: 'system-ui, -apple-system, sans-serif' },
      body: { family: 'Inter', fallback: 'system-ui, -apple-system, sans-serif' },
    },
    layout: {
      style: 'modern',
      heroGradient: true,
      roundedCards: true,
      borderStyle: 'subtle',
    },
  },
  {
    id: 'nyt-editorial',
    name: 'NYT Editorial',
    description: 'Elegant newspaper-inspired theme with serif typography, black/white/gray color scheme, strong typographic hierarchy, and thin rule borders. Inspired by nytimes.com.',
    colors: {
      brand: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a',
      },
      accent: {
        500: '#567',
        600: '#345',
      },
    },
    fonts: {
      googleUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800;900&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap',
      heading: { family: 'Playfair Display', fallback: 'Georgia, Times New Roman, serif' },
      body: { family: 'Source Serif 4', fallback: 'Georgia, Times New Roman, serif' },
    },
    layout: {
      style: 'editorial',
      heroGradient: false,
      roundedCards: false,
      borderStyle: 'ruled',
    },
  },
  {
    id: 'techradar',
    name: 'TechRadar',
    description: 'Bold tech publication theme with a dark header/footer, magenta accent color, condensed sans-serif headlines, and a dense information-rich layout. Inspired by techradar.com.',
    colors: {
      brand: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
        950: '#500724',
      },
      accent: {
        500: '#ff0066',
        600: '#e6005c',
      },
    },
    fonts: {
      googleUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap',
      heading: { family: 'Oswald', fallback: 'Impact, Arial Narrow, sans-serif' },
      body: { family: 'Open Sans', fallback: 'Helvetica Neue, Arial, sans-serif' },
    },
    layout: {
      style: 'techradar',
      heroGradient: false,
      roundedCards: false,
      borderStyle: 'subtle',
    },
  },
];

export function getAllTemplates() {
  return templates;
}

export function getTemplateById(id) {
  return templates.find(t => t.id === id) || null;
}

/**
 * Read the active template ID from a site's theme.json.
 * Accepts the site's dataDir and walks up one level to find theme.json.
 */
export function getActiveTemplateId(dataDir) {
  const themePath = path.join(dataDir, '..', 'theme.json');
  try {
    if (fs.existsSync(themePath)) {
      const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
      return theme.id || 'default';
    }
  } catch { /* ignore */ }
  return 'default';
}
