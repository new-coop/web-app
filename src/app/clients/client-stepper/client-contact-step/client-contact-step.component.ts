/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-client-contact-step',
  templateUrl: './client-contact-step.component.html',
  styleUrls: ['../client-step-form.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientContactStepComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  @Input() clientTemplate: any;

  clientContactForm: FormGroup;
  clientTypeOptions: any;
  clientClassificationTypeOptions: any;

  constructor() {
    this.clientContactForm = this.formBuilder.group({
      mobileNo: [''],
      emailAddress: [
        '',
        Validators.email
      ],
      clientTypeId: [''],
      clientClassificationId: ['']
    });
  }

  ngOnInit() {
    this.clientTypeOptions = this.clientTemplate.clientTypeOptions;
    this.clientClassificationTypeOptions = this.clientTemplate.clientClassificationOptions;
  }

  get clientContact() {
    return this.clientContactForm.getRawValue();
  }
}
