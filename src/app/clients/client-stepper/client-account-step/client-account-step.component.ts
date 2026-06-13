/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-client-account-step',
  templateUrl: './client-account-step.component.html',
  styleUrls: ['../client-step-form.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientAccountStepComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);

  @Input() clientTemplate: any;

  clientAccountForm: FormGroup;
  savingProductOptions: any;
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();

  constructor() {
    this.clientAccountForm = this.formBuilder.group({
      submittedOnDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      active: [false],
      addSavings: [false]
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.savingProductOptions = this.clientTemplate.savingProductOptions;
    this.buildDependencies();
  }

  buildDependencies() {
    this.clientAccountForm
      .get('active')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((active: boolean) => {
        if (active) {
          this.clientAccountForm.addControl('activationDate', new FormControl('', Validators.required));
        } else {
          this.clientAccountForm.removeControl('activationDate');
        }
      });

    this.clientAccountForm
      .get('addSavings')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((addSavings: boolean) => {
        if (addSavings) {
          this.clientAccountForm.addControl('savingsProductId', new FormControl('', Validators.required));
        } else {
          this.clientAccountForm.removeControl('savingsProductId');
        }
      });
  }

  get clientAccount() {
    return this.clientAccountForm.getRawValue();
  }
}
