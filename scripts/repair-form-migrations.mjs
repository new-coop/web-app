#!/usr/bin/env node
/**
 * Restores codemod targets from git and re-runs migration with fixed unwrap logic.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '../src/app');
const repoRoot = path.join(__dirname, '..');

const PRESERVE = new Set([
  'accounting/create-journal-entry/create-journal-entry.component.html',
  'accounting/frequent-postings/frequent-postings.component.html',
  'accounting/accounting-rules/create-rule/create-rule.component.html',
  'accounting/accounting-rules/edit-rule/edit-rule.component.html',
  'accounting/migrate-opening-balances/migrate-opening-balances.component.html',
  'accounting/chart-of-accounts/create-gl-account/create-gl-account.component.html',
  'accounting/chart-of-accounts/edit-gl-account/edit-gl-account.component.html',
  'accounting/financial-activity-mappings/create-financial-activity-mapping/create-financial-activity-mapping.component.html',
  'accounting/financial-activity-mappings/edit-financial-activity-mapping/edit-financial-activity-mapping.component.html',
  'accounting/periodic-accruals/periodic-accruals.component.html',
  'accounting/closing-entries/create-closure/create-closure.component.html',
  'accounting/closing-entries/edit-closure/edit-closure.component.html',
  'accounting/provisioning-entries/create-provisioning-entry/create-provisioning-entry.component.html'
]);

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

let restored = 0;
for (const file of walk(appRoot)) {
  const rel = path.relative(appRoot, file).replace(/\\/g, '/');
  const cur = fs.readFileSync(file, 'utf8');
  if (!cur.includes('mifosx-form-workspace') || PRESERVE.has(rel)) {
    continue;
  }
  try {
    const original = execSync(`git show HEAD:src/app/${rel}`, { cwd: repoRoot, encoding: 'utf8' });
    if (original.includes('mifosx-form-workspace')) {
      continue;
    }
    fs.writeFileSync(file, original, 'utf8');
    restored++;
  } catch {
    // not in git
  }
}

console.log(`Restored ${restored} templates from git`);
execSync('node scripts/migrate-forms-to-workspace.mjs', { cwd: repoRoot, stdio: 'inherit' });
