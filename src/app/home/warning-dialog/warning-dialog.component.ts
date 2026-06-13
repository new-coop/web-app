/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

@Component({
  selector: 'mifosx-warning-dialog',
  standalone: true,
  templateUrl: './warning-dialog.component.html',
  styleUrls: ['./warning-dialog.component.scss'],
  imports: [...STANDALONE_SHARED_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningDialogComponent {
  private authenticationService = inject(AuthenticationService);
  private cdr = inject(ChangeDetectorRef);

  visible = !this.authenticationService.hasDialogBeenShown();
  buttonText = environment.warningDialog.buttonText;

  dismiss(): void {
    this.authenticationService.showDialog();
    this.visible = false;
    this.cdr.markForCheck();
  }
}
