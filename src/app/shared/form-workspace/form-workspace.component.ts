/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Noir ledger shell — dark header, numbered sections, sticky footer.
 * Project a `<form>` with `.form-workspace-body` and `.form-workspace-footer` inside.
 */
@Component({
  selector: 'mifosx-form-workspace',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './form-workspace.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormWorkspaceComponent {
  /** i18n key shown above the title (e.g. labels.heading.Accounting) */
  readonly eyebrow = input<string>('');

  /** i18n key for the page title */
  readonly title = input.required<string>();

  /** Show the required-field legend in the header */
  readonly showRequiredNote = input(true);
}
