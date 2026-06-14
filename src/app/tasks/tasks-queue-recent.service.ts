/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

const STORAGE_PREFIX = 'mifosXTasksLastQueue';

@Injectable({ providedIn: 'root' })
export class TasksQueueRecentService {
  private authenticationService = inject(AuthenticationService);

  getLastRoute(): string {
    try {
      return localStorage.getItem(this.storageKey()) ?? 'all-pending';
    } catch {
      return 'all-pending';
    }
  }

  recordRoute(route: string): void {
    if (!route || route === '') {
      return;
    }
    try {
      localStorage.setItem(this.storageKey(), route);
    } catch {
      // ignore quota errors
    }
  }

  private storageKey(): string {
    const userId = this.authenticationService.getCredentials()?.userId ?? 'anonymous';
    return `${STORAGE_PREFIX}:${userId}`;
  }
}
