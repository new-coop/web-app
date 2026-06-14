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
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { ClientsService } from '../../../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Add Family Member Component
 */
@Component({
  selector: 'mifosx-add-family-member',
  templateUrl: './add-family-member.component.html',
  styleUrls: ['./add-family-member.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddFamilyMemberComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clientsService = inject(ClientsService);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Minimum age allowed is 0. */
  minAge = 0;
  /** Add family member form. */
  addFamilyMemberForm: FormGroup;
  /** Add family member template. */
  addFamilyMemberTemplate: any;
  /** Client ID */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder FormBuilder
   * @param {Dates} dateUtils Date Utils
   * @param {Router} router Router
   * @param {Route} route Route
   * @param {ClientsService} clientsService Clients Service
   * @param {SettingsService} settingsService Setting service
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientTemplate: any }) => {
      this.addFamilyMemberTemplate = data.clientTemplate.familyMemberOptions;
      this.configureOptionalCatalogControls();
      this.cdr.markForCheck();
    });
    this.clientId = this.route.parent.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    if (!this.addFamilyMemberTemplate) {
      this.addFamilyMemberTemplate = this.route.snapshot.data['clientTemplate']?.familyMemberOptions;
    }

    this.maxDate = this.settingsService.businessDate;
    this.createAddFamilyMemberForm();
    this.configureOptionalCatalogControls();
    this.addFamilyMemberForm
      .get('dateOfBirth')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dateOfBirth: any) => {
        if (dateOfBirth) {
          this.setAgeValue(this.calculateAge(dateOfBirth));
        } else {
          this.setAgeValue('');
        }
      });
    this.cdr.markForCheck();
  }

  /**
   * Disables optional catalog fields when their option lists are empty.
   */
  private configureOptionalCatalogControls(): void {
    if (!this.addFamilyMemberForm || !this.addFamilyMemberTemplate) {
      return;
    }

    if (!this.addFamilyMemberTemplate.professionIdOptions?.length) {
      this.addFamilyMemberForm.get('professionId')?.disable({ emitEvent: false });
    }
    if (!this.addFamilyMemberTemplate.maritalStatusIdOptions?.length) {
      this.addFamilyMemberForm.get('maritalStatusId')?.disable({ emitEvent: false });
    }
  }

  /**
   * Updates the read-only age control without using a template disabled attribute.
   */
  private setAgeValue(age: number | ''): void {
    const ageControl = this.addFamilyMemberForm?.get('age');
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
   * Creates the add family member form
   */
  createAddFamilyMemberForm() {
    this.addFamilyMemberForm = this.formBuilder.group({
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
   * Submits the form and adds the family member
   */
  submit() {
    // Get form values including disabled controls like age
    const formValue = {
      ...this.addFamilyMemberForm.getRawValue()
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

    const data = {
      ...formValue,
      dateFormat,
      locale
    };

    this.clientsService.addFamilyMember(this.clientId, data).subscribe((res) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
