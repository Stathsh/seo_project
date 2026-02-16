/**
 * Data helpers for reading/writing YAML and JSON site data
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function readYaml(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) || [];
}

export function writeYaml(filePath, data) {
  const output = yaml.dump(data, { lineWidth: -1, quotingType: '"', forceQuotes: true });
  fs.writeFileSync(filePath, output, 'utf-8');
}

export function readJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const filePath = path.join(dir, f);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      let frontmatter = {};
      if (fmMatch) {
        try {
          frontmatter = yaml.load(fmMatch[1]) || {};
        } catch (e) {
          frontmatter = { title: f.replace('.md', ''), error: 'Failed to parse frontmatter' };
        }
      }
      const stats = fs.statSync(filePath);
      const content = raw.replace(/^---\n[\s\S]*?\n---\n*/, '');
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      return {
        filename: f,
        ...frontmatter,
        wordCount,
        fileSize: stats.size,
        modified: stats.mtime,
      };
    });
}
