/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { environment } from 'environments/environment';

export function isTaskQueuePermitted(userPermissions: string[], permission?: string | string[]): boolean {
  if (!permission) {
    return true;
  }
  if (!environment.productionModeEnableRBAC) {
    return true;
  }
  if (userPermissions.includes('ALL_FUNCTIONS')) {
    return true;
  }
  if (typeof permission === 'string') {
    return checkSingleTaskPermission(userPermissions, permission);
  }
  return permission.some((p) => checkSingleTaskPermission(userPermissions, p));
}

function checkSingleTaskPermission(userPermissions: string[], permission: string): boolean {
  const trimmed = permission.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.startsWith('READ_') && userPermissions.includes('ALL_FUNCTIONS_READ')) {
    return true;
  }
  return userPermissions.includes(trimmed);
}
