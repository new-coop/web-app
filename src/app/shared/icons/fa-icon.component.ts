/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FA_MATERIAL_MAP } from './fa-material-map';

/** Resolve a Font Awesome icon name to its Material Symbols ligature. */
export function faToMaterial(name: string): string {
  return FA_MATERIAL_MAP[name] ?? name.replace(/-/g, '_');
}

/** Legacy Font Awesome size keywords mapped to em-based font sizes. */
const SIZE_TO_EM: Record<string, string> = {
  xs: '0.75em',
  sm: '0.875em',
  md: '1em',
  lg: '1.25em',
  '1x': '1em',
  '2x': '2em',
  '3x': '3em',
  '4x': '4em',
  '5x': '5em'
};

/**
 * Drop-in replacement for the Font Awesome `fa-icon` component that renders
 * Material Symbols (duotone) instead. Accepts the same `icon` / `size`
 * inputs used throughout the app, so templates don't need to change.
 */
/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'fa-icon',
  standalone: true,
  template: `<span class="fa-compat-icon" [style.font-size]="fontSize" aria-hidden="true">
    <span class="fa-compat-icon__layer fa-compat-icon__layer--fill material-symbols-filled">{{ ligature }}</span>
    <span class="fa-compat-icon__layer fa-compat-icon__layer--stroke material-symbols-outlined">{{ ligature }}</span>
  </span>`,
  styles: [
    `
      :host {
        display: inline-block;
        line-height: 1;
      }

      :host .fa-compat-icon {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: -0.155em;
        color: var(--m3-icon-duotone-color, currentcolor);
      }

      :host .fa-compat-icon__layer {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: inherit;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        white-space: nowrap;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
      }

      :host .fa-compat-icon__layer--fill {
        position: absolute;
        inset: 0;
        color: var(--m3-icon-duotone-fill-color, color-mix(in srgb, currentcolor 30%, transparent));
      }

      :host .fa-compat-icon__layer--stroke {
        position: relative;
        color: inherit;
      }

      :host .material-symbols-filled,
      :host .material-symbols-outlined {
        font-family: 'Material Symbols Outlined', sans-serif;
        font-weight: normal;
        font-style: normal;
      }

      :host .material-symbols-filled {
        font-variation-settings:
          'FILL' 1,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }

      :host .material-symbols-outlined {
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaIconComponent {
  /** Font Awesome icon name (string) or `[prefix, name]` tuple. */
  @Input() icon: string | string[] | { iconName?: string } | null = null;

  /** Legacy Font Awesome size keyword: xs, sm, md, lg, 2x, 3x... */
  @Input() size?: string;

  get ligature(): string {
    let name = '';
    if (typeof this.icon === 'string') {
      name = this.icon;
    } else if (Array.isArray(this.icon)) {
      name = this.icon[this.icon.length - 1] ?? '';
    } else if (this.icon && typeof this.icon === 'object') {
      name = this.icon.iconName ?? '';
    }
    return name ? faToMaterial(name) : '';
  }

  get fontSize(): string | null {
    return this.size ? (SIZE_TO_EM[this.size] ?? null) : null;
  }
}
