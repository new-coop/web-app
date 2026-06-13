/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { M3IconComponent } from '../shared/m3-ui/m3-icon/m3-icon.component';

/**
 * Reports component: searchable, category-filterable list of all reports.
 */
@Component({
  selector: 'mifosx-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    M3IconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /** Reports data. */
  reportsData: any;
  /** Unique report categories shown as filter chips. */
  categories: string[] = [];
  /** Currently selected category; null means all. */
  selectedCategory: string | null = null;
  /** Free-text search. */
  searchText = '';
  /** Columns to be displayed in reports table. */
  displayedColumns: string[] = [
    'reportName',
    'reportType',
    'reportCategory'
  ];
  /** Data source for reports table. */
  dataSource = new MatTableDataSource();

  /** Paginator for reports table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for reports table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the reports data from `resolve`.
   * Prevents reuse of route parameter `filter`.
   */
  constructor() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { reports: any }) => {
      this.reportsData = data.reports;
    });
    // Optional /reports/:filter route param preselects a category
    this.selectedCategory = this.route.snapshot.params['filter'] ?? null;
  }

  ngOnInit() {
    this.setReports();
    this.categories = Array.from(
      new Set(
        (this.reportsData ?? [])
          .map((report: any) => report.reportCategory)
          .filter((category: string) => category && category !== '(NULL)' && category.trim() !== '')
      )
    ).sort() as string[];
    this.refreshFilter();
  }

  /**
   * Initializes the data source, paginator, sorter and filter predicate.
   */
  setReports() {
    this.dataSource = new MatTableDataSource(this.reportsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any) => {
      const matchesCategory = !this.selectedCategory || data.reportCategory === this.selectedCategory;
      const term = this.searchText.trim().toLowerCase();
      const matchesSearch =
        !term || `${data.reportName} ${data.reportType} ${data.reportCategory}`.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    };
  }

  applyFilter(filterValue: string) {
    this.searchText = filterValue;
    this.refreshFilter();
  }

  selectCategory(category: string | null) {
    this.selectedCategory = category;
    this.refreshFilter();
  }

  /**
   * MatTableDataSource skips the predicate when `filter` is falsy, so a
   * non-empty trigger string is always set; the predicate reads component state.
   */
  private refreshFilter() {
    this.dataSource.filter = `${this.searchText}\u0001${this.selectedCategory ?? ''}\u0001trigger`;
  }

  getCategoryKey(category: string): string {
    if (!category || category === '(NULL)' || category.trim() === '') {
      return 'labels.text.withoutCategory';
    }

    if (category.startsWith('labels.text.')) {
      return category;
    }
    return 'labels.text.' + category;
  }

  cleanTranslatedCategory(translatedText: string): string {
    if (!translatedText) return '';

    return translatedText.replace(/^labels\.text\./, '').replace(/^label\.text\./, '');
  }
}
