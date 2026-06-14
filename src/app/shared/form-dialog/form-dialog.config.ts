/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MatDialogConfig } from '@angular/material/dialog';

const FORM_DIALOG_BASE: Pick<MatDialogConfig, 'maxWidth' | 'width' | 'autoFocus'> = {
  maxWidth: '720px',
  width: 'min(720px, calc(100vw - 48px))',
  autoFocus: 'first-titled-element'
};

/** @deprecated Use getFormDialogConfig() so dark mode applies on the overlay pane. */
export const FORM_DIALOG_CONFIG = {
  panelClass: 'form-dialog-panel',
  ...FORM_DIALOG_BASE
};

/** MatDialog options for structured form dialogs (theme-aware panel class). */
export function getFormDialogConfig<T = unknown>(config: MatDialogConfig<T> = {}): MatDialogConfig<T> {
  const isDark =
    document.documentElement.classList.contains('dark-theme') || document.body.classList.contains('dark-theme');

  return {
    ...FORM_DIALOG_BASE,
    panelClass: isDark ? [
          'form-dialog-panel',
          'dark-theme'
        ] : 'form-dialog-panel',
    ...config
  };
}
