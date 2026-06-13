/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, input, output, TemplateRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

export interface ColumnDef {
  field: string;
  header: string;
  sortable?: boolean;
  /** Right-aligned with tabular numerals */
  numeric?: boolean;
  width?: string;
}

/**
 * Standard data table for the Mifos X redesign.
 *
 * Server-side pagination, sticky header, loading skeleton, empty state
 * with optional action, and keyboard-accessible clickable rows.
 *
 * Custom cells via:
 *   <ng-template #cell let-row let-col="col">...</ng-template>
 */
@Component({
  selector: 'mifosx-data-table',
  standalone: true,
  imports: [
    TableModule,
    SkeletonModule,
    ButtonModule,
    NgTemplateOutlet
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T extends Record<string, unknown>> {
  columns = input.required<ColumnDef[]>();
  rows = input.required<T[]>();
  totalRecords = input(0);
  loading = input(false);
  pageSize = input(25);
  /** Index of the first row, lets callers restore the page from queryParams */
  first = input(0);
  emptyMessage = input('Sin resultados');
  emptyActionLabel = input<string>();

  lazyLoad = output<TableLazyLoadEvent>();
  rowSelect = output<T>();
  emptyAction = output<void>();

  cellTemplate = contentChild<TemplateRef<unknown>>('cell');

  /** Placeholder rows rendered as skeletons while loading */
  readonly skeletonRows = Array.from({ length: 10 }, () => ({}) as T);
}
