/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** rxjs Imports */
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/** Translation */
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

/** PrimeNG */
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent } from 'primeng/table';

/** Custom Services and Components */
import { environment } from '../../environments/environment';
import { ClientsService } from './clients.service';
import { HasPermissionDirective } from '../directives/has-permission/has-permission.directive';
import { ColumnDef, DataTableComponent } from '../shared/ui/data-table/data-table.component';
import { TableNameCellComponent } from '../shared/ui/table-name-cell/table-name-cell.component';
import { StatusBadgeComponent } from '../shared/ui/status-badge/status-badge.component';
import { AccountNumberComponent } from '../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../shared/external-identifier/external-identifier.component';

export const DEBOUNCE_MS = 500;

interface ClientRow extends Record<string, unknown> {
  id: number;
  displayName: string;
  accountNumber: string;
  externalId: string;
  status: { code: string; value: string };
  officeName: string;
}

/**
 * Clients list — design-system pattern 3.1 (table card).
 * Lazy server-side pagination against /v2/clients/search; filter, page and
 * sort persist in queryParams so back navigation and shared links work.
 */
@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    HasPermissionDirective,
    DataTableComponent,
    TableNameCellComponent,
    StatusBadgeComponent,
    AccountNumberComponent,
    ExternalIdentifierComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientsService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  private searchInput$ = new Subject<string>();
  private requestSub: Subscription | null = null;
  private isComposing = false;

  clients = signal<ClientRow[]>([]);
  totalRows = signal(0);
  isLoading = signal(false);

  filterText = '';
  pageSize = 25;
  first = signal(0);
  private sortAttribute = '';
  private sortDirection = '';

  columns: ColumnDef[] = [];

  /** Returns true if client data masking is enabled */
  get hideClientData(): boolean {
    return environment.complianceHideClientData;
  }

  ngOnInit() {
    this.columns = [
      { field: 'displayName', header: this.translateService.instant('labels.inputs.name'), sortable: true },
      { field: 'accountNumber', header: this.translateService.instant('labels.inputs.Account No'), sortable: true },
      { field: 'externalId', header: this.translateService.instant('labels.inputs.External Id'), sortable: true },
      { field: 'status', header: this.translateService.instant('labels.inputs.Status') },
      { field: 'officeName', header: this.translateService.instant('labels.inputs.Office Name') }
    ];

    this.restoreFromQueryParams();

    this.searchInput$
      .pipe(debounceTime(DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value !== this.filterText) {
          this.search(value);
        }
      });
  }

  /** Mask a client name when compliance masking is enabled */
  maskName(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => (part.length > 1 ? part[0] + '*'.repeat(part.length - 1) : part))
      .join(' ');
  }

  onSearchInput(value: string) {
    if (this.isComposing) return;
    this.searchInput$.next(value);
  }

  onCompositionStart(): void {
    this.isComposing = true;
  }

  onCompositionEnd(value: string): void {
    this.isComposing = false;
    this.searchInput$.next(value);
  }

  search(value: string) {
    this.filterText = value;
    this.first.set(0);
    this.getClients();
  }

  /** Fired by the table on init, page change and sort change */
  onLazyLoad(event: TableLazyLoadEvent) {
    this.first.set(event.first ?? 0);
    this.pageSize = event.rows ?? this.pageSize;
    if (event.sortField && typeof event.sortField === 'string') {
      this.sortAttribute = event.sortField;
      this.sortDirection = event.sortOrder === -1 ? 'DESC' : 'ASC';
    } else {
      this.sortAttribute = '';
      this.sortDirection = '';
    }
    if (environment.preloadClients || this.filterText) {
      this.getClients();
    }
  }

  onRowSelect(client: ClientRow) {
    this.router.navigate(
      [
        client.id,
        'general'
      ],
      { relativeTo: this.route }
    );
  }

  private restoreFromQueryParams() {
    const params = this.route.snapshot.queryParamMap;
    this.filterText = params.get('q') ?? '';
    this.pageSize = Number(params.get('size')) || this.pageSize;
    this.first.set((Number(params.get('page')) || 0) * this.pageSize);
    const sort = params.get('sort')?.split(',') ?? [];
    if (sort.length === 2) {
      this.sortAttribute = sort[0];
      this.sortDirection = sort[1].toUpperCase();
    }
  }

  private syncQueryParams() {
    const page = Math.floor(this.first() / this.pageSize);
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        q: this.filterText || null,
        page: page || null,
        size: this.pageSize !== 25 ? this.pageSize : null,
        sort: this.sortAttribute ? `${this.sortAttribute},${this.sortDirection.toLowerCase()}` : null
      }
    });
  }

  private getClients() {
    this.requestSub?.unsubscribe();
    this.isLoading.set(true);
    const page = Math.floor(this.first() / this.pageSize);
    this.requestSub = this.clientService
      .searchByText(this.filterText, page, this.pageSize, this.sortAttribute, this.sortDirection)
      .subscribe({
        next: (data: any) => {
          this.clients.set(data.content ?? []);
          this.totalRows.set(data.totalElements ?? 0);
          this.isLoading.set(false);
          this.syncQueryParams();
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    this.destroyRef.onDestroy(() => this.requestSub?.unsubscribe());
  }
}
