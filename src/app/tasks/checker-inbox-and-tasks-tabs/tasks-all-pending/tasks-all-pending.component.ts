/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
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
import { merge, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { M3IconComponent } from 'app/shared/m3-ui/m3-icon/m3-icon.component';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { TASK_QUEUES, TaskQueueNavItem } from '../../tasks-queue-nav.config';
import { PendingTaskGroup, TasksAllPendingService } from '../../tasks-all-pending.service';
import { TasksQueueCountsService } from '../../tasks-queue-counts.service';
import { isTaskQueuePermitted } from '../../tasks-queue-permissions';

@Component({
  selector: 'mifosx-tasks-all-pending',
  templateUrl: './tasks-all-pending.component.html',
  styleUrls: ['./tasks-all-pending.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    M3IconComponent,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksAllPendingComponent {
  private allPendingService = inject(TasksAllPendingService);
  private queueCountsService = inject(TasksQueueCountsService);
  private authenticationService = inject(AuthenticationService);
  private translateService = inject(TranslateService);

  private readonly userPermissions: string[] = this.authenticationService.getCredentials()?.permissions ?? [];

  readonly displayedColumns = [
    'title',
    'detail',
    'meta',
    'actions'
  ];
  readonly filterQuery = signal('');
  readonly loading = signal(true);
  readonly groups = signal<PendingTaskGroup[]>([]);

  readonly filteredGroups = computed(() => {
    const query = this.filterQuery().trim().toLowerCase();
    if (!query) {
      return this.groups();
    }
    return this.groups()
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          [
            item.title,
            item.detail,
            item.meta ?? '',
            this.translateService.instant(group.queue.labelKey)
          ]
            .join(' ')
            .toLowerCase()
            .includes(query)
        )
      }))
      .filter((group) => group.items.length > 0);
  });

  readonly isFilteredEmpty = computed(() => !this.loading() && this.groups().length > 0 && this.totalVisible() === 0);

  constructor() {
    merge(of(void 0), this.allPendingService.refresh$, this.queueCountsService.refresh$)
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          return this.allPendingService
            .loadGroupedPending(this.visibleQueues())
            .pipe(finalize(() => this.loading.set(false)));
        }),
        takeUntilDestroyed()
      )
      .subscribe((groups) => this.groups.set(groups));
  }

  totalVisible(): number {
    return this.filteredGroups().reduce((sum, group) => sum + group.items.length, 0);
  }

  onFilterInput(value: string): void {
    this.filterQuery.set(value);
  }

  clearFilters(): void {
    this.filterQuery.set('');
  }

  queueSectionId(queueKey: string): string {
    return `tasks-queue-${queueKey}`;
  }

  private visibleQueues(): TaskQueueNavItem[] {
    return TASK_QUEUES.filter((item) => isTaskQueuePermitted(this.userPermissions, item.permission));
  }
}
