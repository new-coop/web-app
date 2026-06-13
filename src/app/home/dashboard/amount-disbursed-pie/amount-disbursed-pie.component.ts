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
  Input,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/** Custom Services */
import { HomeService } from '../../home.service';
import { ThemingService } from 'app/shared/theme-toggle/theming.service';
import { getDoughnutSegmentStyle, getMifosChartPalette } from 'app/core/utils/chart-colors';

/** Charting Imports */
import { Chart, registerables } from 'chart.js';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { FaIconComponent } from 'app/shared/icons/fa-icon.component';
import { NgStyle } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Amount Disbursed Pie Chart Component
 */
@Component({
  selector: 'mifosx-amount-disbursed-pie',
  templateUrl: './amount-disbursed-pie.component.html',
  styleUrls: ['./amount-disbursed-pie.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    NgStyle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmountDisbursedPieComponent implements OnInit {
  private homeService = inject(HomeService);
  private route = inject(ActivatedRoute);
  private themingService = inject(ThemingService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Offices from parent or route resolver */
  @Input() set offices(value: any) {
    if (value) {
      this.officeData = value;
      this.cdr.markForCheck();
    }
  }

  /** Current theme */
  private currentTheme = 'light-theme';

  /** Static Form control for office Id */
  officeId = new FormControl();
  /** Office Data */
  officeData: any;
  /** Chart.js chart */
  chart: any;
  /** Substitute for resolver */
  hideOutput = true;
  /** Shows fallback element */
  showFallback = true;

  /**
   * Fetches offices data from `resolve`.
   * @param {HomeService} homeService Home Service.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { offices: any }) => {
      if (data.offices) {
        this.officeData = data.offices;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Sets the pie chart with initial office Id 1.
   * Initialize with office Id 1 for better UX.
   */
  ngOnInit() {
    this.getChartData();
    this.officeId.patchValue(1);
    // Subscribe to theme changes to update chart legend colors
    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((theme) => {
      this.currentTheme = theme;
      if (this.chart) {
        this.updateChartColors();
      }
    });
  }

  /**
   * Subscribes to value changes of office Id fetches chart data accordingly.
   */
  getChartData() {
    this.officeId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: number) => {
      this.homeService
        .getDisbursedAmount(value)
        .pipe(catchError(() => of([])))
        .subscribe((response: any) => {
          const row = response?.[0];
          if (!row) {
            this.showFallback = true;
            this.hideOutput = true;
            this.cdr.markForCheck();
            return;
          }
          const data = Object.entries(row).map((entry) => entry[1]);
          if (!(data[0] === 0 && data[1] === 0)) {
            this.setChart(data);
            this.showFallback = false;
            this.hideOutput = false;
          } else {
            this.showFallback = true;
            this.hideOutput = true;
          }
          this.cdr.markForCheck();
        });
    });
  }

  /**
   * Creates an instance of Chart.js pie chart
   * Refer: https://www.chartjs.org/docs/latest/charts/doughnut.html for configuration details.
   * @param {any} data Chart Data.
   */
  setChart(data: any) {
    const isDark = this.currentTheme === 'dark-theme';
    const palette = getMifosChartPalette(isDark);
    const doughnut = getDoughnutSegmentStyle(isDark);

    if (!this.chart) {
      this.chart = new Chart('disbursement-pie', {
        type: 'doughnut',
        data: {
          labels: [
            'Pending',
            'Disbursed'
          ],
          datasets: [
            {
              backgroundColor: doughnut.backgroundColor,
              borderColor: doughnut.borderColor,
              borderWidth: doughnut.borderWidth,
              data: data
            }
          ]
        },
        options: {
          cutout: '62%',
          spacing: doughnut.spacing,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: palette.legend,
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 16
              }
            }
          },
          layout: {
            padding: {
              top: 10,
              bottom: 15
            }
          }
        }
      });
    } else {
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }

  /**
   * Updates chart colors based on the current theme.
   */
  updateChartColors() {
    const isDark = this.currentTheme === 'dark-theme';
    const palette = getMifosChartPalette(isDark);
    const doughnut = getDoughnutSegmentStyle(isDark);

    if (this.chart?.data?.datasets?.[0]) {
      this.chart.data.datasets[0].backgroundColor = doughnut.backgroundColor;
      this.chart.data.datasets[0].borderColor = doughnut.borderColor;
      this.chart.data.datasets[0].borderWidth = doughnut.borderWidth;
    }

    if (this.chart?.options?.plugins?.legend?.labels) {
      this.chart.options.plugins.legend.labels.color = palette.legend;
    }

    if (this.chart?.options) {
      this.chart.options.spacing = doughnut.spacing;
    }

    this.chart?.update();
  }
}
