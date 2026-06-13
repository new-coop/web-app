/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InitialsAvatarComponent } from '../../initials-avatar/initials-avatar.component';

/** Avatar + name row used in modern data tables. */
@Component({
  selector: 'mifosx-table-name-cell',
  standalone: true,
  imports: [InitialsAvatarComponent],
  template: `
    <span class="table-cell-name">
      <mifosx-initials-avatar [name]="name()" [size]="size()" />
      <span>{{ name() }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableNameCellComponent {
  name = input.required<string>();
  size = input(32);
}
