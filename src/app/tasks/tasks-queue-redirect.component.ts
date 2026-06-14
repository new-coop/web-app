/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksQueueRecentService } from './tasks-queue-recent.service';

@Component({
  selector: 'mifosx-tasks-queue-redirect',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksQueueRedirectComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private recentService = inject(TasksQueueRecentService);

  ngOnInit(): void {
    const lastRoute = this.recentService.getLastRoute();
    this.router.navigate([lastRoute], { relativeTo: this.route, replaceUrl: true });
  }
}
