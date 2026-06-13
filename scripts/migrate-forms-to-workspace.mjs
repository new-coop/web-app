#!/usr/bin/env node
/**
 * Migrates mat-card page forms to mifosx-form-workspace layout.
 * Usage: node scripts/migrate-forms-to-workspace.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '../src/app');
const dryRun = process.argv.includes('--dry-run');

const EYEBROW_BY_SEGMENT = {
  accounting: 'labels.heading.Accounting',
  organization: 'labels.heading.Organization',
  loans: 'labels.heading.Loans',
  clients: 'labels.heading.Clients',
  savings: 'labels.heading.Savings',
  deposits: 'labels.heading.Deposits',
  products: 'labels.heading.Products',
  groups: 'labels.heading.Groups',
  centers: 'labels.heading.Centers',
  shares: 'labels.heading.Shares',
  system: 'labels.heading.System',
  users: 'labels.heading.Users',
  zitadel: 'labels.heading.Users',
  templates: 'labels.heading.Templates',
  reports: 'labels.heading.Reports',
  remittances: 'labels.heading.Remittances',
  'account-transfers': 'labels.heading.Account Transfers'
};

const SKIP_PATTERNS = [
  /-dialog\.component\.html$/,
  /\/stepper\//,
  /\/step\//,
  /-step\.component\.html$/,
  /checker-inbox\.component\.html$/,
  /view-.*\.component\.html$/
];

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

function kebabToTitle(kebab) {
  return kebab
    .replace(/^(create|edit|add|view|manage)-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function inferTitle(filePath, content) {
  const headingMatch = content.match(
    /<h2>\{\{\s*'(labels\.(?:heading|text|buttons)\.[^']+)'\s*\|\s*translate\s*\}\}<\/h2>/
  );
  if (headingMatch) {
    return headingMatch[1];
  }

  const base = path.basename(filePath, '.component.html');
  const parts = base.split('-');

  if (parts[0] === 'create') {
    return `labels.heading.Create ${kebabToTitle(base.slice('create-'.length))}`;
  }
  if (parts[0] === 'edit') {
    return `labels.heading.Edit ${kebabToTitle(base.slice('edit-'.length))}`;
  }
  if (parts[0] === 'add') {
    return `labels.heading.Add ${kebabToTitle(base.slice('add-'.length))}`;
  }

  const actionTitle = base
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `labels.heading.${actionTitle}`;
}

function inferEyebrow(filePath) {
  const rel = path.relative(appRoot, filePath).replace(/\\/g, '/');
  const segment = rel.split('/')[0];
  return EYEBROW_BY_SEGMENT[segment] || '';
}

function isNarrowForm(inner) {
  const fieldCount = (inner.match(/<mat-form-field/g) || []).length;
  const hasRowWrap = /layout-row-wrap|flex-48|flex-50/.test(inner);
  return fieldCount <= 4 && !hasRowWrap;
}

function divBalance(html) {
  const opens = (html.match(/<div[\s>]/g) || []).length;
  const closes = (html.match(/<\/div>/g) || []).length;
  return opens - closes;
}

function stripLayoutWrapper(content) {
  let inner = content.trim();

  const openMatch = inner.match(/^<div[^>]*class="[^"]*(layout-column|layout-row-wrap)[^"]*"[^>]*>\s*/);
  if (openMatch && inner.endsWith('</div>')) {
    const candidate = inner.slice(openMatch[0].length, inner.lastIndexOf('</div>')).trim();
    if (divBalance(candidate) === 0) {
      inner = candidate;
    }
  }

  inner = inner.replace(/\sclass="flex-(?:48|50|98|100|fill)"/g, '');
  inner = inner.replace(/\sclass="([^"]*\bflex-\d+[^"]*)"/g, (match, cls) => {
    const cleaned = cls
      .split(/\s+/)
      .filter((c) => !/^flex-/.test(c))
      .join(' ');
    return cleaned ? ` class="${cleaned}"` : '';
  });

  inner = inner.replace(
    /<div class="([^"]*(?:checkbox|entries|password|send-password)[^"]*)"/g,
    '<div class="form-field-checkbox $1"'
  );

  inner = inner.replace(/class="form-field-checkbox form-field-checkbox"/g, 'class="form-field-checkbox"');

  return inner;
}

function normalizeFooterActions(actions) {
  let footer = actions.trim();
  footer = footer.replace(/^<mat-card-actions[^>]*>/, '').replace(/<\/mat-card-actions>$/, '');
  footer = footer.replace(/\[disabled\]="![\w.]+\.valid(?:\s*\|\|\s*[^"]+)?"/g, '');
  footer = footer.replace(/\s{2,}/g, ' ');
  footer = footer.replace(/(<button[^>]*mat-raised-button[^>]*color="primary"[^>]*)(>)/g, (m, start, end) => {
    if (start.includes('type=')) {
      return `${start}${end}`;
    }
    return `${start} type="submit"${end}`;
  });
  return footer.trim();
}

function transformHtml(content, filePath) {
  if (content.includes('mifosx-form-workspace')) {
    return null;
  }
  if (!/<mat-card[\s>]/.test(content) || !/<form[^>]*\[formGroup\]/.test(content)) {
    return null;
  }
  if (/<mat-stepper[\s>]/.test(content)) {
    return null;
  }

  const rel = path.relative(appRoot, filePath).replace(/\\/g, '/');
  if (SKIP_PATTERNS.some((p) => p.test(rel))) {
    return null;
  }

  const title = inferTitle(filePath, content);
  const eyebrow = inferEyebrow(filePath);

  let body = content;

  const containerMatch = body.match(
    /(<div class="container[^"]*">)\s*(?:@\s*if\s*\([^)]+\)\s*\{\s*)?<mat-card>\s*<form([^>]*)>([\s\S]*?)<\/form>\s*<\/mat-card>\s*(?:\}\s*)?<\/div>/m
  );
  if (!containerMatch) {
    return null;
  }

  let [
    ,
    containerOpen,
    formAttrs,
    formInner
  ] = containerMatch;

  let actions = '';
  formInner = formInner.replace(/<mat-card-actions[^>]*>([\s\S]*?)<\/mat-card-actions>/g, (_, inner) => {
    actions = normalizeFooterActions(`<mat-card-actions>${inner}</mat-card-actions>`);
    return '';
  });

  let fields = formInner;
  const contentMatch = fields.match(/<mat-card-content[^>]*>([\s\S]*?)<\/mat-card-content>/);
  if (contentMatch) {
    fields = contentMatch[1];
  }

  fields = stripLayoutWrapper(fields.trim());
  const narrow = isNarrowForm(fields) ? ' form-page--narrow' : '';

  if (!formAttrs.includes('class=')) {
    formAttrs += ' class="form-workspace-form"';
  } else if (!formAttrs.includes('form-workspace-form')) {
    formAttrs = formAttrs.replace(/class="([^"]*)"/, 'class="$1 form-workspace-form"');
  }

  containerOpen = containerOpen.replace(/class="container([^"]*)"/, (m, rest) => {
    if (rest.includes('form-page')) {
      return m;
    }
    return `class="container form-page${narrow}${rest}"`;
  });

  const eyebrowAttr = eyebrow ? ` eyebrow="${eyebrow}"` : '';
  const replacement = `${containerOpen}
  <mifosx-form-workspace${eyebrowAttr} title="${title}">
    <form${formAttrs}>
      <div class="form-workspace-body">
        <section class="form-section">
          <h2 class="form-section-title">{{ 'labels.heading.General' | translate }}</h2>
          <div class="form-grid">
            ${fields}
          </div>
        </section>
      </div>
      <footer class="form-workspace-footer">
        ${actions}
      </footer>
    </form>
  </mifosx-form-workspace>
</div>`;

  body = body.replace(containerMatch[0], replacement);

  return body;
}

const files = walk(appRoot);
let migrated = 0;
let skipped = 0;
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  try {
    const next = transformHtml(content, file);
    if (!next) {
      skipped++;
      continue;
    }
    if (!dryRun) {
      fs.writeFileSync(file, next, 'utf8');
    }
    migrated++;
    console.log(`${dryRun ? '[dry-run] ' : ''}migrated: ${path.relative(appRoot, file)}`);
  } catch (err) {
    failures.push({ file, err: err.message });
  }
}

console.log(`\nDone. migrated=${migrated} skipped=${skipped} failures=${failures.length}`);
if (failures.length) {
  failures.forEach(({ file, err }) => console.error(`FAIL ${file}: ${err}`));
  process.exit(1);
}
