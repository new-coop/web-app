/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { Dates } from 'app/core/utils/dates';

import {
  AnalyticsDetailItem,
  AnalyticsFilters,
  AnalyticsTimescale,
  AnalyticsWidgetDefinition,
  AnalyticsWidgetState
} from '../models/analytics-dashboard.model';
import { getChartAccentColors, getMifosChartPalette } from 'app/core/utils/chart-colors';

const CHART = getMifosChartPalette(false);
const ACCENT = getChartAccentColors(false);
const PENDING_SEGMENT_COLOR = ACCENT.pending;
const COMPLETE_SEGMENT_COLOR = ACCENT.complete;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsDataSourceService {
  private http = inject(HttpClient);
  private dates = inject(Dates);

  private reportCache = new Map<string, Observable<any>>();
  /** Potentially better formatting? */
  loadWidget(widget: AnalyticsWidgetDefinition, filters: AnalyticsFilters): Observable<AnalyticsWidgetState> {
    switch (widget.adapter) {
      case 'client-total':
        return this.loadTrendMetric(filters, 'client');
      case 'loan-total':
        return this.loadTrendMetric(filters, 'loan');
      case 'collection-total':
        return this.loadAmountMetric(filters, 'Demand Vs Collection');
      case 'disbursement-total':
        return this.loadAmountMetric(filters, 'Disbursal Vs Awaitingdisbursal');
      case 'client-loan-trends':
        return this.loadTrendChart(filters);
      case 'collection-breakdown':
        return this.loadAmountChart(filters, 'Demand Vs Collection', 'labels.inputs.Amount Collected');
      case 'disbursement-breakdown':
        return this.loadAmountChart(filters, 'Disbursal Vs Awaitingdisbursal', 'labels.catalogs.Disbursement');
      default:
        return of({
          loading: false,
          empty: true
        });
    }
  }

  clearCache(): void {
    this.reportCache.clear();
  }

  private loadTrendMetric(filters: AnalyticsFilters, type: 'client' | 'loan'): Observable<AnalyticsWidgetState> {
    return this.loadTrendSeries(filters, type).pipe(
      map((series) => ({
        loading: false,
        empty: series.every((value) => value === 0),
        metricValue: series.reduce((sum, value) => sum + value, 0),
        contextKey: this.getTimescaleKey(filters.timescale)
      })),
      catchError(() =>
        of({
          loading: false,
          empty: true
        })
      )
    );
  }

  private loadAmountMetric(filters: AnalyticsFilters, reportName: string): Observable<AnalyticsWidgetState> {
    return this.runReport(reportName, this.buildReportParams(filters)).pipe(
      map((response) => {
        const [
          pending,
          complete
        ] = this.extractAmountPair(response, reportName);
        return {
          loading: false,
          empty: pending === 0 && complete === 0,
          metricValue: complete
        };
      }),
      catchError(() =>
        of({
          loading: false,
          empty: true
        })
      )
    );
  }

  private loadTrendChart(filters: AnalyticsFilters): Observable<AnalyticsWidgetState> {
    return forkJoin([
      this.loadTrendSeries(filters, 'client'),
      this.loadTrendSeries(filters, 'loan')
    ]).pipe(
      map(
        ([
          clients,
          loans
        ]) => ({
          loading: false,
          empty: clients.every((value) => value === 0) && loans.every((value) => value === 0),
          labels: this.getTimescaleDisplayLabels(filters.timescale),
          translateLabels: false,
          datasets: [
            {
              labelKey: 'labels.inputs.Clients',
              data: clients,
              backgroundColor: CHART.clients,
              borderColor: CHART.clients,
              borderWidth: 1
            },
            {
              labelKey: 'labels.menus.Loans',
              data: loans,
              backgroundColor: CHART.loans,
              borderColor: CHART.loans,
              borderWidth: 1
            }
          ],
          details: this.withDetailShares([
            {
              labelKey: 'labels.inputs.Clients',
              value: clients.reduce((sum, value) => sum + value, 0),
              color: ACCENT.clients
            },
            {
              labelKey: 'labels.menus.Loans',
              value: loans.reduce((sum, value) => sum + value, 0),
              color: ACCENT.loans
            }
          ])
        })
      ),
      catchError(() =>
        of({
          loading: false,
          empty: true
        })
      )
    );
  }

  private loadAmountChart(
    filters: AnalyticsFilters,
    reportName: string,
    completeLabelKey: string
  ): Observable<AnalyticsWidgetState> {
    return this.runReport(reportName, this.buildReportParams(filters)).pipe(
      map((response) => {
        const [
          pending,
          complete
        ] = this.extractAmountPair(response, reportName);
        const pendingAmount = Math.max(0, pending);
        const completeAmount = Math.max(0, complete);
        const total = pendingAmount + completeAmount;
        return {
          loading: false,
          empty: total === 0,
          labels: [
            'labels.status.Pending',
            completeLabelKey
          ],
          translateLabels: true,
          datasets: [
            {
              labelKey: completeLabelKey,
              data: [
                pendingAmount,
                completeAmount
              ],
              backgroundColor: [
                PENDING_SEGMENT_COLOR,
                COMPLETE_SEGMENT_COLOR
              ],
              borderWidth: 0
            }
          ],
          details: this.withDetailShares([
            {
              labelKey: 'labels.status.Pending',
              value: pendingAmount,
              color: PENDING_SEGMENT_COLOR
            },
            {
              labelKey: completeLabelKey,
              value: completeAmount,
              color: COMPLETE_SEGMENT_COLOR
            }
          ])
        };
      }),
      catchError(() =>
        of({
          loading: false,
          empty: true
        })
      )
    );
  }

  private loadTrendSeries(filters: AnalyticsFilters, type: 'client' | 'loan'): Observable<number[]> {
    const reportName = this.getTrendReportName(filters.timescale, type);
    const matchLabels = this.getTimescaleMatchLabels(filters.timescale);
    const valueField = type === 'client' ? 'count' : 'lcount';

    return this.runReport(reportName, this.buildReportParams(filters)).pipe(
      map((response: any[]) =>
        matchLabels.map((label) => {
          const entry = response.find((item) => this.matchesTrendLabel(item, label, filters.timescale));
          return Number(entry?.[valueField] || 0);
        })
      )
    );
  }

  private buildReportParams(filters: AnalyticsFilters): Record<string, string | number> {
    const params: Record<string, string | number> = {
      genericResultSet: 'false'
    };

    // Just avoid forcing an invalid id
    if (filters.officeId !== null && filters.officeId !== undefined) {
      params['R_officeId'] = filters.officeId;
    }

    return params;
  }

  private runReport(reportName: string, params: Record<string, string | number>): Observable<any> {
    let httpParams = new HttpParams();
    const sortedParams = Object.keys(params).sort();

    sortedParams.forEach((key) => {
      httpParams = httpParams.set(key, `${params[key]}`);
    });

    const cacheKey = `${reportName}:${httpParams.toString()}`;
    const cached = this.reportCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get(`/runreports/${reportName}`, { params: httpParams }).pipe(shareReplay(1));
    this.reportCache.set(cacheKey, request$);
    return request$;
  }

  private extractAmountPair(response: any[], reportName: string): [
    number,
    number
  ] {
    const firstRow = response?.[0] || {};
    const numericEntries = Object.entries(firstRow)
      .map(
        ([
          key,
          value
        ]) => ({
          key: key.toLowerCase(),
          value: Number(value)
        })
      )
      .filter((entry) => !Number.isNaN(entry.value));

    if (reportName === 'Demand Vs Collection') {
      const pendingValue = this.findValueByKeys(numericEntries, [
        'amountdue',
        'due',
        'pending',
        'awaiting',
        'demand'
      ]);
      const completeValue = this.findValueByKeys(numericEntries, [
        'amountpaid',
        'paid',
        'collection',
        'collected'
      ]);

      if (pendingValue !== undefined && completeValue !== undefined) {
        return [
          pendingValue,
          completeValue
        ];
      }
    }

    if (reportName === 'Disbursal Vs Awaitingdisbursal') {
      const pendingValue = this.findValueByKeys(numericEntries, [
        'amounttobedisburse',
        'tobedisburse',
        'awaiting',
        'pending'
      ]);
      const completeValue = this.findValueByKeys(numericEntries, [
        'disbursedamount',
        'disbursed',
        'disburs',
        'disbursement'
      ]);

      if (pendingValue !== undefined && completeValue !== undefined) {
        return [
          pendingValue,
          completeValue
        ];
      }
    }

    const values = numericEntries.map((entry) => entry.value).slice(0, 2);

    return [
      values[0] || 0,
      values[1] || 0
    ];
  }

  private findValueByKeys(entries: { key: string; value: number }[], keys: string[]): number | undefined {
    return entries.find((entry) => keys.some((key) => entry.key.includes(key)))?.value;
  }

  private getTrendReportName(timescale: AnalyticsTimescale, type: 'client' | 'loan'): string {
    const base = type === 'client' ? 'ClientTrendsBy' : 'LoanTrendsBy';
    return `${base}${timescale}`;
  }

  private resolveTrendLabel(entry: any, timescale: AnalyticsTimescale): string {
    switch (timescale) {
      case 'Day':
        return this.dates.formatDate(entry?.days, 'd/M');
      case 'Week':
        return `${Number(entry?.Weeks ?? entry?.weeks ?? '')}`;
      case 'Month':
        return `${entry?.Months ?? entry?.months ?? ''}`.trim();
      default:
        return '';
    }
  }

  private matchesTrendLabel(entry: any, label: string, timescale: AnalyticsTimescale): boolean {
    const resolved = this.resolveTrendLabel(entry, timescale);

    switch (timescale) {
      case 'Week':
        return Number(resolved) === Number(label);
      case 'Month':
        return resolved.toLowerCase() === label.toLowerCase();
      default:
        return resolved === label;
    }
  }

  /** Labels used to match API report rows (English month names from the database). */
  private getTimescaleMatchLabels(timescale: AnalyticsTimescale): string[] {
    const labels: string[] = [];
    const cursor = new Date();

    switch (timescale) {
      case 'Day':
        while (labels.length < 12) {
          cursor.setDate(cursor.getDate() - 1);
          labels.push(this.dates.formatDate(cursor, 'd/M'));
        }
        break;
      case 'Week':
        while (labels.length < 12) {
          cursor.setDate(cursor.getDate() - 7);
          labels.push(`${this.getWeekNumber(cursor)}`);
        }
        break;
      case 'Month':
        while (labels.length < 12) {
          labels.push(cursor.toLocaleString('en-US', { month: 'long' }));
          cursor.setMonth(cursor.getMonth() - 1);
        }
        break;
    }

    return labels.reverse();
  }

  /** Localized labels shown on trend charts. */
  private getTimescaleDisplayLabels(timescale: AnalyticsTimescale): string[] {
    const labels: string[] = [];
    const cursor = new Date();

    switch (timescale) {
      case 'Day':
        while (labels.length < 12) {
          cursor.setDate(cursor.getDate() - 1);
          labels.push(this.dates.formatDate(cursor, 'd/M'));
        }
        break;
      case 'Week':
        while (labels.length < 12) {
          cursor.setDate(cursor.getDate() - 7);
          labels.push(`${this.getWeekNumber(cursor)}`);
        }
        break;
      case 'Month':
        while (labels.length < 12) {
          labels.push(this.dates.formatDate(cursor, 'MMMM'));
          cursor.setMonth(cursor.getMonth() - 1);
        }
        break;
    }

    return labels.reverse();
  }

  private getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date.getTime() - firstDay.getTime()) / 86400000 + firstDay.getDay() + 1) / 7);
  }

  private withDetailShares(details: AnalyticsDetailItem[]): AnalyticsDetailItem[] {
    const total = details.reduce((sum, item) => sum + item.value, 0);
    if (total <= 0) {
      return details;
    }

    return details.map((item) => ({
      ...item,
      share: ((item.value / total) * 100).toFixed(1)
    }));
  }

  private getTimescaleKey(timescale: AnalyticsTimescale): string {
    switch (timescale) {
      case 'Day':
        return 'labels.buttons.Day';
      case 'Week':
        return 'labels.buttons.Week';
      case 'Month':
      default:
        return 'labels.buttons.Month';
    }
  }
}
