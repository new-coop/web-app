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
 * Accounting component.
 */
@Component({
  selector: 'mifosx-accounting',
  standalone: true,
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NavHubComponent,
    ConfigWizardStepComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingComponent implements AfterViewInit {
  private router = inject(Router);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);

  /* Template for popover on Chart of Accounts */
  @ViewChild('templateChartofAccounts') templateChartofAccounts: TemplateRef<any>;
  /* Template for popover on Accounts Linked */
  @ViewChild('templateAccountsLinked') templateAccountsLinked: TemplateRef<any>;
  /* Template for popover on Migrate Opening Balances */
  @ViewChild('templateMigrateOpeningBalances') templateMigrateOpeningBalances: TemplateRef<any>;
  /* Template for popover on Closing Entries */
  @ViewChild('templateClosingEntries') templateClosingEntries: TemplateRef<any>;
  /* Template for popover on Create Journal Entries */
  @ViewChild('templateCreateJournalEntries') templateCreateJournalEntries: TemplateRef<any>;

  readonly sections: NavHubSection[] = [
    {
      label: 'labels.heading.Day to day',
      items: [
        {
          label: 'labels.heading.Create Journal Entries',
          description: 'labels.text.Post a new journal entry manually',
          icon: 'add_circle',
          link: '/accounting/journal-entries/create',
          permission: 'CREATE_JOURNALENTRY',
          anchorId: 'wizard-create-journal-entries',
          featured: true
        },
        {
          label: 'labels.heading.Search Journal Entries',
          description: 'labels.text.Find past journal entries by date account or amount',
          icon: 'manage_search',
          link: '/accounting/journal-entries',
          permission: 'READ_JOURNALENTRY',
          featured: true
        },
        {
          label: 'labels.heading.Frequent Postings',
          description: 'labels.text.Apply templates for entries you post often',
          icon: 'event_repeat',
          link: '/accounting/journal-entries/frequent-postings',
          permission: 'CREATE_JOURNALENTRY'
        }
      ]
    },
    {
      label: 'labels.heading.Setup and configuration',
      items: [
        {
          label: 'labels.heading.Chart of Accounts',
          description: 'labels.text.View and manage your chart of accounts',
          icon: 'account_tree',
          link: '/accounting/chart-of-accounts',
          permission: 'READ_GLACCOUNT',
          anchorId: 'wizard-chart-of-accounts',
          featured: true
        },
        {
          label: 'labels.heading.Accounts Linked to Financial Activities',
          description: 'labels.text.Map financial activities to ledger accounts',
          icon: 'link',
          link: '/accounting/financial-activity-mappings',
          permission: 'READ_FINANCIALACTIVITYACCOUNT',
          anchorId: 'wizard-accounts-linked'
        },
        {
          label: 'labels.heading.Accounting Rules',
          description: 'labels.text.Define rules that automate journal postings',
          icon: 'list_alt',
          link: '/accounting/accounting-rules',
          permission: 'READ_ACCOUNTINGRULE'
        },
        {
          label: 'labels.heading.Migrate Opening Balances (Office-wise)',
          description: 'labels.text.Set starting balances for each office',
          icon: 'input',
          link: '/accounting/migrate-opening-balances',
          permission: 'READ_JOURNALENTRY',
          anchorId: 'wizard-migrate-opening-balances'
        }
      ]
    },
    {
      label: 'labels.heading.Month and year end',
      items: [
        {
          label: 'labels.heading.Closing Entries',
          description: 'labels.text.Close the books at the end of a period',
          icon: 'archive',
          link: '/accounting/closing-entries',
          permission: 'READ_GLCLOSURE',
          anchorId: 'wizard-closing-entries'
        },
        {
          label: 'labels.heading.Accruals',
          description: 'labels.text.Record income and expenses as they accrue',
          icon: 'trending_up',
          link: '/accounting/periodic-accruals',
          permission: 'EXECUTE_PERIODICACCRUALACCOUNTING'
        },
        {
          label: 'labels.heading.Provisioning Entries',
          description: 'labels.text.Set aside funds for expected losses',
          icon: 'inventory',
          link: '/accounting/provisioning-entries',
          permission: 'VIEW_PROVISIONING_ENTRIES'
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
    if (this.configurationWizardService.showChartofAccounts) {
      this.showWizardPopover(this.templateChartofAccounts, 'wizard-chart-of-accounts');
    }
    if (this.configurationWizardService.showAccountsLinked) {
      this.showWizardPopover(this.templateAccountsLinked, 'wizard-accounts-linked');
    }
    if (this.configurationWizardService.showMigrateOpeningBalances) {
      this.showWizardPopover(this.templateMigrateOpeningBalances, 'wizard-migrate-opening-balances');
    }
    if (this.configurationWizardService.showClosingEntries) {
      this.showWizardPopover(this.templateClosingEntries, 'wizard-closing-entries');
    }
    if (this.configurationWizardService.showCreateJournalEntries) {
      this.showWizardPopover(this.templateCreateJournalEntries, 'wizard-create-journal-entries');
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
   * Next Step (Charts of Accounts Page) Configuration Wizard.
   */
  nextStepChartofAccounts() {
    this.configurationWizardService.showChartofAccounts = false;
    this.configurationWizardService.showChartofAccountsPage = true;
    this.router.navigate(['/accounting/chart-of-accounts']);
  }

  /**
   * Previous Step (Scheduler Jobs Page) Configuration Wizard.
   */
  previousStepChartofAccounts() {
    this.configurationWizardService.showChartofAccounts = false;
    this.configurationWizardService.showSchedulerJobsList = true;
    this.router.navigate(['/system/scheduler-jobs']);
  }

  /**
   * Next Step (Accounts Linked Page) Configuration Wizard.
   */
  nextStepAccountsLinked() {
    this.configurationWizardService.showAccountsLinked = false;
    this.configurationWizardService.showAccountsLinkedPage = true;
    this.router.navigate(['/accounting/financial-activity-mappings']);
  }

  /**
   * Previous Step (Create Chart of Accounts Page) Configuration Wizard.
   */
  previousStepAccountsLinked() {
    this.configurationWizardService.showAccountsLinked = false;
    this.configurationWizardService.showChartofAccountsForm = true;
    this.router.navigate(['/accounting/chart-of-accounts/gl-accounts/create']);
  }

  /**
   * Next Step (Migrate Opening Balances) Configuration Wizard.
   */
  nextStepMigrateOpeningBalances() {
    this.router.navigate(['/accounting/migrate-opening-balances']);
  }

  /**
   * Previous Step (Accounts Linked Page) Configuration Wizard.
   */
  previousStepMigrateOpeningBalances() {
    this.configurationWizardService.showMigrateOpeningBalances = false;
    this.configurationWizardService.showAccountsLinkedList = true;
    this.router.navigate(['/accounting/financial-activity-mappings']);
  }

  /**
   * Next Step (Closing Entries Page) Configuration Wizard.
   */
  nextStepClosingEntries() {
    this.configurationWizardService.showClosingEntries = false;
    this.configurationWizardService.showClosingEntriesPage = true;
    this.router.navigate(['/accounting/closing-entries']);
  }

  /**
   * Previous Step (Migrate Opening Balances Page) Configuration Wizard.
   */
  previousStepClosingEntries() {
    this.configurationWizardService.showClosingEntries = false;
    this.configurationWizardService.showMigrateOpeningBalances = true;
    this.router.navigate(['/accounting/migrate-opening-balances']);
  }

  /**
   * Next Step (Create Journal Entries Page) Configuration Wizard.
   */
  nextStepCreateJournalEntries() {
    this.router.navigate(['/accounting/journal-entries/create']);
  }

  /**
   * Previous Step (Closing Entries Page) Configuration Wizard.
   */
  previousStepCreateJournalEntries() {
    this.configurationWizardService.showCreateJournalEntries = false;
    this.configurationWizardService.showClosingEntriesList = true;
    this.router.navigate(['/accounting/closing-entries']);
  }
}
