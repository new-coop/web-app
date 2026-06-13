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

/** rxjs Imports */
import { forkJoin, merge, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { HomeService } from '../../home.service';
import { ThemingService } from 'app/shared/theme-toggle/theming.service';
import { getMifosChartPalette, getSeriesStyle } from 'app/core/utils/chart-colors';

/** Charting Imports */
import { Dates } from 'app/core/utils/dates';
import { Chart, registerables } from 'chart.js';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { FaIconComponent } from 'app/shared/icons/fa-icon.component';
import { NgStyle } from '@angular/common';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Client Trends Bar Chart Component.
 */
@Component({
  selector: 'mifosx-client-trends-bar',
  templateUrl: './client-trends-bar.component.html',
  styleUrls: ['./client-trends-bar.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    NgStyle,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientTrendsBarComponent implements OnInit {
  private homeService = inject(HomeService);
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);
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
  /** Static Form control for time scale */
  timescale = new FormControl();
  /** Office Data */
  officeData: any;
  /** Chart.js chart */
  chart: any;
  /** Substitute for resolver */
  hideOutput = true;

  /**
   * Fetches offices data from `resolve`
   * @param {HomeService} homeService Home Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Dates} dateUtils Date Utils
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { offices: any }) => {
      if (data.offices) {
        this.officeData = data.offices;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit() {
    this.initializeControls();
    this.getChartData();
    this.fetchTrends(this.officeId.value, this.timescale.value);
    // Subscribe to theme changes to update chart legend colors
    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((theme) => {
      this.currentTheme = theme;
      if (this.chart) {
        this.updateChartColors();
      }
    });
  }

  /**
   * Initialize the form controls for better UX.
   */
  initializeControls() {
    this.officeId.patchValue(1);
    this.timescale.patchValue('Day');
  }

  /**
   * Subscribes to value changes of officeID and timescale controls,
   * Fetches data accordingly and sets charts based on fetched data.
   */
  getChartData() {
    merge(this.officeId.valueChanges, this.timescale.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fetchTrends(this.officeId.value, this.timescale.value);
      });
  }

  private fetchTrends(officeId: number, timescale: string): void {
    switch (timescale) {
      case 'Day':
        forkJoin([
          this.homeService.getClientTrendsByDay(officeId),
          this.homeService.getLoanTrendsByDay(officeId)
        ])
          .pipe(catchError(() => of([])))
          .subscribe((data: any[]) => {
            const dayLabels = this.getLabels(timescale);
            const clientCounts = this.getCounts(data[0] || [], dayLabels, timescale, 'client');
            const loanCounts = this.getCounts(data[1] || [], dayLabels, timescale, 'loan');
            this.setChart(dayLabels, clientCounts, loanCounts);
            this.hideOutput = false;
            this.cdr.markForCheck();
          });
        break;
      case 'Week':
        forkJoin([
          this.homeService.getClientTrendsByWeek(officeId),
          this.homeService.getLoanTrendsByWeek(officeId)
        ])
          .pipe(catchError(() => of([])))
          .subscribe((data: any[]) => {
            const weekLabels = this.getLabels(timescale);
            const clientCounts = this.getCounts(data[0] || [], weekLabels, timescale, 'client');
            const loanCounts = this.getCounts(data[1] || [], weekLabels, timescale, 'loan');
            this.setChart(weekLabels, clientCounts, loanCounts);
            this.hideOutput = false;
            this.cdr.markForCheck();
          });
        break;
      case 'Month':
        forkJoin([
          this.homeService.getClientTrendsByMonth(officeId),
          this.homeService.getLoanTrendsByMonth(officeId)
        ])
          .pipe(catchError(() => of([])))
          .subscribe((data: any[]) => {
            const monthLabels = this.getLabels(timescale);
            const clientCounts = this.getCounts(data[0] || [], monthLabels, timescale, 'client');
            const loanCounts = this.getCounts(data[1] || [], monthLabels, timescale, 'loan');
            this.setChart(monthLabels, clientCounts, loanCounts);
            this.hideOutput = false;
            this.cdr.markForCheck();
          });
        break;
    }
  }

  /**
   * Gets Abscissa Labels.
   * @param {string} timescale User's timescale choice.
   */
  getLabels(timescale: string) {
    const date = new Date();
    const labelsArray = [];
    switch (timescale) {
      case 'Day':
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 1);
          const transformedDate = this.dateUtils.formatDate(date, 'd/M');
          labelsArray.push(transformedDate);
        }
        break;
      case 'Week':
        /** 1st January of present year */
        const onejan = new Date(date.getFullYear(), 0, 1);
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 7);
          /** Gets current week number */
          const weekNumber = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
          labelsArray.push(weekNumber);
        }
        break;
      case 'Month':
        while (labelsArray.length < 12) {
          const transformedDate = this.dateUtils.formatDate(date, 'MMMM');
          labelsArray.push(transformedDate);
          date.setMonth(date.getMonth() - 1);
        }
        break;
    }
    return labelsArray.reverse();
  }

  /**
   * Get bar heights for clients/loans trends.
   * @param {any[]} response API response array.
   * @param {any[]} labels Abscissa Labels.
   * @param {string} timescale User's timescale choice.
   * @param {string} type 'client' or 'loan'.
   */
  getCounts(response: any[], labels: any[], timescale: string, type: string) {
    let counts: number[] = [];
    switch (timescale) {
      case 'Day':
        labels.forEach((label: any) => {
          const day = response.find((entry: any) => {
            const transformedDate = this.dateUtils.formatDate(entry.days, 'd/M');
            return transformedDate === label;
          });
          counts = this.updateCount(day, counts, type);
        });
        break;
      case 'Week':
        labels.forEach((label: any) => {
          const week = response.find((entry: any) => {
            return entry.Weeks === label;
          });
          counts = this.updateCount(week, counts, type);
        });
        break;
      case 'Month':
        labels.forEach((label: any) => {
          const month = response.find((entry: any) => {
            return entry.Months === label;
          });
          counts = this.updateCount(month, counts, type);
        });
        break;
    }
    return counts;
  }

  /**
   * Updates the counts array.
   * @param {any} span Time span.
   * @param {any[]} counts Counts.
   * @param {string} type 'client' or 'loan'
   */
  updateCount(span: any, counts: any[], type: string) {
    if (span) {
      switch (type) {
        case 'client':
          counts.push(span.count);
          break;
        case 'loan':
          counts.push(span.lcount);
          break;
      }
    } else {
      counts.push(0);
    }
    return counts;
  }

  /**
   * Creates an instance of Chart.js multi-bar chart.
   * Refer: https://www.chartjs.org/docs/latest/charts/bar.html for configuration details.
   * @param {any[]} labels Abscissa Labels.
   * @param {number[]} clientCounts Clients Ordinate.
   * @param {number[]} loanCounts Loans Ordinate.
   */
  setChart(labels: any[], clientCounts: number[], loanCounts: number[]) {
    const isDark = this.currentTheme === 'dark-theme';
    const palette = getMifosChartPalette(isDark);

    const clientStyle = getSeriesStyle(isDark, 'clients');
    const loanStyle = getSeriesStyle(isDark, 'loans');

    if (!this.chart) {
      this.chart = new Chart('client-trends-bar', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'New Clients',
              data: clientCounts,
              backgroundColor: clientStyle.backgroundColor,
              borderColor: clientStyle.borderColor,
              borderWidth: clientStyle.borderWidth,
              fill: true,
              tension: 0.3
            },
            {
              label: 'Loans Disbursed',
              data: loanCounts,
              backgroundColor: loanStyle.backgroundColor,
              borderColor: loanStyle.borderColor,
              borderWidth: loanStyle.borderWidth,
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: palette.legend
              }
            }
          },
          scales: {
            y: {
              min: 0,
              title: {
                display: true,
                text: 'Values',
                color: palette.axis
              },
              ticks: {
                color: palette.axis
              },
              grid: {
                color: palette.grid
              }
            },
            x: {
              ticks: {
                color: palette.axis
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    } else {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = clientCounts;
      this.chart.data.datasets[1].data = loanCounts;
      this.chart.update();
    }
  }

  /**
   * Updates chart colors based on the current theme.
   */
  updateChartColors() {
    const isDark = this.currentTheme === 'dark-theme';
    const palette = getMifosChartPalette(isDark);

    const clientStyle = getSeriesStyle(isDark, 'clients');
    const loanStyle = getSeriesStyle(isDark, 'loans');

    if (this.chart?.data?.datasets?.[0]) {
      this.chart.data.datasets[0].backgroundColor = clientStyle.backgroundColor;
      this.chart.data.datasets[0].borderColor = clientStyle.borderColor;
      this.chart.data.datasets[0].borderWidth = clientStyle.borderWidth;
    }

    if (this.chart?.data?.datasets?.[1]) {
      this.chart.data.datasets[1].backgroundColor = loanStyle.backgroundColor;
      this.chart.data.datasets[1].borderColor = loanStyle.borderColor;
      this.chart.data.datasets[1].borderWidth = loanStyle.borderWidth;
    }

    if (this.chart?.options?.plugins?.legend?.labels) {
      this.chart.options.plugins.legend.labels.color = palette.legend;
    }

    if (this.chart?.options?.scales?.y?.title) {
      this.chart.options.scales.y.title.color = palette.axis;
    }

    if (this.chart?.options?.scales?.y?.ticks) {
      this.chart.options.scales.y.ticks.color = palette.axis;
    }

    if (this.chart?.options?.scales?.y?.grid) {
      this.chart.options.scales.y.grid.color = palette.grid;
    }

    if (this.chart?.options?.scales?.x?.ticks) {
      this.chart.options.scales.x.ticks.color = palette.axis;
    }

    this.chart?.update();
  }
}
