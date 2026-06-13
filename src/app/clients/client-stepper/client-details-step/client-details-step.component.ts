/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs/operators';
import { MatCheckbox } from '@angular/material/checkbox';
import { ClientsService } from 'app/clients/clients.service';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { ExternalNationalIdService } from 'app/clients/services/external-national-id.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-client-details-step',
  templateUrl: './client-details-step.component.html',
  styleUrls: ['../client-step-form.scss'],
  providers: [ExternalNationalIdService],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientDetailsStepComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private clientService = inject(ClientsService);
  externalNationalIdService = inject(ExternalNationalIdService);
  private destroyRef = inject(DestroyRef);

  readonly LegalFormId = LegalFormId;

  @Input() clientTemplate: any;
  @Output() legalFormChangeEvent = new EventEmitter<{ legalForm: number }>();

  clientDetailsForm: FormGroup;
  officeOptions: any;
  staffOptions: any;
  legalFormOptions: any;

  constructor() {
    this.clientDetailsForm = this.formBuilder.group({
      officeId: [
        '',
        Validators.required
      ],
      legalFormId: [
        LegalFormId.PERSON,
        Validators.required
      ],
      externalId: [''],
      staffId: [''],
      isStaff: [false]
    });
  }

  ngOnInit() {
    this.officeOptions = this.clientTemplate.officeOptions;
    this.staffOptions = this.clientTemplate.staffOptions;
    this.legalFormOptions = this.clientTemplate.clientLegalFormOptions;
    this.buildDependencies();
  }

  buildDependencies() {
    this.clientDetailsForm
      .get('legalFormId')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((legalFormId: number) => {
        this.legalFormChangeEvent.emit({ legalForm: legalFormId });
      });

    this.clientDetailsForm
      .get('officeId')
      .valueChanges.pipe(
        filter((officeId: number) => !!officeId),
        switchMap((officeId: number) => this.clientService.getClientWithOfficeTemplate(officeId)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((clientTemplate: any) => {
        this.staffOptions = clientTemplate.staffOptions;
      });
  }

  get clientDetails() {
    return this.clientDetailsForm.getRawValue();
  }
}
