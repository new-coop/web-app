/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { LongTextComponent } from '../../../shared/long-text/long-text.component';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { LoanSummaryBalanceComponentComponent } from './loan-summary-balance-component/loan-summary-balance-component.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import {
  resolveStatusBadgeConfig,
  statusKpiIconName,
  StatusBadgeSeverity
} from '../../../shared/ui/status-badge/status-badge.utils';
import { M3IconComponent } from '../../../shared/m3-ui/m3-icon/m3-icon.component';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass,
    RouterLink,
    MatButtonModule,
    ExternalIdentifierComponent,
    LongTextComponent,
    CurrencyPipe,
    DateFormatPipe,
    FormatNumberPipe,
    LoanSummaryBalanceComponentComponent,
    StatusBadgeComponent,
    M3IconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralTabComponent extends LoanProductBaseComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  currencyCode: string | null = null;
  loanDetails: any;
  status: string | undefined;

  loanDetailsTableData: { key: string; value?: string | number }[] = [];
  hasChargeBack = false;

  sectionNav: { id: string; label: string; icon: string }[] = [];
  activeSection = '';
  private sectionObserver: IntersectionObserver | null = null;

  constructor() {
    super();
    const productType = this.route.snapshot.queryParamMap.get('productType') || null;
    if (productType) {
      this.loanProductService.initialize(productType);
    }
    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
      this.currencyCode = this.loanDetails.currency.code;
      this.status = this.loanDetails.status?.value;
      if (this.loanDetails.transactions) {
        this.hasChargeBack = this.loanDetails.transactions.some(
          (transaction: any) => transaction.type.code === 'loanTransactionType.chargeback'
        );
      }
      if (this.loanDetails.summary) {
        this.setloanDetailsTableData();
      } else {
        this.setloanNonDetailsTableData();
      }
      this.buildSectionNav();
      this.cdr.markForCheck();
      setTimeout(() => this.observeSections(), 0);
    });
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.sectionObserver?.disconnect());
  }

  ngAfterViewInit(): void {
    this.observeSections();
  }

  isAmountKey(key: string): boolean {
    return key === 'Proposed Amount' || key === 'Approved Amount' || key === 'Disburse Amount';
  }

  shouldShowDetailRow(row: { key: string; value?: string | number }): boolean {
    if (!this.loanDetails.summary && row.key === 'Status') {
      return false;
    }
    if (row.key === 'Approved Amount' && !this.showApprovedAmountBasedOnStatus()) {
      return false;
    }
    if (row.key === 'Disburse Amount' && !this.showDisbursedAmountBasedOnStatus()) {
      return false;
    }
    return true;
  }

  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private observeSections(): void {
    this.sectionObserver?.disconnect();
    if (!this.sectionNav.length) {
      return;
    }
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          this.activeSection = visible[0].target.id;
          this.cdr.markForCheck();
        }
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );
    this.sectionNav.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        this.sectionObserver?.observe(element);
      }
    });
  }

  private buildSectionNav(): void {
    const nav: { id: string; label: string; icon: string }[] = [
      {
        id: 'section-overview',
        label: this.loanDetails.summary ? 'labels.heading.Performance History' : 'labels.heading.Loan Amounts',
        icon: 'fa-chart-line'
      },
      {
        id: 'section-details',
        label: 'labels.heading.Loan Details',
        icon: 'fa-file-lines'
      }
    ];
    if (this.loanDetails.summary) {
      nav.splice(1, 0, {
        id: 'section-summary',
        label: 'labels.heading.Loan Summary',
        icon: 'fa-chart-pie'
      });
    }
    this.sectionNav = nav;
    if (!this.activeSection && nav.length) {
      this.activeSection = nav[0].id;
    }
  }

  setloanDetailsTableData(): void {
    this.loanDetailsTableData = [
      { key: 'Product Type' },
      { key: 'Product Name' },
      { key: 'Status' },
      { key: 'Disbursement Date' },
      { key: 'Currency' },
      { key: 'External Id' },
      { key: 'Proposed Amount', value: this.loanDetails.proposedPrincipal },
      { key: 'Approved Amount', value: this.loanDetails.approvedPrincipal },
      { key: 'Disburse Amount', value: this.loanDetails.principal }
    ];
    if (this.loanDetails.writeOffReason) {
      this.loanDetailsTableData.push({
        key: 'Write-off Reason',
        value: this.loanDetails.writeOffReason
      });
    }
    if (this.loanProductService.isLoanProduct) {
      this.loanDetailsTableData.push({ key: 'Loan Officer' });
      if (this.loanDetails.loanPurposeName) {
        this.loanDetailsTableData.push({ key: 'Loan Purpose' });
      }
    }
  }

  setloanNonDetailsTableData(): void {
    this.loanDetailsTableData = [
      { key: 'Product Type' },
      { key: 'Product Name' },
      { key: 'Status' },
      { key: 'Disbursement Date' },
      { key: 'Currency' },
      { key: 'External Id' }
    ];
    if (this.loanProductService.isLoanProduct) {
      this.loanDetailsTableData.push({ key: 'Loan Officer' });
      this.loanDetailsTableData.push({ key: 'Loan Purpose' });
    }
  }

  showApprovedAmountBasedOnStatus(): boolean {
    return !(
      this.status === 'Submitted and pending approval' ||
      this.status === 'Withdrawn by applicant' ||
      this.status === 'Rejected'
    );
  }

  showDisbursedAmountBasedOnStatus(): boolean {
    return !(
      this.status === 'Submitted and pending approval' ||
      this.status === 'Withdrawn by applicant' ||
      this.status === 'Rejected' ||
      this.status === 'Approved'
    );
  }

  statusKpiIconTone(): StatusBadgeSeverity {
    return resolveStatusBadgeConfig(
      this.loanDetails?.status?.code ?? '',
      this.loanDetails?.inArrears,
      this.loanDetails?.status?.value
    ).severity;
  }

  statusKpiIconName(): string {
    return statusKpiIconName(this.statusKpiIconTone());
  }

  loanProductType(): string {
    return this.loanDetails.loanType
      ? LoanProductService.productTypeLabel('loan')
      : LoanProductService.productTypeLabel('working-capital');
  }
}
