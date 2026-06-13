/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  QueryList,
  ViewChild,
  ViewChildren,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { ClientsService } from '../clients.service';
import { Dates } from 'app/core/utils/dates';

/** Custom Components */
import { ClientDetailsStepComponent } from '../client-stepper/client-details-step/client-details-step.component';
import { ClientPersonalStepComponent } from '../client-stepper/client-personal-step/client-personal-step.component';
import { ClientContactStepComponent } from '../client-stepper/client-contact-step/client-contact-step.component';
import { ClientAccountStepComponent } from '../client-stepper/client-account-step/client-account-step.component';
import { ClientFamilyMembersStepComponent } from '../client-stepper/client-family-members-step/client-family-members-step.component';
import { ClientAddressStepComponent } from '../client-stepper/client-address-step/client-address-step.component';
import { ClientDatatableStepComponent } from '../client-stepper/client-datatable-step/client-datatable-step.component';
import { ClientPreviewStepComponent } from '../client-stepper/client-preview-step/client-preview-step.component';
import { buildClientGeneralDetails } from '../client-stepper/client-stepper.utils';
import { LegalFormId } from '../models/legal-form.enum';
import {
  CreateClientStep,
  CREATE_CLIENT_CORE_SECTIONS,
  CREATE_CLIENT_SECTION_LABELS
} from '../models/create-client-step.enum';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Client Component.
 */
@Component({
  selector: 'mifosx-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    ClientDetailsStepComponent,
    ClientPersonalStepComponent,
    ClientContactStepComponent,
    ClientAccountStepComponent,
    ClientFamilyMembersStepComponent,
    ClientAddressStepComponent,
    ClientDatatableStepComponent,
    ClientPreviewStepComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateClientComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  readonly CreateClientStep = CreateClientStep;
  readonly sectionLabels = CREATE_CLIENT_SECTION_LABELS;

  @ViewChild('clientDetails') clientDetailsStep: ClientDetailsStepComponent;
  @ViewChild('clientPersonal') clientPersonalStep: ClientPersonalStepComponent;
  @ViewChild('clientContact') clientContactStep: ClientContactStepComponent;
  @ViewChild('clientAccount') clientAccountStep: ClientAccountStepComponent;
  @ViewChild('clientFamily') clientFamilyMembersStep: ClientFamilyMembersStepComponent;
  @ViewChild('clientAddress') clientAddressStep: ClientAddressStepComponent;
  @ViewChildren('dtclient') clientDatatables: QueryList<ClientDatatableStepComponent>;

  datatables: any = [];
  legalFormType = LegalFormId.PERSON;
  previewMode = false;

  clientTemplate: any;
  clientAddressFieldConfig: any;

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { clientTemplate: any; clientAddressFieldConfig: any }) => {
        this.clientTemplate = data.clientTemplate;
        this.clientAddressFieldConfig = data.clientAddressFieldConfig;
        this.setDatatables();
        this.cdr.markForCheck();
      });
  }

  get visibleSections(): CreateClientStep[] {
    const sections = [...CREATE_CLIENT_CORE_SECTIONS];
    if (this.clientTemplate?.isAddressEnabled) {
      sections.push(CreateClientStep.Address);
    }
    return sections;
  }

  get clientDetailsForm() {
    return this.clientDetailsStep?.clientDetailsForm;
  }

  get clientPersonalForm() {
    return this.clientPersonalStep?.clientPersonalForm;
  }

  get clientContactForm() {
    return this.clientContactStep?.clientContactForm;
  }

  get clientAccountForm() {
    return this.clientAccountStep?.clientAccountForm;
  }

  get clientFormValid() {
    if (!this.clientDetailsForm || !this.clientPersonalForm || !this.clientContactForm || !this.clientAccountForm) {
      return false;
    }

    return (
      this.clientDetailsForm.valid &&
      this.clientPersonalForm.valid &&
      this.clientContactForm.valid &&
      this.clientAccountForm.valid
    );
  }

  get clientGeneralDetails() {
    if (!this.clientDetailsStep || !this.clientPersonalStep || !this.clientContactStep || !this.clientAccountStep) {
      return {};
    }

    return buildClientGeneralDetails(
      {
        ...this.clientDetailsStep.clientDetails,
        ...this.clientPersonalStep.clientPersonal,
        ...this.clientContactStep.clientContact,
        ...this.clientAccountStep.clientAccount
      },
      this.dateUtils,
      this.settingsService
    );
  }

  get client() {
    if (!this.clientFamilyMembersStep) {
      return this.clientGeneralDetails;
    }

    if (this.clientTemplate?.isAddressEnabled && this.clientAddressStep) {
      return {
        ...this.clientGeneralDetails,
        ...this.clientFamilyMembersStep.familyMembers,
        ...this.clientAddressStep.address
      };
    }

    return {
      ...this.clientGeneralDetails,
      ...this.clientFamilyMembersStep.familyMembers
    };
  }

  areFormvalids(): boolean {
    if (!this.clientFormValid) {
      return false;
    }

    let areValids = true;
    if (this.clientTemplate?.isAddressEnabled && this.clientAddressStep) {
      areValids = this.clientAddressStep.address.address.length > 0;
    }
    if (this.clientTemplate?.datatables?.length > 0 && this.clientDatatables) {
      this.clientDatatables.forEach((clientDatatable: ClientDatatableStepComponent) => {
        areValids = areValids && clientDatatable.datatableForm.valid;
      });
    }

    return areValids;
  }

  setDatatables(): void {
    this.datatables = [];
    const legalFormTypeVal = this.legalFormType === LegalFormId.ENTITY ? 'entity' : 'person';
    if (this.clientTemplate?.datatables) {
      this.clientTemplate.datatables.forEach((datatable: any) => {
        if (datatable.entitySubType.toLowerCase() === legalFormTypeVal) {
          this.datatables.push(datatable);
        }
      });
    }
  }

  legalFormChange(eventData: { legalForm: number }) {
    this.legalFormType = eventData.legalForm;
    this.setDatatables();
    this.previewMode = false;
  }

  openPreview(): void {
    if (this.areFormvalids()) {
      this.previewMode = true;
      this.cdr.markForCheck();
    }
  }

  closePreview(): void {
    this.previewMode = false;
    this.cdr.markForCheck();
  }

  submit() {
    if (!this.areFormvalids()) {
      return;
    }

    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const clientData: Record<string, any> = {
      ...this.client,
      dateFormat,
      locale
    };

    if (this.clientTemplate.datatables && this.clientTemplate.datatables.length > 0) {
      const datatables: any[] = [];
      this.clientDatatables.forEach((clientDatatable: ClientDatatableStepComponent) => {
        datatables.push(clientDatatable.payload);
      });
      if (datatables.length > 0) {
        clientData['datatables'] = datatables;
      }
    }

    this.clientsService.createClient(clientData).subscribe((response: any) => {
      this.previewMode = false;
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
