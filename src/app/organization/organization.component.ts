/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, AfterViewInit, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';

/** Custom Services */
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NavHubComponent, NavHubSection } from '../shared/nav-hub/nav-hub.component';
import { ConfigWizardStepComponent } from '../configuration-wizard/config-wizard-step/config-wizard-step.component';

/**
 * Organization component.
 */
@Component({
  selector: 'mifosx-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NavHubComponent,
    ConfigWizardStepComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements AfterViewInit {
  private router = inject(Router);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);

  /* Template for popover on manage offices */
  @ViewChild('templateOffice') templateOffice: TemplateRef<any>;
  /* Template for popover on add/edit currency */
  @ViewChild('templateAddEditCurrency') templateAddEditCurrency: TemplateRef<any>;
  /* Template for popover on manage holidays */
  @ViewChild('templateHolidays') templateHolidays: TemplateRef<any>;
  /* Template for popover on manage employee */
  @ViewChild('templateEmployee') templateEmployee: TemplateRef<any>;
  /* Template for popover on define working days */
  @ViewChild('templateWorkingDays') templateWorkingDays: TemplateRef<any>;
  /* Template for popover on manage funds */
  @ViewChild('templateManageFunds') templateManageFunds: TemplateRef<any>;

  readonly sections: NavHubSection[] = [
    {
      label: 'labels.heading.Structure and Staff',
      items: [
        {
          label: 'labels.heading.Manage Offices',
          description: 'labels.text.Add new office or modify or deactivate office',
          icon: 'apartment',
          link: '/organization/offices',
          permission: 'READ_OFFICE',
          anchorId: 'wizard-offices'
        },
        {
          label: 'labels.heading.Manage Employees',
          description: 'labels.text.Employee represents loan officers',
          icon: 'badge',
          link: '/organization/employees',
          permission: 'READ_STAFF',
          anchorId: 'wizard-employees'
        },
        {
          label: 'labels.heading.Manage Holidays',
          description: 'labels.text.Define holidays for office',
          icon: 'event',
          link: '/organization/holidays',
          permission: 'READ_HOLIDAY',
          anchorId: 'wizard-holidays'
        },
        {
          label: 'labels.heading.Working Days',
          description: 'labels.text.Working days and configure behaviour of payments',
          icon: 'date_range',
          link: '/organization/working-days',
          permission: 'READ_WORKINGDAYS',
          anchorId: 'wizard-working-days'
        }
      ]
    },
    {
      label: 'labels.heading.Loans and Funds',
      items: [
        {
          label: 'labels.heading.Manage Funds',
          description: 'labels.text.Funds are associated with loans',
          icon: 'account_balance_wallet',
          link: '/organization/manage-funds',
          permission: 'READ_FUND',
          anchorId: 'wizard-manage-funds'
        },
        {
          label: 'labels.heading.Fund Mapping',
          description: 'labels.text.Bulk entry screen for mapping',
          icon: 'swap_horiz',
          link: '/organization/fund-mapping',
          permission: 'READ_OFFICE'
        },
        {
          label: 'labels.heading.Manage Loan Originators',
          description: 'labels.text.Loan Originators are associated with loan accounts',
          icon: 'support_agent',
          link: '/organization/manage-loan-originators',
          permission: 'READ_LOAN_ORIGINATOR'
        },
        {
          label: 'labels.heading.Bulk Loan Reassignment',
          description: 'labels.text.Easy way to reassign all the loan',
          icon: 'sync_alt',
          link: '/organization/bulkloan',
          permission: 'BULKREASSIGN_LOAN'
        },
        {
          label: 'labels.heading.Loan Provisioning Criteria',
          description: 'labels.text.Loan Provisioning Criteria Organization',
          icon: 'edit_note',
          link: '/organization/provisioning-criteria',
          permission: 'VIEW_PROVISIONS'
        },
        {
          label: 'labels.text.Investors',
          description: 'labels.text.View the loan account details associated with the investors',
          icon: 'business_center',
          link: '/organization/investors',
          permission: 'READ_OFFICE'
        },
        {
          label: 'labels.heading.Standing Instructions History',
          description: 'labels.text.View logged history',
          icon: 'history_edu',
          link: '/organization/standing-instructions-history',
          permission: 'READ_STANDINGINSTRUCTION'
        }
      ]
    },
    {
      label: 'labels.heading.Payments and Cash',
      items: [
        {
          label: 'labels.heading.Currency Configuration',
          description: 'labels.text.Currencies available across organization',
          icon: 'currency_exchange',
          link: '/organization/currencies',
          permission: 'READ_CURRENCY',
          anchorId: 'wizard-currencies'
        },
        {
          label: 'labels.heading.Payment Type',
          description: 'labels.text.Manage payment types',
          icon: 'credit_card',
          link: '/organization/payment-types',
          permission: 'READ_PAYMENTTYPE'
        },
        {
          label: 'labels.heading.Teller / Cashier Management',
          description: 'labels.text.Manage Tellers / Cashiers',
          icon: 'point_of_sale',
          link: '/organization/tellers',
          permission: 'READ_TELLER'
        }
      ]
    },
    {
      label: 'labels.heading.Tools',
      items: [
        {
          label: 'labels.heading.Bulk Import',
          description: 'labels.text.Bulk data import using excel spreadsheet templates',
          icon: 'upload_file',
          link: '/organization/bulk-import',
          permission: 'VIEW_BULKIMPORT'
        },
        {
          label: 'labels.heading.SMS Campaigns',
          description: 'labels.text.Define SMS Campaigns for Organization',
          icon: 'sms',
          link: '/organization/sms-campaigns',
          permission: 'VIEW_SMSCAMPAIGNS'
        },
        {
          label: 'labels.heading.AdHocQuery',
          description: 'labels.text.Define AdHocQuery for Organization',
          icon: 'query_stats',
          link: '/organization/adhoc-query',
          permission: 'VIEW_ADHOC'
        },
        {
          label: 'labels.heading.Password Preferences',
          description: 'labels.text.The usage of stronger passwords',
          icon: 'lock',
          link: '/organization/password-preferences',
          permission: 'READ_PASSWORD_VALIDATION_POLICY'
        },
        {
          label: 'labels.heading.Entity Data Table Checks',
          description: 'labels.text.Entity Data Table Checks Organization',
          icon: 'checklist',
          link: '/organization/entity-data-table-checks',
          permission: 'READ_ENTITY_DATATABLE_CHECK'
        }
      ]
    }
  ];

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  closeConfigWizard(): void {
    this.configurationWizardService.closeConfigWizard();
  }

  /**
   * Configuration wizard popovers, anchored to the hub cards by element id.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showCreateOffice) {
      this.showWizardPopover(this.templateOffice, 'wizard-offices');
    }
    if (this.configurationWizardService.showAddEditCurrency) {
      this.showWizardPopover(this.templateAddEditCurrency, 'wizard-currencies');
    }
    if (this.configurationWizardService.showCreateHoliday) {
      this.showWizardPopover(this.templateHolidays, 'wizard-holidays');
    }
    if (this.configurationWizardService.showCreateEmployee) {
      this.showWizardPopover(this.templateEmployee, 'wizard-employees');
    }
    if (this.configurationWizardService.showDefineWorkingDays) {
      this.showWizardPopover(this.templateWorkingDays, 'wizard-working-days');
    }
    if (this.configurationWizardService.showManageFunds) {
      this.showWizardPopover(this.templateManageFunds, 'wizard-manage-funds');
    }
  }

  private showWizardPopover(template: TemplateRef<any>, anchorId: string): void {
    setTimeout(() => {
      const target = document.getElementById(anchorId);
      if (target) {
        this.showPopover(template, target, 'bottom', true);
      }
    });
  }

  /**
   * Next Step (Manage Offices Page) Configuration Wizard.
   */
  nextStepOffice() {
    this.configurationWizardService.showCreateOffice = false;
    this.configurationWizardService.showOfficeList = true;
    this.router.navigate(['/organization/offices']);
  }

  /**
   * Previous Step (Home component) Configuration Wizard.
   */
  previousStepOffice() {
    this.configurationWizardService.showCreateOffice = false;
    this.configurationWizardService.showHomeSearchActivity = true;
    this.router.navigate(['/home']);
  }

  /**
   * Next Step (Add/Edit Currency Page) Configuration Wizard.
   */
  nextStepAddEditCurrency() {
    this.configurationWizardService.showAddEditCurrency = false;
    this.configurationWizardService.showCurrencyPage = true;
    this.router.navigate(['/organization/currencies']);
  }

  /**
   * Previous Step (Office Form) Configuration Wizard.
   */
  previousStepAddEditCurrency() {
    this.configurationWizardService.showAddEditCurrency = false;
    this.configurationWizardService.showOfficeForm = true;
    this.router.navigate(['/organization/offices/create']);
  }

  /**
   * Next Step (manage Holidays Page) Configuration Wizard.
   */
  nextStepHolidays() {
    this.configurationWizardService.showCreateHoliday = false;
    this.configurationWizardService.showHolidayPage = true;
    this.router.navigate(['/organization/holidays']);
  }

  /**
   * Previous Step (Currency Form) Configuration Wizard.
   */
  previousStepHolidays() {
    this.configurationWizardService.showCreateHoliday = false;
    this.configurationWizardService.showCurrencyForm = true;
    this.router.navigate(['/organization/currencies/manage']);
  }

  /**
   * Next Step (Manage Employees Page) Configuration Wizard.
   */
  nextStepEmployee() {
    this.configurationWizardService.showCreateEmployee = false;
    this.configurationWizardService.showEmployeeList = true;
    this.router.navigate(['/organization/employees']);
  }

  /**
   * Previous Step (Holiday Form) Configuration Wizard.
   */
  previousStepEmployee() {
    this.configurationWizardService.showCreateEmployee = false;
    this.configurationWizardService.showHolidayFilter = true;
    this.router.navigate(['/organization/holidays']);
  }

  /**
   * Next Step (Define Working Days Page) Configuration Wizard.
   */
  nextStepWorkingDays() {
    this.router.navigate(['/organization/working-days']);
  }

  /**
   * Previous Step (Employee Form) Configuration Wizard.
   */
  previousStepWorkingDays() {
    this.configurationWizardService.showDefineWorkingDays = false;
    this.configurationWizardService.showEmployeeForm = true;
    this.router.navigate(['/organization/employees/create']);
  }

  /**
   * Next Step (Manage Funds Page) Configuration Wizard.
   */
  nextStepManageFunds() {
    this.router.navigate(['/organization/manage-funds']);
  }

  /**
   * Previous Step (Recurring Deposit Page) Configuration Wizard.
   */
  previousStepManageFunds() {
    this.configurationWizardService.showManageFunds = false;
    this.configurationWizardService.showRecurringDepositProductsList = true;
    this.router.navigate(['/products/recurring-deposit-products']);
  }
}
