/**
 * Generates fa-compat.scss from fa-material-map.ts so legacy <i class="fa fa-*"> tags
 * stay in sync with the fa-icon component mapping.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapPath = join(root, 'src/app/shared/icons/fa-material-map.ts');
const outPath = join(root, 'src/assets/styles/fa-compat.scss');

const source = readFileSync(mapPath, 'utf8');
const mapMatch = source.match(/export const FA_MATERIAL_MAP[^=]*=\s*\{([\s\S]*?)\n\};/);
if (!mapMatch) {
  console.error('Could not parse FA_MATERIAL_MAP from', mapPath);
  process.exit(1);
}

const entries = [];
const entryRe = /['"]?([\w-]+)['"]?\s*:\s*'([^']+)'/g;
let match;
while ((match = entryRe.exec(mapMatch[1])) !== null) {
  entries.push([
    match[1],
    match[2]
  ]);
}

const mapLines = entries
  .map(
    ([
      fa,
      ligature
    ]) => `  '${fa}': '${ligature}',`
  )
  .join('\n');

const scss = [
  '/**',
  ' * Copyright since 2025 Mifos Initiative',
  ' *',
  ' * This Source Code Form is subject to the terms of the Mozilla Public',
  ' * License, v. 2.0. If a copy of the MPL was not distributed with this',
  ' * file, You can obtain one at http://mozilla.org/MPL/2.0/.',
  ' */',
  '',
  '// Font Awesome compatibility layer.',
  '//',
  '// Legacy <i class="fa fa-..."> tags are rendered with Material Symbols',
  '// ligatures instead of the Font Awesome font, so the whole app uses a single',
  '// icon system. Each .fa-* rule maps the old name to a Material glyph.',
  '//',
  '// AUTO-GENERATED from src/app/shared/icons/fa-material-map.ts — do not edit by hand.',
  '// Run: node scripts/generate-fa-compat-scss.mjs',
  '',
  'i.fa {',
  "  font-family: 'Material Symbols Outlined', sans-serif;",
  '  font-weight: normal;',
  '  font-style: normal;',
  '  font-variation-settings:',
  "    'FILL' 0,",
  "    'wght' 400,",
  "    'GRAD' 0,",
  "    'opsz' 24;",
  '  font-size: 1.155em;',
  '  line-height: 1;',
  '  letter-spacing: normal;',
  '  text-transform: none;',
  '  white-space: nowrap;',
  '  direction: ltr;',
  '  display: inline-block;',
  '  vertical-align: -0.155em;',
  '  -webkit-font-smoothing: antialiased;',
  '',
  '  // Legacy size modifier used in a few templates.',
  '  &.fa-large {',
  '    font-size: 1.35em;',
  '  }',
  '}',
  '',
  '$fa-material-map: (',
  mapLines,
  ');',
  '',
  '@each $fa-name, $ligature in $fa-material-map {',
  '  i.fa.fa-#{$fa-name}::before {',
  '    content: $ligature;',
  '  }',
  '}',
  ''
].join('\n');

writeFileSync(outPath, scss);
console.log(`Generated ${outPath} with ${entries.length} icon mappings.`);
