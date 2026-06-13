/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { FaIconComponent } from 'app/shared/icons/fa-icon.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

Chart.register(...registerables);

interface LoanKpiCard {
  labelKey: string;
  icon: string;
  theme: 'navy' | 'gold' | 'green' | 'slate';
  displayValue: string;
  showProgress?: boolean;
  alert?: boolean;
}

/**
 * Loan Account Dashboard Component
 * Displays graphical analysis and metrics for a specific loan account
 */
@Component({
  selector: 'mifosx-loan-account-dashboard',
  standalone: true,
  templateUrl: './loan-account-dashboard.component.html',
  styleUrls: ['./loan-account-dashboard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanAccountDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly locale = inject(LOCALE_ID);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  private viewReady = false;
  private dataReady = false;

  @ViewChild('statusChart', { static: false }) statusChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentsChart', { static: false }) paymentsChartCanvas!: ElementRef<HTMLCanvasElement>;

  private statusChart: any = null;
  private paymentsChart: any = null;
  private initTimeout: number | null = null;

  loanData: any;
  loanId = '';
  currencyCode = 'USD';

  principalAmount = 0;
  totalRepaid = 0;
  outstandingBalance = 0;
  interestCharged = 0;
  totalExpected = 0;
  progressPercentage = 0;

  get hasPaymentPeriods(): boolean {
    return (this.loanData?.repaymentSchedule?.periods ?? []).some((period: any) => period.period && period.period > 0);
  }

  kpiCards: LoanKpiCard[] = [
    { labelKey: 'labels.inputs.Principal Amount', icon: 'hand-holding-usd', theme: 'gold', displayValue: '—' },
    {
      labelKey: 'labels.inputs.Total Repaid',
      icon: 'check-circle',
      theme: 'green',
      displayValue: '—',
      showProgress: true
    },
    { labelKey: 'labels.inputs.Outstanding Balance', icon: 'money-bill-alt', theme: 'navy', displayValue: '—' },
    { labelKey: 'labels.inputs.Interest Charged', icon: 'percent', theme: 'slate', displayValue: '—' }
  ];

  ngOnInit(): void {
    this.loanId = this.route.parent?.snapshot.paramMap.get('loanId') || '';

    this.route.parent?.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      if (data.loanDetailsData) {
        this.loanData = data.loanDetailsData;
        this.currencyCode = this.loanData.currency?.code || 'USD';
        this.calculateMetrics();
        this.updateKpiCards();
        this.dataReady = true;
        this.cdr.markForCheck();
        this.scheduleChartInit();
      }
    });

    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.statusChart) {
        this.createStatusChart();
      }
      if (this.paymentsChart) {
        this.createPaymentsChart();
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.scheduleChartInit();
  }

  private scheduleChartInit(): void {
    if (!this.viewReady || !this.dataReady) {
      return;
    }
    if (this.initTimeout !== null) {
      clearTimeout(this.initTimeout);
    }
    this.initTimeout = window.setTimeout(() => {
      this.createStatusChart();
      this.createPaymentsChart();
    }, 0);
  }

  private formatAmount(value: number): string {
    try {
      return formatCurrency(
        value,
        this.locale,
        getCurrencySymbol(this.currencyCode, 'narrow'),
        this.currencyCode,
        '1.2-2'
      );
    } catch {
      return value.toLocaleString(this.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  calculateMetrics(): void {
    if (!this.loanData) {
      return;
    }

    this.principalAmount = this.loanData.principal || 0;
    this.totalRepaid = this.loanData.summary?.totalRepayment || 0;
    this.outstandingBalance = this.loanData.summary?.totalOutstanding || 0;
    this.interestCharged = this.loanData.summary?.interestCharged || 0;
    this.totalExpected = this.loanData.summary?.totalExpectedRepayment || 0;

    if (this.totalExpected === 0) {
      this.progressPercentage = 0;
    } else {
      this.progressPercentage = Math.min(100, Math.max(0, (this.totalRepaid / this.totalExpected) * 100));
    }
  }

  private updateKpiCards(): void {
    const format = (value: number) => this.formatAmount(value);

    this.kpiCards = [
      {
        labelKey: 'labels.inputs.Principal Amount',
        icon: 'hand-holding-usd',
        theme: 'gold',
        displayValue: format(this.principalAmount)
      },
      {
        labelKey: 'labels.inputs.Total Repaid',
        icon: 'check-circle',
        theme: 'green',
        displayValue: format(this.totalRepaid),
        showProgress: true
      },
      {
        labelKey: 'labels.inputs.Outstanding Balance',
        icon: 'money-bill-alt',
        theme: 'navy',
        displayValue: format(this.outstandingBalance),
        alert: this.outstandingBalance > 0 && !!this.loanData.inArrears
      },
      {
        labelKey: 'labels.inputs.Interest Charged',
        icon: 'percent',
        theme: 'slate',
        displayValue: format(this.interestCharged)
      }
    ];
  }

  createStatusChart(): void {
    if (!this.statusChartCanvas || !this.loanData) {
      return;
    }

    this.statusChart?.destroy();

    const canvas = this.statusChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const repaidPercentage = Math.min(
      100,
      Math.max(0, this.totalExpected > 0 ? (this.totalRepaid / this.totalExpected) * 100 : 0)
    );
    const outstandingPercentage = Math.max(0, 100 - repaidPercentage);

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          this.translate.instant('labels.inputs.Total Repaid'),
          this.translate.instant('labels.inputs.Outstanding Balance')
        ],
        datasets: [
          {
            data: [
              repaidPercentage,
              outstandingPercentage
            ],
            backgroundColor: [
              '#15803d',
              '#a1a1aa'
            ],
            borderWidth: 0,
            hoverBorderWidth: 2,
            hoverBorderColor: '#fff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { size: 12, weight: '500' },
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#71717a',
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (!data.labels?.length || !data.datasets.length) {
                  return [];
                }
                return data.labels.map((label: string, i: number) => ({
                  text: `${label}: ${Number(data.datasets[0].data[i]).toFixed(1)}%`,
                  fillStyle: data.datasets[0].backgroundColor?.[i] as string,
                  hidden: false,
                  index: i
                }));
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgb(24 24 27 / 92%)',
            padding: 10,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value.toFixed(1)}%`;
              }
            }
          }
        }
      }
    });
  }

  createPaymentsChart(): void {
    if (!this.paymentsChartCanvas || !this.loanData) {
      return;
    }

    this.paymentsChart?.destroy();

    const canvas = this.paymentsChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const repaymentSchedule = this.loanData.repaymentSchedule?.periods || [];
    const labels: string[] = [];
    const principalData: number[] = [];
    const interestData: number[] = [];

    repaymentSchedule.forEach((period: any) => {
      if (period.period && period.period > 0) {
        labels.push(`${this.translate.instant('labels.inputs.Period')} ${period.period}`);
        principalData.push(period.principalDue ?? period.principalOriginalDue ?? 0);
        interestData.push(period.interestDue ?? period.interestOriginalDue ?? 0);
      }
    });

    if (labels.length === 0) {
      return;
    }

    this.paymentsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: this.translate.instant('labels.inputs.Principal'),
            data: principalData,
            backgroundColor: '#18181b',
            borderWidth: 0,
            borderRadius: 6,
            barThickness: 20
          },
          {
            label: this.translate.instant('labels.inputs.Interest'),
            data: interestData,
            backgroundColor: '#9333ea',
            borderWidth: 0,
            borderRadius: 6,
            barThickness: 20
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 12,
              font: { size: 12, weight: '500' },
              color: '#71717a'
            }
          },
          tooltip: {
            backgroundColor: 'rgb(24 24 27 / 92%)',
            padding: 10,
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: ${this.formatAmount(value)}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              font: { size: 10 },
              color: '#71717a',
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 12
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: 'rgb(15 23 42 / 6%)' },
            ticks: {
              font: { size: 11 },
              color: '#71717a'
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.initTimeout !== null) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
    this.statusChart?.destroy();
    this.paymentsChart?.destroy();
  }
}
