/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Client Family Members Dialog
 */
@Component({
  selector: 'mifosx-client-family-member-dialog',
  templateUrl: './client-family-member-dialog.component.html',
  styleUrls: ['./client-family-member-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatCheckbox,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientFamilyMemberDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ClientFamilyMemberDialogComponent>>(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  data = inject(MAT_DIALOG_DATA);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Maximum Due Date allowed. */
  maxDate = new Date();

  /** Add/Edit family member form. */
  familyMemberForm: FormGroup;

  /** Catalog options for detail fields. */
  relationshipOptions: Array<{ id: number; name: string }> = [];
  genderOptions: Array<{ id: number; name: string }> = [];
  professionOptions: Array<{ id: number; name: string }> = [];
  maritalStatusOptions: Array<{ id: number; name: string }> = [];

  constructor() {
    this.createFamilyMemberForm();
  }

  ngOnInit() {
    this.relationshipOptions = this.data.options?.relationshipIdOptions ?? [];
    this.genderOptions = this.data.options?.genderIdOptions ?? [];
    this.professionOptions = this.data.options?.professionIdOptions ?? [];
    this.maritalStatusOptions = this.data.options?.maritalStatusIdOptions ?? [];
    this.configureOptionalCatalogControls();

    this.maxDate = this.settingsService.businessDate;
    if (this.data.isEdit) {
      this.familyMemberForm.patchValue({
        firstName: this.data.member.firstName,
        middleName: this.data.member.middleName,
        lastName: this.data.member.lastName,
        qualification: this.data.member.qualification,
        age: this.data.member.age,
        isDependent: this.data.member.isDependent,
        relationshipId: this.data.member.relationshipId,
        genderId: this.data.member.genderId,
        professionId: this.data.member.professionId,
        maritalStatusId: this.data.member.maritalStatusId,
        dateOfBirth: this.data.member.dateOfBirth && new Date(this.data.member.dateOfBirth)
      });
    }

    // Add subscription to date of birth changes to update age
    this.familyMemberForm
      .get('dateOfBirth')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dateOfBirth: any) => {
        if (dateOfBirth) {
          this.setAgeValue(this.calculateAge(dateOfBirth));
        } else {
          this.setAgeValue('');
        }
      });

    // If a date of birth is already set, calculate the age
    const currentDob = this.familyMemberForm.get('dateOfBirth').value;
    if (currentDob) {
      this.setAgeValue(this.calculateAge(currentDob));
    }

    this.cdr.markForCheck();
  }

  /**
   * Disables optional catalog fields when their option lists are empty.
   */
  private configureOptionalCatalogControls(): void {
    if (!this.professionOptions.length) {
      this.familyMemberForm.get('professionId')?.disable({ emitEvent: false });
    }
    if (!this.maritalStatusOptions.length) {
      this.familyMemberForm.get('maritalStatusId')?.disable({ emitEvent: false });
    }
  }

  /**
   * Updates the read-only age control without using a template disabled attribute.
   */
  private setAgeValue(age: number | ''): void {
    const ageControl = this.familyMemberForm.get('age');
    if (!ageControl) {
      return;
    }

    ageControl.enable({ emitEvent: false });
    ageControl.setValue(age, { emitEvent: false });
    ageControl.disable({ emitEvent: false });
  }

  /**
   * Calculates age from date of birth
   * @param {Date} dateOfBirth Date of Birth
   * @returns {number} Age
   */
  calculateAge(dateOfBirth: Date): number {
    const today = new Date(this.settingsService.businessDate);
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Creates Family Member Form
   */
  createFamilyMemberForm() {
    this.familyMemberForm = this.formBuilder.group({
      firstName: [
        '',
        Validators.required
      ],
      middleName: [''],
      lastName: [
        '',
        Validators.required
      ],
      qualification: [''],
      age: [
        { value: '', disabled: true }
      ],
      isDependent: [''],
      relationshipId: [
        null,
        Validators.required
      ],
      genderId: [
        null,
        Validators.required
      ],
      professionId: [null],
      maritalStatusId: [null],
      dateOfBirth: ['']
    });
  }

  /**
   * Returns Formatted Family Member
   */
  get familyMember() {
    // Get form values including disabled controls like age
    const formValue = {
      ...this.familyMemberForm.getRawValue()
    };

    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevDateOfBirth: Date = formValue.dateOfBirth;

    // Calculate age from dateOfBirth if present
    if (prevDateOfBirth) {
      if (formValue.dateOfBirth instanceof Date) {
        formValue.dateOfBirth = this.dateUtils.formatDate(prevDateOfBirth, dateFormat);
      }
      // Ensure age is calculated even if it wasn't already
      if (!formValue.age && prevDateOfBirth) {
        formValue.age = this.calculateAge(prevDateOfBirth);
      }
    } else {
      // If no date of birth, remove age and dateOfBirth from submission
      delete formValue.age;
      delete formValue.dateOfBirth;
    }

    const familyMember = {
      ...formValue,
      dateFormat,
      locale
    };

    // Remove empty fields
    for (const key in familyMember) {
      if (familyMember[key] === '' || familyMember[key] === undefined || familyMember[key] === null) {
        delete familyMember[key];
      }
    }

    return familyMember;
  }
}
