/**
 * Template definitions for site theming.
 * Each template contains colors, fonts, and layout metadata.
 */

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
];

export function getAllTemplates() {
  return templates;
}

export function getTemplateById(id) {
  return templates.find(t => t.id === id) || null;
}
