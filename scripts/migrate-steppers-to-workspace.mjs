#!/usr/bin/env node
/**
 * Wraps mat-stepper page templates in mifosx-form-workspace.
 * Usage: node scripts/migrate-steppers-to-workspace.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '../src/app');
const dryRun = process.argv.includes('--dry-run');

const EYEBROW_BY_SEGMENT = {
  clients: 'labels.heading.Clients',
  loans: 'labels.heading.Loans',
  savings: 'labels.heading.Savings',
  deposits: 'labels.heading.Deposits',
  products: 'labels.heading.Products',
  shares: 'labels.heading.Shares',
  organization: 'labels.heading.Organization',
  remittances: 'labels.heading.Remittances',
  'account-transfers': 'labels.heading.Account Transfers'
};

function kebabToTitle(kebab) {
  return kebab
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function inferTitle(filePath) {
  const base = path.basename(filePath, '.component.html');
  if (base.startsWith('create-')) {
    return `labels.heading.Create ${kebabToTitle(base.slice('create-'.length))}`;
  }
  if (base.startsWith('edit-')) {
    return `labels.heading.Edit ${kebabToTitle(base.slice('edit-'.length))}`;
  }
  return `labels.heading.${kebabToTitle(base)}`;
}

function inferEyebrow(filePath) {
  const rel = path.relative(appRoot, filePath).replace(/\\/g, '/');
  return EYEBROW_BY_SEGMENT[rel.split('/')[0]] || '';
}

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

function transform(content, filePath) {
  if (content.includes('mifosx-form-workspace') || !content.includes('<mat-stepper')) {
    return null;
  }

  const match = content.match(/(<div class="container[^"]*">)([\s\S]*?)<\/div>\s*$/m);
  if (!match || !match[2].includes('<mat-stepper')) {
    return null;
  }

  const [
    ,
    containerOpen,
    inner
  ] = match;
  const title = inferTitle(filePath);
  const eyebrow = inferEyebrow(filePath);

  let container = containerOpen.replace(/class="container([^"]*)"/, (m, rest) => {
    if (rest.includes('form-page')) {
      return m;
    }
    return `class="container form-page${rest}"`;
  });

  const innerOut = inner.replace(/<mat-stepper([^>]*)>/g, (m, attrs) => {
    if (attrs.includes('form-workspace-stepper')) {
      return m;
    }
    const cls = attrs.includes('class=')
      ? attrs.replace(/class="([^"]*)"/, 'class="$1 form-workspace-stepper"')
      : `${attrs} class="form-workspace-stepper"`;
    return `<mat-stepper${cls}>`;
  });

  const eyebrowAttr = eyebrow ? ` eyebrow="${eyebrow}"` : '';
  const replacement = `${container}
  <mifosx-form-workspace${eyebrowAttr} title="${title}" [showRequiredNote]="false">
${innerOut}
  </mifosx-form-workspace>
</div>`;

  return content.replace(match[0], replacement);
}

let migrated = 0;
for (const file of walk(appRoot)) {
  const content = fs.readFileSync(file, 'utf8');
  const next = transform(content, file);
  if (!next) {
    continue;
  }
  if (!dryRun) {
    fs.writeFileSync(file, next, 'utf8');
  }
  migrated++;
  console.log(`${dryRun ? '[dry-run] ' : ''}stepper: ${path.relative(appRoot, file)}`);
}

console.log(`\nSteppers migrated: ${migrated}`);
