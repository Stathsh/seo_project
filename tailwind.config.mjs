/** @type {import('tailwindcss').Config} */
import fs from 'fs';

function loadTheme() {
  const siteId = process.env.ACTIVE_SITE || '_default';
  const themePath = `./sites/${siteId}/theme.json`;
  if (fs.existsSync(themePath)) {
    try {
      return JSON.parse(fs.readFileSync(themePath, 'utf-8'));
    } catch { /* fall through */ }
  }
  return null;
}

const theme = loadTheme();

function fontList(fontDef) {
  if (!fontDef) return ['Inter', 'system-ui', '-apple-system', 'sans-serif'];
  return [fontDef.family, ...fontDef.fallback.split(',').map(f => f.trim())];
}

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: theme?.colors?.brand || {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        accent: theme?.colors?.accent || {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: fontList(theme?.fonts?.body),
        heading: fontList(theme?.fonts?.heading),
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            h2: {
              marginTop: '2em',
              marginBottom: '0.75em',
            },
            h3: {
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
