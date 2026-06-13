/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { SearchService } from '../../../search/search.service';
import { M3IconComponent } from '../../../shared/m3-ui/m3-icon/m3-icon.component';

interface SearchResult {
  entityId: number;
  entityType: string;
  entityName: string;
  entityAccountNo?: string;
  parentId?: number;
  parentName?: string;
  subEntityType?: string;
}

const SEARCH_RESOURCES = 'clients,clientIdentifiers,groups,centers,savings,loans,shares';
const MAX_RESULTS = 8;
const MIN_QUERY_LENGTH = 2;

/**
 * Global search (Ctrl+K): primary navigation for daily operators.
 * Searches clients, accounts, groups and centers and jumps straight
 * to the entity page.
 */
@Component({
  selector: 'mifosx-global-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SkeletonModule,
    TranslatePipe,
    M3IconComponent
  ],
  templateUrl: './global-search.component.html',
  styleUrl: './global-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalSearchComponent implements OnInit {
  private searchService = inject(SearchService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private resultsList = viewChild<ElementRef<HTMLElement>>('resultsList');

  visible = signal(false);
  loading = signal(false);
  results = signal<SearchResult[]>([]);
  /** Distinguishes "no results" from "not searched yet" */
  searched = signal(false);

  queryControl = new FormControl('', { nonNullable: true });

  readonly skeletons = Array.from({ length: 4 });

  ngOnInit(): void {
    this.queryControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          if (query.trim().length < MIN_QUERY_LENGTH) {
            this.results.set([]);
            this.searched.set(false);
            this.loading.set(false);
          }
        }),
        switchMap((query) => {
          const trimmed = query.trim();
          if (trimmed.length < MIN_QUERY_LENGTH) {
            return of(null);
          }
          this.loading.set(true);
          return this.searchService.getSearchResults(trimmed, SEARCH_RESOURCES).pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (response === null) {
          return;
        }
        this.results.set((response as SearchResult[]).slice(0, MAX_RESULTS));
        this.searched.set(true);
        this.loading.set(false);
      });
  }

  open(): void {
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.queryControl.setValue('');
    this.results.set([]);
    this.searched.set(false);
  }

  focusInput(): void {
    this.searchInput()?.nativeElement.focus();
  }

  /** Arrow navigation between the input and result options */
  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusResult(0);
    } else if (event.key === 'Enter' && this.results().length > 0) {
      event.preventDefault();
      this.navigate(this.results()[0]);
    }
  }

  onResultKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusResult(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index === 0) {
        this.focusInput();
      } else {
        this.focusResult(index - 1);
      }
    }
  }

  private focusResult(index: number): void {
    const buttons = this.resultsList()?.nativeElement.querySelectorAll<HTMLButtonElement>('.result-item');
    buttons?.[Math.min(index, buttons.length - 1)]?.focus();
  }

  viewAllResults(): void {
    const query = this.queryControl.value.trim();
    this.close();
    this.router.navigate(['/search'], { queryParams: { query, resource: SEARCH_RESOURCES } });
  }

  /** Same entity-to-route mapping as the full search page */
  navigate(entity: SearchResult): void {
    this.close();
    switch (entity.entityType) {
      case 'CLIENT':
        this.router.navigate([
          'clients',
          entity.entityId,
          'general'
        ]);
        break;
      case 'CLIENTIDENTIFIER':
        this.router.navigate([
          'clients',
          entity.parentId,
          'general'
        ]);
        break;
      case 'CENTER':
        this.router.navigate([
          'centers',
          entity.entityId
        ]);
        break;
      case 'GROUP':
        this.router.navigate([
          'groups',
          entity.entityId
        ]);
        break;
      case 'SHARE':
        this.router.navigate([
          'clients',
          entity.parentId,
          'shares-accounts',
          entity.entityId
        ]);
        break;
      case 'SAVING':
        if (entity.subEntityType === 'depositAccountType.recurringDeposit') {
          this.router.navigate([
            'clients',
            entity.parentId,
            'recurring-deposits-accounts',
            entity.entityId,
            'transactions'
          ]);
        } else if (entity.subEntityType === 'depositAccountType.fixedDeposit') {
          this.router.navigate([
            'clients',
            entity.parentId,
            'fixed-deposits-accounts',
            entity.entityId,
            'transactions'
          ]);
        } else {
          this.router.navigate([
            'clients',
            entity.parentId,
            'savings-accounts',
            entity.entityId,
            'transactions'
          ]);
        }
        break;
      case 'LOAN':
        this.router.navigate([
          'clients',
          entity.parentId,
          'loans-accounts',
          entity.entityId,
          'general'
        ]);
        break;
    }
  }
}
