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
import {
  countClientsPendingActivation,
  countLoansPendingApproval,
  countLoansWaitingForDisbursal
} from './tasks-queue-filters';

export type TaskQueueCounts = Record<string, number>;

type CountEntry = { key: string; count: number };

@Injectable({
  providedIn: 'root'
})
export class TasksQueueCountsService {
  private tasksService = inject(TasksService);

  private readonly refreshSubject = new Subject<void>();
  /** Emits when queue counts should be re-fetched (e.g. after bulk actions). */
  readonly refresh$ = this.refreshSubject.asObservable();

  invalidate(): void {
    this.refreshSubject.next();
  }

  loadCounts(queueKeys: string[]): Observable<TaskQueueCounts> {
    if (queueKeys.length === 0) {
      return of({});
    }

    const jobs: Observable<CountEntry | CountEntry[]>[] = [];
    const needsLoanApproval = queueKeys.includes('loan-approval');
    const needsCouncilApproval = queueKeys.includes('council-approval');

    if (queueKeys.includes('checker-inbox')) {
      jobs.push(
        this.tasksService.getMakerCheckerData().pipe(
          map((data) => ({ key: 'checker-inbox', count: Array.isArray(data) ? data.length : 0 })),
          catchError(() => of({ key: 'checker-inbox', count: 0 }))
        )
      );
    }

    if (queueKeys.includes('client-approval')) {
      jobs.push(
        this.tasksService.getGroupedClientsData().pipe(
          map((data) => ({
            key: 'client-approval',
            count: countClientsPendingActivation(data?.pageItems ?? [])
          })),
          catchError(() => of({ key: 'client-approval', count: 0 }))
        )
      );
    }

    if (needsLoanApproval || needsCouncilApproval) {
      jobs.push(
        this.tasksService.getAllLoansToBeApproved().pipe(
          map((data) => {
            const items = data?.pageItems ?? [];
            const result: CountEntry[] = [];
            if (needsLoanApproval) {
              result.push({ key: 'loan-approval', count: countLoansPendingApproval(items) });
            }
            if (needsCouncilApproval) {
              result.push({ key: 'council-approval', count: countLoansWaitingForDisbursal(items) });
            }
            return result;
          }),
          catchError(() => {
            const fallback: CountEntry[] = [];
            if (needsLoanApproval) {
              fallback.push({ key: 'loan-approval', count: 0 });
            }
            if (needsCouncilApproval) {
              fallback.push({ key: 'council-approval', count: 0 });
            }
            return of(fallback);
          })
        )
      );
    }

    if (queueKeys.includes('loan-disbursal')) {
      jobs.push(
        this.tasksService.getAllLoansToBeDisbursed().pipe(
          map((data) => ({
            key: 'loan-disbursal',
            count: countLoansWaitingForDisbursal(data?.pageItems ?? [])
          })),
          catchError(() => of({ key: 'loan-disbursal', count: 0 }))
        )
      );
    }

    if (queueKeys.includes('reschedule-loan')) {
      jobs.push(
        this.tasksService.getPendingRescheduleLoans().pipe(
          map((data) => ({
            key: 'reschedule-loan',
            count: Array.isArray(data) ? data.length : (data?.pageItems?.length ?? 0)
          })),
          catchError(() => of({ key: 'reschedule-loan', count: 0 }))
        )
      );
    }

    return forkJoin(jobs).pipe(
      map((results) => {
        const counts: TaskQueueCounts = {};
        results.forEach((entry) => {
          const items = Array.isArray(entry) ? entry : [entry];
          items.forEach((item) => {
            counts[item.key] = item.count;
          });
        });
        return counts;
      })
    );
  }
}
