/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TasksService } from './tasks.service';
import { TaskQueueNavItem } from './tasks-queue-nav.config';

export interface PendingTaskRow {
  queueKey: string;
  queueRoute: string;
  queueLabelKey: string;
  queueIcon: string;
  title: string;
  detail: string;
  meta?: string;
  sortDate: number;
  entityLink?: string[];
  queueLink?: string[];
}

export interface PendingTaskGroup {
  queue: TaskQueueNavItem;
  items: PendingTaskRow[];
}

@Injectable({ providedIn: 'root' })
export class TasksAllPendingService {
  private tasksService = inject(TasksService);

  private readonly refreshSubject = new Subject<void>();
  readonly refresh$ = this.refreshSubject.asObservable();

  invalidate(): void {
    this.refreshSubject.next();
  }

  loadGroupedPending(queues: TaskQueueNavItem[]): Observable<PendingTaskGroup[]> {
    if (queues.length === 0) {
      return of([]);
    }

    const queueKeys = new Set(queues.map((q) => q.key));
    const skipCouncilDuplicate = queueKeys.has('council-approval') && queueKeys.has('loan-disbursal');

    const jobs: Observable<PendingTaskGroup | null>[] = queues
      .filter((queue) => !(skipCouncilDuplicate && queue.key === 'council-approval'))
      .map((queue) => {
        switch (queue.key) {
          case 'checker-inbox':
            return this.loadCheckerInbox(queue);
          case 'client-approval':
            return this.loadClientApproval(queue);
          case 'loan-approval':
            return this.loadLoanApproval(queue);
          case 'council-approval':
            return this.loadCouncilApproval(queue);
          case 'loan-disbursal':
            return this.loadLoanDisbursal(queue);
          case 'reschedule-loan':
            return this.loadRescheduleLoan(queue);
          default:
            return of(null);
        }
      });

    return forkJoin(jobs).pipe(
      map((groups) =>
        groups
          .filter((group): group is PendingTaskGroup => !!group && group.items.length > 0)
          .sort((a, b) => b.items.length - a.items.length)
      )
    );
  }

  private loadCheckerInbox(queue: TaskQueueNavItem): Observable<PendingTaskGroup> {
    return this.tasksService.getMakerCheckerData().pipe(
      map((data) => ({
        queue,
        items: (Array.isArray(data) ? data : []).map((item: any) => ({
          queueKey: queue.key,
          queueRoute: queue.route,
          queueLabelKey: queue.labelKey,
          queueIcon: queue.icon,
          title: `${item.actionName ?? ''} · ${item.entityName ?? ''}`.trim(),
          detail: item.maker ?? item.checker ?? '',
          meta: item.resourceId ? `#${item.resourceId}` : undefined,
          sortDate: item.madeOnDate ? new Date(item.madeOnDate).getTime() : 0,
          entityLink: item.id ? [
                '/checker-inbox-and-tasks/checker-inbox',
                String(item.id),
                'view'
              ] : undefined,
          queueLink: [
            '/checker-inbox-and-tasks',
            queue.route
          ]
        }))
      })),
      catchError(() => of({ queue, items: [] }))
    );
  }

  private loadClientApproval(queue: TaskQueueNavItem): Observable<PendingTaskGroup> {
    return this.tasksService.getGroupedClientsData().pipe(
      map((data) => {
        const clients = (data?.pageItems ?? []).filter(
          (client: any) => client.active === false && client.status?.value === 'Pending'
        );
        return {
          queue,
          items: clients.map((client: any) => ({
            queueKey: queue.key,
            queueRoute: queue.route,
            queueLabelKey: queue.labelKey,
            queueIcon: queue.icon,
            title: client.displayName ?? client.fullname ?? '',
            detail: client.accountNo ?? '',
            meta: client.officeName,
            sortDate: 0,
            entityLink: client.id ? [
                  '/clients',
                  String(client.id)
                ] : undefined,
            queueLink: [
              '/checker-inbox-and-tasks',
              queue.route
            ]
          }))
        };
      }),
      catchError(() => of({ queue, items: [] }))
    );
  }

  private loadLoanApproval(queue: TaskQueueNavItem): Observable<PendingTaskGroup> {
    return this.tasksService.getAllLoansToBeApproved().pipe(
      map((data) => {
        const loans = (data?.pageItems ?? []).filter((loan: any) => loan.status?.pendingApproval);
        return {
          queue,
          items: loans.map((loan: any) => this.loanRow(queue, loan))
        };
      }),
      catchError(() => of({ queue, items: [] }))
    );
  }

  private loadCouncilApproval(queue: TaskQueueNavItem): Observable<PendingTaskGroup> {
    return this.tasksService.getAllLoansToBeApproved().pipe(
      map((data) => {
        const loans = (data?.pageItems ?? []).filter((loan: any) => loan.status?.waitingForDisbursal === true);
        return {
          queue,
          items: loans.map((loan: any) => this.loanRow(queue, loan))
        };
      }),
      catchError(() => of({ queue, items: [] }))
    );
  }

  private loadLoanDisbursal(queue: TaskQueueNavItem): Observable<PendingTaskGroup> {
    return this.tasksService.getAllLoansToBeDisbursed().pipe(
      map((data) => {
        const loans = (data?.pageItems ?? []).filter((loan: any) => loan.status?.waitingForDisbursal === true);
        return {
          queue,
          items: loans.map((loan: any) => this.loanRow(queue, loan))
        };
      }),
      catchError(() => of({ queue, items: [] }))
    );
  }

  private loadRescheduleLoan(queue: TaskQueueNavItem): Observable<PendingTaskGroup> {
    return this.tasksService.getPendingRescheduleLoans().pipe(
      map((data) => {
        const loans = Array.isArray(data) ? data : (data?.pageItems ?? []);
        return {
          queue,
          items: loans.map((loan: any) => ({
            queueKey: queue.key,
            queueRoute: queue.route,
            queueLabelKey: queue.labelKey,
            queueIcon: queue.icon,
            title: loan.clientName ?? loan.loanAccountNo ?? '',
            detail: loan.loanProductName ?? loan.rescheduleFromDate ?? '',
            meta: loan.rescheduleReasonComment,
            sortDate: loan.rescheduleFromDate ? new Date(loan.rescheduleFromDate).getTime() : 0,
            entityLink: loan.clientId && loan.loanId ? [
                    '/clients',
                    String(loan.clientId),
                    'loans',
                    String(loan.loanId),
                    'general'
                  ] : undefined,
            queueLink: [
              '/checker-inbox-and-tasks',
              queue.route
            ]
          }))
        };
      }),
      catchError(() => of({ queue, items: [] }))
    );
  }

  private loanRow(queue: TaskQueueNavItem, loan: any): PendingTaskRow {
    const entityLink = loan.clientId && loan.id ? [
            '/clients',
            String(loan.clientId),
            'loans-accounts',
            String(loan.id)
          ] : undefined;
    return {
      queueKey: queue.key,
      queueRoute: queue.route,
      queueLabelKey: queue.labelKey,
      queueIcon: queue.icon,
      title: loan.clientName ?? '',
      detail: `${loan.loanProductName ?? ''} (${loan.accountNo ?? ''})`.trim(),
      meta: loan.officeName,
      sortDate: 0,
      entityLink,
      queueLink: [
        '/checker-inbox-and-tasks',
        queue.route
      ]
    };
  }
}
