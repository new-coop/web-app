/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

import { FaIconComponent } from './icons/fa-icon.component';

/**
 * Icons Module
 *
 * Exports the `fa-icon` compatibility component, which renders Material
 * Symbols for the legacy Font Awesome icon names used across templates.
 */
@NgModule({
  imports: [FaIconComponent],
  exports: [FaIconComponent]
})
export class IconsModule {}
