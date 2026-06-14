/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { merge, of } from 'rxjs';
import { filter, finalize, map, startWith, switchMap } from 'rxjs/operators';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { M3IconComponent } from 'app/shared/m3-ui/m3-icon/m3-icon.component';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { ALL_PENDING_QUEUE, TASK_QUEUES, TaskQueueNavItem } from '../tasks-queue-nav.config';
import { TasksQueueCountsService } from '../tasks-queue-counts.service';
import { TASK_QUEUE_HOT_THRESHOLD } from '../tasks-gamification.config';
import { TasksGamificationService } from '../tasks-gamification.service';
import { isTaskQueuePermitted } from '../tasks-queue-permissions';
import { TasksQueueRecentService } from '../tasks-queue-recent.service';

/**
 * Checker Inbox and Tasks — sticky queue nav and routed workbench.
 */
@Component({
  selector: 'mifosx-checker-inbox-and-tasks',
  templateUrl: './checker-inbox-and-tasks.component.html',
  styleUrls: ['./checker-inbox-and-tasks.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
    M3IconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckerInboxAndTasksComponent {
  private authenticationService = inject(AuthenticationService);
  private queueCountsService = inject(TasksQueueCountsService);
  private gamificationService = inject(TasksGamificationService);
  private recentService = inject(TasksQueueRecentService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly userPermissions: string[] = this.authenticationService.getCredentials()?.permissions ?? [];

  readonly queueFilter = signal('');
  readonly queueCounts = signal<Record<string, number>>({});
  readonly countsLoading = signal(true);
  readonly gamification = this.gamificationService.snapshot;
  readonly activeRoute = signal('all-pending');
  readonly gamificationExpanded = signal(false);

  readonly activeQueue = computed(
    () => this.sortedNavQueues().find((item) => item.route === this.activeRoute()) ?? ALL_PENDING_QUEUE
  );

  readonly isAllPendingView = computed(() => this.activeRoute() === 'all-pending');

  readonly sortedNavQueues = computed(() => {
    const queues = this.navQueues();
    const allPending = queues.find((item) => item.key === 'all-pending');
    const rest = queues
      .filter((item) => item.key !== 'all-pending')
      .sort((a, b) => (this.queueCounts()[b.key] ?? 0) - (this.queueCounts()[a.key] ?? 0));
    return allPending ? [
          allPending,
          ...rest
        ] : rest;
  });

  readonly filteredQueues = computed(() => {
    const query = this.queueFilter().trim().toLowerCase();
    const queues = this.sortedNavQueues();
    if (!query) {
      return queues;
    }
    return queues.filter((item) => this.matchesQueueFilter(item, query));
  });

  readonly hottestQueue = computed(() => {
    const queues = this.visibleQueues()
      .map((queue) => ({ queue, count: this.queueCounts()[queue.key] ?? 0 }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);
    return queues[0]?.queue ?? null;
  });

  readonly statusMessageKey = computed(() => {
    if (this.countsLoading()) {
      return null;
    }
    if (this.totalPending() === 0) {
      return 'labels.text.Tasks gamification status inbox zero';
    }
    const progress = this.gamification().dailyGoalProgress;
    if (progress >= 1) {
      return 'labels.text.Tasks gamification status daily goal met';
    }
    if (this.gamification().streak >= 3) {
      return 'labels.text.Tasks gamification status streak';
    }
    return 'labels.text.Tasks gamification status pending';
  });

  constructor() {
    effect(() => {
      const route = this.activeRoute();
      queueMicrotask(() => this.scrollActiveNavIntoView());
      if (route) {
        this.recentService.recordRoute(route);
      }
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.resolveActiveRoute(this.router.url)),
        startWith(this.resolveActiveRoute(this.router.url)),
        takeUntilDestroyed()
      )
      .subscribe((route) => this.activeRoute.set(route));

    merge(of(void 0), this.queueCountsService.refresh$)
      .pipe(
        switchMap(() => {
          const keys = this.visibleQueues().map((item) => item.key);
          const isInitialLoad = Object.keys(this.queueCounts()).length === 0;
          if (isInitialLoad) {
            this.countsLoading.set(true);
          }
          return this.queueCountsService.loadCounts(keys).pipe(finalize(() => this.countsLoading.set(false)));
        }),
        takeUntilDestroyed()
      )
      .subscribe((counts) => {
        this.queueCounts.set(counts);
        if (!this.countsLoading()) {
          this.gamificationService.checkInboxZero(this.totalPending());
        }
      });
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (this.isTypingTarget(event.target)) {
      return;
    }
    const index = Number.parseInt(event.key, 10);
    if (Number.isNaN(index) || index < 1 || index > 9) {
      return;
    }
    const target = this.filteredQueues()[index - 1];
    if (!target) {
      return;
    }
    event.preventDefault();
    this.router.navigate([target.route], { relativeTo: this.route });
  }

  visibleQueues(): TaskQueueNavItem[] {
    return TASK_QUEUES.filter((item) => isTaskQueuePermitted(this.userPermissions, item.permission));
  }

  navQueues(): TaskQueueNavItem[] {
    const queues = this.visibleQueues();
    if (queues.length === 0) {
      return [];
    }
    return [
      ALL_PENDING_QUEUE,
      ...queues
    ];
  }

  navShortcut(index: number): string | null {
    const queues = this.filteredQueues();
    return index < queues.length ? String(index + 1) : null;
  }

  totalPending(): number {
    const counts = this.queueCounts();
    let total = 0;
    let postApprovalCounted = false;

    for (const [
      key,
      count
    ] of Object.entries(counts)) {
      if (key === 'council-approval' || key === 'loan-disbursal') {
        if (!postApprovalCounted) {
          total += Math.max(counts['council-approval'] ?? 0, counts['loan-disbursal'] ?? 0);
          postApprovalCounted = true;
        }
        continue;
      }
      total += count;
    }

    return total;
  }

  queueCount(key: string): number | null {
    if (key === 'all-pending') {
      if (this.countsLoading()) {
        return null;
      }
      return this.totalPending();
    }
    if (this.countsLoading() && Object.keys(this.queueCounts()).length === 0) {
      return null;
    }
    return this.queueCounts()[key] ?? 0;
  }

  isQueueHot(key: string): boolean {
    if (key === 'all-pending') {
      return this.totalPending() >= TASK_QUEUE_HOT_THRESHOLD;
    }
    const count = this.queueCount(key);
    return count !== null && count >= TASK_QUEUE_HOT_THRESHOLD;
  }

  isQueueClear(key: string): boolean {
    if (key === 'all-pending') {
      return !this.countsLoading() && this.totalPending() === 0;
    }
    const count = this.queueCount(key);
    return count !== null && count === 0;
  }

  isSuggestedQueue(key: string): boolean {
    const hottest = this.hottestQueue();
    return hottest !== null && hottest.key === key && this.totalPending() > 0;
  }

  unlockedAchievements() {
    return this.gamification().achievements.filter((item) => item.unlocked);
  }

  onQueueFilterInput(value: string): void {
    this.queueFilter.set(value);
  }

  clearQueueFilter(): void {
    this.queueFilter.set('');
  }

  toggleGamification(): void {
    this.gamificationExpanded.update((expanded) => !expanded);
  }

  private scrollActiveNavIntoView(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector('.tasks-queue-nav-item--active')?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  private resolveActiveRoute(url: string): string {
    const match = url.match(/checker-inbox-and-tasks\/([^/?#]+)/);
    return match?.[1] ?? 'all-pending';
  }

  private matchesQueueFilter(item: TaskQueueNavItem, query: string): boolean {
    const haystack = [
      item.key,
      item.route,
      this.translateService.instant(item.labelKey),
      this.translateService.instant(item.descriptionKey)
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  }
}
