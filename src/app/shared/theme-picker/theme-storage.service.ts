/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, EventEmitter } from '@angular/core';
import { Theme } from './theme.model';

/** CSS variables updated when the user picks an accent / color scheme. */
const DESIGN_TOKEN_VARS = [
  '--md-sys-color-primary',
  '--mifos-accent-bg',
  '--mifos-accent-hover',
  '--mifos-focus-ring',
  '--focus-ring-color',
  '--mifos-progress'
] as const;

@Injectable({
  providedIn: 'root'
})
export class ThemeStorageService {
  private themeStorageKey = 'mifosXTheme';
  onThemeUpdate: EventEmitter<Theme>;

  constructor() {
    this.onThemeUpdate = new EventEmitter<Theme>();
  }

  storeTheme(mifosXTheme: Theme) {
    localStorage.setItem(this.themeStorageKey, JSON.stringify(mifosXTheme));
    this.onThemeUpdate.emit(mifosXTheme);
  }

  getTheme(): Theme | null {
    const raw = localStorage.getItem(this.themeStorageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Theme;
    } catch {
      return null;
    }
  }

  clearTheme() {
    localStorage.removeItem(this.themeStorageKey);
    this.clearDesignTokens();
  }

  /**
   * Applies a saved theme on startup (localStorage + body class + design tokens).
   */
  restoreSavedTheme(): void {
    const theme = this.getTheme();
    if (theme) {
      this.installTheme(theme, false);
    }
  }

  /**
   * Dynamically installs the theme by adding a class to the body and updating design tokens.
   * @param {Theme} theme
   * @param persist When false, reapplies without writing to localStorage (startup restore).
   */
  installTheme(theme: Theme, persist = true) {
    const body = document.body;

    // Remove any previously applied theme classes
    body.classList.remove(
      'pictonblue-yellowgreen-theme',
      'indigo-pink-theme',
      'deeppurple-amber-theme',
      'pink-bluegrey-theme',
      'purple-green-theme'
    );

    if (!theme.isDefault) {
      body.classList.add(this.getThemeClass(theme.href));
      this.applyDesignTokens(theme);
    } else {
      this.clearDesignTokens();
    }

    if (persist) {
      this.storeTheme(theme);
    }
  }

  private applyDesignTokens(theme: Theme): void {
    const root = document.documentElement;
    const hover = this.shadeColor(theme.primary, -12);

    root.style.setProperty('--md-sys-color-primary', theme.primary);
    root.style.setProperty('--mifos-accent-bg', theme.primary);
    root.style.setProperty('--mifos-accent-hover', hover);
    root.style.setProperty('--mifos-focus-ring', theme.primary);
    root.style.setProperty('--focus-ring-color', theme.primary);
    root.style.setProperty('--mifos-progress', theme.primary);
  }

  private clearDesignTokens(): void {
    const root = document.documentElement;
    for (const token of DESIGN_TOKEN_VARS) {
      root.style.removeProperty(token);
    }
  }

  /** Darken or lighten a #rrggbb color by a percentage (-100 … 100). */
  private shadeColor(hex: string, percent: number): string {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) {
      return hex;
    }
    const num = parseInt(normalized, 16);
    const amount = Math.round(2.55 * percent);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Maps theme file names to their respective CSS class.
   * @param themeHref The theme file name.
   * @returns The CSS class name for the theme.
   */
  private getThemeClass(themeHref: string): string {
    switch (themeHref) {
      case 'pictonblue-yellowgreen.css':
        return 'pictonblue-yellowgreen-theme';
      case 'indigo-pink.css':
        return 'indigo-pink-theme';
      case 'deeppurple-amber.css':
        return 'deeppurple-amber-theme';
      case 'pink-bluegrey.css':
        return 'pink-bluegrey-theme';
      case 'purple-green.css':
        return 'purple-green-theme';
      default:
        return '';
    }
  }
}
