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
 * Products component.
 */
@Component({
  selector: 'mifosx-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NavHubComponent,
    ConfigWizardStepComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements AfterViewInit {
  private router = inject(Router);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);

  /* Template for popover on charges */
  @ViewChild('templateCharges') templateCharges: TemplateRef<any>;
  /* Template for popover on loan products */
  @ViewChild('templateLoanProducts') templateLoanProducts: TemplateRef<any>;
  /* Template for popover on savings products */
  @ViewChild('templateSavingsProducts') templateSavingsProducts: TemplateRef<any>;
  /* Template for popover on share products */
  @ViewChild('templateShareProducts') templateShareProducts: TemplateRef<any>;
  /* Template for popover on fixed deposit products */
  @ViewChild('templateFixedDepositProducts') templateFixedDepositProducts: TemplateRef<any>;
  /* Template for popover on recurring deposit products */
  @ViewChild('templateRecurringDepositProducts') templateRecurringDepositProducts: TemplateRef<any>;

  readonly sections: NavHubSection[] = [
    {
      label: 'labels.heading.Loans',
      items: [
        {
          label: 'labels.heading.Loan Products',
          description: 'labels.text.Add new loan product or modify or inactivate loan product',
          icon: 'request_quote',
          link: '/products/loan-products',
          queryParams: { productType: 'loan' },
          permission: 'READ_LOANPRODUCT',
          anchorId: 'wizard-loan-products'
        },
        {
          label: 'labels.heading.Collateral Management',
          description: 'labels.text.Define collaterals for Collateral Management',
          icon: 'diamond',
          link: '/products/collaterals'
        },
        {
          label: 'labels.heading.Delinquency Buckets',
          description: 'labels.text.Define delinquency day ranges and bucket set for loan products',
          icon: 'stacked_bar_chart',
          link: '/products/delinquency-bucket-configurations',
          permission: 'READ_DELINQUENCY_BUCKET'
        },
        {
          label: 'labels.heading.Breach Configuration',
          description: 'labels.text.Define breaches for working capital products',
          icon: 'warning',
          link: '/products/breach-configurations',
          permission: 'READ_WORKINGCAPITALBREACH'
        },
        {
          label: 'labels.heading.Near Breach Configuration',
          description: 'labels.text.Define near breaches for working capital products',
          icon: 'notification_important',
          link: '/products/near-breach-configurations',
          permission: 'READ_WORKINGCAPITALNEARBREACH'
        }
      ]
    },
    {
      label: 'labels.heading.Deposits and Shares',
      items: [
        {
          label: 'labels.heading.Savings Products',
          description: 'labels.text.Add new savings product or modify or inactivate savings product',
          icon: 'savings',
          link: '/products/saving-products',
          permission: 'READ_SAVINGSPRODUCT',
          anchorId: 'wizard-savings-products'
        },
        {
          label: 'labels.heading.Fixed Deposit Products',
          description: 'labels.text.Add, modify or inactivate a Fixed deposit product',
          icon: 'lock_clock',
          link: '/products/fixed-deposit-products',
          permission: 'READ_FIXEDDEPOSITPRODUCT',
          anchorId: 'wizard-fixed-deposit-products'
        },
        {
          label: 'labels.heading.Recurring Deposit Products',
          description: 'labels.text.Add, modify or inactivate a Recurring Deposit product',
          icon: 'autorenew',
          link: '/products/recurring-deposit-products',
          permission: 'READ_RECURRINGDEPOSITPRODUCT',
          anchorId: 'wizard-recurring-deposit-products'
        },
        {
          label: 'labels.heading.Share Products',
          description: 'labels.text.Add new share product or modify or inactivate share product',
          icon: 'pie_chart',
          link: '/products/share-products',
          permission: 'READ_SHAREPRODUCT',
          anchorId: 'wizard-share-products'
        }
      ]
    },
    {
      label: 'labels.heading.Pricing and Rules',
      items: [
        {
          label: 'labels.heading.Charges',
          description: 'labels.text.Define charges/penalties for loan products, savings and deposit products',
          icon: 'receipt_long',
          link: '/products/charges',
          permission: 'READ_CHARGE',
          anchorId: 'wizard-charges'
        },
        {
          label: 'labels.heading.Floating Rates',
          description: 'labels.text.Define floating rates for loan products',
          icon: 'percent',
          link: '/products/floating-rates',
          permission: 'READ_FLOATINGRATE'
        },
        {
          label: 'labels.heading.Manage Tax Configurations',
          description: 'labels.text.Define Tax components and Tax groups',
          icon: 'calculate',
          link: '/products/tax-configurations',
          permission: 'READ_TAXGROUP'
        },
        {
          label: 'labels.heading.Products Mix',
          description: 'labels.text.Defines rules for taking multiple rules',
          icon: 'shuffle',
          link: '/products/products-mix',
          permission: 'READ_PRODUCTMIX'
        }
      ]
    }
  ];

  /**
   * Configuration wizard popovers, anchored to the hub cards by element id.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showCharges) {
      this.showWizardPopover(this.templateCharges, 'wizard-charges');
    }
    if (this.configurationWizardService.showLoanProducts) {
      this.showWizardPopover(this.templateLoanProducts, 'wizard-loan-products');
    }
    if (this.configurationWizardService.showSavingsProducts) {
      this.showWizardPopover(this.templateSavingsProducts, 'wizard-savings-products');
    }
    if (this.configurationWizardService.showShareProducts) {
      this.showWizardPopover(this.templateShareProducts, 'wizard-share-products');
    }
    if (this.configurationWizardService.showFixedDepositProducts) {
      this.showWizardPopover(this.templateFixedDepositProducts, 'wizard-fixed-deposit-products');
    }
    if (this.configurationWizardService.showRecurringDepositProducts) {
      this.showWizardPopover(this.templateRecurringDepositProducts, 'wizard-recurring-deposit-products');
    }
  }

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

  private showWizardPopover(template: TemplateRef<any>, anchorId: string): void {
    setTimeout(() => {
      const target = document.getElementById(anchorId);
      if (target) {
        this.showPopover(template, target, 'bottom', true);
      }
    });
  }

  /**
   * Next Step (Charges Page) Configuration Wizard.
   */
  nextStepCharges() {
    this.configurationWizardService.showCharges = false;
    this.configurationWizardService.showChargesPage = true;
    this.router.navigate(['/products/charges']);
  }

  /**
   * Previous Step (Create journal entry Page) Configuration Wizard.
   */
  previousStepCharges() {
    this.configurationWizardService.showCharges = false;
    this.configurationWizardService.showCreateJournalEntries = true;
    this.router.navigate(['/accounting/journal-entries/create']);
  }

  /**
   * Next Step (Loan Products Page) Configuration Wizard.
   */
  nextStepLoanProducts() {
    this.configurationWizardService.showLoanProducts = false;
    this.configurationWizardService.showLoanProductsPage = true;
    this.router.navigate(['/products/loan-products']);
  }

  /**
   * Previous Step (Charges Page) Configuration Wizard.
   */
  previousStepLoanProducts() {
    this.configurationWizardService.showLoanProducts = false;
    this.configurationWizardService.showChargesList = true;
    this.router.navigate(['/products/charges']);
  }

  /**
   * Next Step (Savings Products Page) Configuration Wizard.
   */
  nextStepSavingsProducts() {
    this.configurationWizardService.showSavingsProducts = false;
    this.configurationWizardService.showSavingsProductsPage = true;
    this.router.navigate(['/products/saving-products']);
  }

  /**
   * Previous Step (Savings Page) Configuration Wizard.
   */
  previousStepSavingsProducts() {
    this.configurationWizardService.showSavingsProducts = false;
    this.configurationWizardService.showLoanProductsList = true;
    this.router.navigate(['/products/loan-products']);
  }

  /**
   * Next Step (Share Products Page) Configuration Wizard.
   */
  nextStepShareProducts() {
    this.configurationWizardService.showShareProducts = false;
    this.configurationWizardService.showShareProductsPage = true;
    this.router.navigate(['/products/share-products']);
  }

  /**
   * Previous Step (Savings Products Page) Configuration Wizard.
   */
  previousStepShareProducts() {
    this.configurationWizardService.showShareProducts = false;
    this.configurationWizardService.showSavingsProductsList = true;
    this.router.navigate(['/products/saving-products']);
  }

  /**
   * Next Step (Fixed Deposit Products Page) Configuration Wizard.
   */
  nextStepFixedDepositProducts() {
    this.configurationWizardService.showFixedDepositProducts = false;
    this.configurationWizardService.showFixedDepositProductsPage = true;
    this.router.navigate(['/products/fixed-deposit-products']);
  }

  /**
   * Previous Step (Share Products Page) Configuration Wizard.
   */
  previousStepFixedDepositProducts() {
    this.configurationWizardService.showFixedDepositProducts = false;
    this.configurationWizardService.showShareProductsList = true;
    this.router.navigate(['/products/share-products']);
  }

  /**
   * Next Step (Recurring Deposit Products Page) Configuration Wizard.
   */
  nextStepRecurringDepositProducts() {
    this.configurationWizardService.showRecurringDepositProducts = false;
    this.configurationWizardService.showRecurringDepositProductsPage = true;
    this.router.navigate(['/products/recurring-deposit-products']);
  }

  /**
   * Previous Step (Fixed Deposit Products Page) Configuration Wizard.
   */
  previousStepRecurringDepositProducts() {
    this.configurationWizardService.showRecurringDepositProducts = false;
    this.configurationWizardService.showFixedDepositProductsList = true;
    this.router.navigate(['/products/fixed-deposit-products']);
  }
}
