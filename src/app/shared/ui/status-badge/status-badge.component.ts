/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { resolveStatusBadgeConfig } from './status-badge.utils';

@Component({
  selector: 'mifosx-status-badge',
  standalone: true,
  imports: [TagModule],
  template: `<p-tag [severity]="config().severity" [value]="config().label" [rounded]="true" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  /** Fineract API status code, e.g. 'loanStatusType.active' */
  code = input.required<string>();
  /** Optional display label when code is not in STATUS_MAP */
  label = input<string>();
  /** An active loan in arrears is shown as danger regardless of status */
  overdue = input(false);

  config = computed(() => resolveStatusBadgeConfig(this.code(), this.overdue(), this.label()));
}
