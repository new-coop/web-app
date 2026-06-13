/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { merge } from 'rxjs';

/** Custom Services */
import { SettingsService } from './settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { FileUploadComponent } from '../shared/file-upload/file-upload.component';
import { ThemePickerComponent } from '../shared/theme-picker/theme-picker.component';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector.component';
import { FormWorkspaceComponent } from '../shared/form-workspace/form-workspace.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Settings component.
 */
@Component({
  selector: 'mifosx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    FileUploadComponent,
    ThemePickerComponent,
    LanguageSelectorComponent,
    FormWorkspaceComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);
  private dates = inject(Dates);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  hasChanges = false;

  /** Date formats. */
  dateFormats: string[] = [
    'dd MMMM yyyy',
    'dd/MM/yyyy',
    'dd/MMMM/yyyy',
    'dd-MM-yyyy',
    'dd-MMMM-yyyy',
    'dd-MM-yy',
    'MM/dd/yyyy',
    'MMMM-dd-yyyy',
    'MMMM dd yyyy',
    'MMMM/dd/yyyy',
    'MM-dd-yy',
    'yyyy-MM-dd'
  ];
  datetimeFormats: string[] = [
    'dd MMMM yyyy HH:mm:ss',
    'dd/MMMM/yyyy HH:mm:ss',
    'dd-MMMM-yyyy HH:mm:ss',
    'dd-MM-yy HH:mm:ss',
    'MMMM-dd-yyyy HH:mm:ss',
    'MMMM dd yyyy HH:mm:ss',
    'MMMM/dd/yyyy HH:mm:ss',
    'MM-dd-yy HH:mm:ss',
    'yyyy-MM-dd HH:mm:ss',
    'dd MMMM yyyy HH:mm',
    'dd/MMMM/yyyy HH:mm',
    'dd-MMMM-yyyy HH:mm',
    'dd-MM-yy HH:mm',
    'MMMM-dd-yyyy HH:mm',
    'MMMM dd yyyy HH:mm',
    'MMMM/dd/yyyy HH:mm',
    'MM-dd-yy HH:mm',
    'yyyy-MM-dd HH:mm'
  ];
  /** Decimals. */
  decimals: string[] = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8'
  ];

  /** Date Format Setting */
  dateFormat = new FormControl('');
  /** Datetime Format Setting */
  datetimeFormat = new FormControl('');
  /** Decimals to Display Setting */
  decimalsToDisplay = new FormControl('');

  private initialValues: {
    dateFormat: string;
    datetimeFormat: string;
    decimals: string;
  };

  private readonly previewSample = 1234.56789;

  ngOnInit() {
    this.initialValues = {
      dateFormat: this.settingsService.dateFormat,
      datetimeFormat: this.settingsService.datetimeFormat,
      decimals: this.settingsService.decimals
    };
    this.dateFormat.patchValue(this.initialValues.dateFormat, { emitEvent: false });
    this.datetimeFormat.patchValue(this.initialValues.datetimeFormat, { emitEvent: false });
    this.decimalsToDisplay.patchValue(this.initialValues.decimals, { emitEvent: false });
    this.trackChanges();
  }

  get dateFormatPreview(): string {
    const format = this.dateFormat.value;
    return format ? (this.dates.formatDate(new Date(), format) ?? '') : '';
  }

  get datetimeFormatPreview(): string {
    const format = this.datetimeFormat.value;
    return format ? (this.dates.formatDate(new Date(), format) ?? '') : '';
  }

  get decimalsPreview(): string {
    const decimals = Number(this.decimalsToDisplay.value ?? this.initialValues?.decimals ?? '2');
    if (Number.isNaN(decimals)) {
      return '';
    }
    return this.previewSample.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  trackChanges(): void {
    merge(this.dateFormat.valueChanges, this.datetimeFormat.valueChanges, this.decimalsToDisplay.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.hasChanges = this.hasFormChanged();
        this.cdr.markForCheck();
      });
  }

  private hasFormChanged(): boolean {
    return (
      (this.dateFormat.value ?? '') !== this.initialValues.dateFormat ||
      (this.datetimeFormat.value ?? '') !== this.initialValues.datetimeFormat ||
      (this.decimalsToDisplay.value ?? '') !== this.initialValues.decimals
    );
  }

  reset(): void {
    this.dateFormat.patchValue(this.initialValues.dateFormat, { emitEvent: false });
    this.datetimeFormat.patchValue(this.initialValues.datetimeFormat, { emitEvent: false });
    this.decimalsToDisplay.patchValue(this.initialValues.decimals, { emitEvent: false });
    this.hasChanges = false;
    this.cdr.markForCheck();
  }

  submit(): void {
    this.settingsService.setDateFormat(this.dateFormat.value ?? this.initialValues.dateFormat);
    this.settingsService.setDatetimeFormat(this.datetimeFormat.value ?? this.initialValues.datetimeFormat);
    this.settingsService.setDecimalToDisplay(this.decimalsToDisplay.value ?? this.initialValues.decimals);
    this.initialValues = {
      dateFormat: this.dateFormat.value ?? '',
      datetimeFormat: this.datetimeFormat.value ?? '',
      decimals: this.decimalsToDisplay.value ?? ''
    };
    this.hasChanges = false;
    this.cdr.markForCheck();
    this.alertService.alert({
      type: 'Settings Update',
      message: this.translateService.instant('labels.text.Settings saved successfully')
    });
  }
}
