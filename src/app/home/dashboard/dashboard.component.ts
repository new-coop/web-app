/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { activities } from '../activities';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { FaIconComponent } from 'app/shared/icons/fa-icon.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DashboardEngineComponent } from 'app/analytics/dashboard-engine/dashboard-engine.component';
import { GLOBAL_ANALYTICS_DASHBOARD } from 'app/analytics/global-dashboard.config';
import { HomeService } from '../home.service';
import { AccountingService } from 'app/accounting/accounting.service';
import { ClientTrendsBarComponent } from './client-trends-bar/client-trends-bar.component';
import { AmountDisbursedPieComponent } from './amount-disbursed-pie/amount-disbursed-pie.component';
import { AmountCollectedPieComponent } from './amount-collected-pie/amount-collected-pie.component';

/** Key metric displayed on the dashboard. */
interface KpiCard {
  labelKey: string;
  icon: string;
  theme: 'navy' | 'gold' | 'green' | 'slate';
  value: number | null;
  loaded: boolean;
}

/**
 * Dashboard component.
 */
@Component({
  selector: 'mifosx-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAutocompleteTrigger,
    MatAutocomplete,
    DashboardEngineComponent,
    FaIconComponent,
    ClientTrendsBarComponent,
    AmountDisbursedPieComponent,
    AmountCollectedPieComponent,
    AsyncPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private homeService = inject(HomeService);
  private accountingService = inject(AccountingService);
  private cdr = inject(ChangeDetectorRef);

  /** Search Text. */
  searchText: FormControl = new FormControl();
  /** Filtered Activities. */
  filteredActivities!: Observable<any[]>;
  /** All User Activities. */
  allActivities: any[] = activities;
  /** Dashboard definition */
  dashboardDefinition = GLOBAL_ANALYTICS_DASHBOARD;
  /** Office options from resolver */
  offices: any[] = [];
  /** Offices sorted for the table view */
  sortedOffices: any[] = [];
  /** Current table sort state */
  sortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  /** Key metrics shown at a glance. */
  kpiCards: KpiCard[] = [
    { labelKey: 'labels.heading.Clients', icon: 'users', theme: 'navy', value: null, loaded: false },
    { labelKey: 'labels.heading.Loan Accounts', icon: 'hand-holding-usd', theme: 'gold', value: null, loaded: false },
    { labelKey: 'labels.heading.Savings Accounts', icon: 'piggy-bank', theme: 'green', value: null, loaded: false },
    { labelKey: 'labels.heading.Offices', icon: 'building', theme: 'slate', value: null, loaded: false }
  ];

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { offices: any[] }) => {
      this.offices = data.offices || [];
      this.applySort();
    });
  }

  ngOnInit() {
    this.setFilteredActivities();
    this.loadKpis();
    this.loadOffices();
  }

  /**
   * Loads offices without blocking route activation.
   */
  private loadOffices(): void {
    if (this.offices.length) {
      return;
    }

    this.accountingService
      .getOffices()
      .pipe(catchError(() => of([])))
      .subscribe((offices: any[]) => {
        this.offices = offices || [];
        this.applySort();
      });
  }

  /**
   * Loads headline metrics; each one degrades gracefully to an em dash on error.
   */
  private loadKpis(): void {
    forkJoin([
      this.homeService.getClientsCount().pipe(catchError(() => of(null))),
      this.homeService.getLoanAccountsCount().pipe(catchError(() => of(null))),
      this.homeService.getSavingsAccountsCount().pipe(catchError(() => of(null))),
      this.homeService.getOfficesCount().pipe(catchError(() => of(null)))
    ]).subscribe((values: (number | null)[]) => {
      values.forEach((value, index) => {
        this.kpiCards[index].value = value;
        this.kpiCards[index].loaded = true;
      });
      this.cdr.markForCheck();
    });
  }

  /**
   * Sorts the offices table by the given column, toggling direction on repeat.
   * @param {string} column Column field name.
   */
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  private applySort(): void {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    const column = this.sortColumn;
    this.sortedOffices = [...this.offices].sort((a: any, b: any) => {
      const aVal = a[column] ?? '';
      const bVal = b[column] ?? '';
      if (aVal < bVal) {
        return -direction;
      }
      return aVal > bVal ? direction : 0;
    });
    this.cdr.markForCheck();
  }

  /**
   * Sets filtered activities for autocomplete.
   */
  setFilteredActivities() {
    this.filteredActivities = this.searchText.valueChanges.pipe(
      map((activity: any) => (typeof activity === 'string' ? activity : activity.activity)),
      map((activityName: string) => (activityName ? this.filterActivity(activityName) : this.allActivities))
    );
  }

  /**
   * Filters activities.
   * @param activityName Activity name to filter activity by.
   * @returns {any} Filtered activities.
   */
  private filterActivity(activityName: string): any {
    const filterValue = activityName.toLowerCase();
    return this.allActivities.filter((activity) => activity.activity.toLowerCase().indexOf(filterValue) === 0);
  }
}
