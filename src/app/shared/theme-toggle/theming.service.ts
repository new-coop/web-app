/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ApplicationRef, Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemingService {
  private ref = inject(ApplicationRef);

  private darkModeOn = false;

  themes = [
    'dark-theme',
    'light-theme'
  ]; // <- list all themes in this array
  theme = new BehaviorSubject('light-theme'); // <- initial theme

  constructor() {
    // Initial theme is applied via inline script in index.html (before paint).
    // Listen for OS changes only when the user has not set an explicit preference.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('mifosXThemeDarkEnabled') !== null) {
        return;
      }
      this.setDarkMode(e.matches);
      this.ref.tick();
    });
  }

  isDarkMode(): boolean {
    this.darkModeOn = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return this.darkModeOn;
  }

  setDarkMode(isDarkMode: boolean) {
    this.darkModeOn = isDarkMode;
    const root = document.documentElement;
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      root.style.colorScheme = 'dark';
      this.theme.next('dark-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      root.style.colorScheme = 'light';
      this.theme.next('light-theme');
    }
  }

  setInitialDarkMode(): void {
    this.setDarkMode(this.darkModeOn);
  }
}
