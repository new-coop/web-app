/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { ExternalNationalIdService } from 'app/clients/services/external-national-id.service';
import { SettingsService } from 'app/settings/settings.service';
import { FaIconComponent } from 'app/shared/icons/fa-icon.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-client-personal-step',
  templateUrl: './client-personal-step.component.html',
  styleUrls: ['../client-step-form.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientPersonalStepComponent implements OnInit, OnChanges {
  private formBuilder = inject(FormBuilder);
  private settingsService = inject(SettingsService);

  readonly LegalFormId = LegalFormId;

  @Input() clientTemplate: any;
  @Input() legalFormId = LegalFormId.PERSON;
  @Input() externalIdControl: AbstractControl | null;
  @Input() externalNationalIdService: ExternalNationalIdService;

  clientPersonalForm: FormGroup;
  genderOptions: any;
  constitutionOptions: any;
  businessLineOptions: any;
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  private externalIdLookupInitialized = false;

  constructor() {
    this.clientPersonalForm = this.formBuilder.group({
      dateOfBirth: ['']
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.genderOptions = this.clientTemplate.genderOptions;
    this.constitutionOptions = this.clientTemplate.clientNonPersonConstitutionOptions;
    this.businessLineOptions = this.clientTemplate.clientNonPersonMainBusinessLineOptions;
    this.setLegalFormControls(this.legalFormId);
    this.setupExternalIdLookup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.legalFormId && !changes.legalFormId.firstChange) {
      this.setLegalFormControls(changes.legalFormId.currentValue);
    }
    if ((changes.externalIdControl || changes.externalNationalIdService) && this.externalIdControl) {
      this.setupExternalIdLookup();
    }
  }

  setLegalFormControls(legalFormId: number) {
    this.clientPersonalForm.removeControl('firstname');
    this.clientPersonalForm.removeControl('middlename');
    this.clientPersonalForm.removeControl('lastname');
    this.clientPersonalForm.removeControl('fullname');
    this.clientPersonalForm.removeControl('genderId');
    this.clientPersonalForm.removeControl('clientNonPersonDetails');

    if (legalFormId === LegalFormId.PERSON) {
      this.clientPersonalForm.addControl(
        'firstname',
        new FormControl('', [
          Validators.required,
          Validators.pattern('(^[A-z]).*')
        ])
      );
      this.clientPersonalForm.addControl('middlename', new FormControl('', Validators.pattern('(^[A-z]).*')));
      this.clientPersonalForm.addControl(
        'lastname',
        new FormControl('', [
          Validators.required,
          Validators.pattern('(^[A-z]).*')
        ])
      );
      this.clientPersonalForm.addControl('genderId', new FormControl(''));
    } else {
      this.clientPersonalForm.addControl(
        'fullname',
        new FormControl('', [
          Validators.required,
          Validators.pattern('(^[A-z]).*')
        ])
      );
      this.clientPersonalForm.addControl(
        'clientNonPersonDetails',
        this.formBuilder.group({
          constitutionId: [
            '',
            Validators.required
          ],
          incorpValidityTillDate: [''],
          incorpNumber: [''],
          mainBusinessLineId: [''],
          remarks: ['']
        })
      );
    }
  }

  setupExternalIdLookup() {
    if (this.externalIdLookupInitialized || !this.externalNationalIdService?.enabled || !this.externalIdControl) {
      return;
    }

    this.externalIdLookupInitialized = true;
    this.externalNationalIdService.watchExternalIdControl(
      this.externalIdControl,
      this.clientPersonalForm,
      this.genderOptions
    );
  }

  getDateLabel(values: string[]): string {
    return this.legalFormId === LegalFormId.PERSON ? values[0] : values[1];
  }

  get clientPersonal() {
    return this.clientPersonalForm.getRawValue();
  }
}
