// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import fs from 'fs';

function resolveSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const siteId = process.env.ACTIVE_SITE;
  if (siteId) {
    const configPath = `./sites/${siteId}/site.json`;
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.url;
    }
  }
  const defaultPath = './sites/_default/site.json';
  if (fs.existsSync(defaultPath)) {
    const config = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
    return config.url;
  }
  return 'https://yourdomain.com';
}

export default defineConfig({
  site: resolveSiteUrl(),
  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
  ],
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
