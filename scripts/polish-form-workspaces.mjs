#!/usr/bin/env node
/**
 * Post-migration polish for form-workspace templates.
 * Usage: node scripts/polish-form-workspaces.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '../src/app');
const dryRun = process.argv.includes('--dry-run');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith('.component.html')) {
      files.push(full);
    }
  }
  return files;
}

function polish(content) {
  if (!content.includes('mifosx-form-workspace')) {
    return null;
  }

  let next = content;

  // Flatten double elevation inside workspace shell
  next = next.replace(/\bmat-elevation-z8 form-workspace-stepper\b/g, 'form-workspace-stepper');
  next = next.replace(/\bform-workspace-stepper mat-elevation-z8\b/g, 'form-workspace-stepper');

  // Split footer buttons onto separate lines
  next = next.replace(
    /(<footer class="form-workspace-footer">[\s\S]*?)<\/button>\s+<button/g,
    '$1</button>\n        <button'
  );

  // Normalize double spaces before type="submit"
  next = next.replace(/color="primary"\s{2,}type="submit"/g, 'color="primary" type="submit"');

  // Collapse triple newlines introduced above
  next = next.replace(/\n{3,}/g, '\n\n');

  return next === content ? null : next;
}

let updated = 0;
for (const file of walk(appRoot)) {
  const content = fs.readFileSync(file, 'utf8');
  const next = polish(content);
  if (!next) {
    continue;
  }
  if (!dryRun) {
    fs.writeFileSync(file, next, 'utf8');
  }
  updated++;
}

console.log(`${dryRun ? '[dry-run] ' : ''}Polished ${updated} templates`);
