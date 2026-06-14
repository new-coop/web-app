/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface TaskQueueNavItem {
  key: string;
  route: string;
  /** Translation key (labels.*) */
  labelKey: string;
  /** Material Symbols icon name */
  icon: string;
  /** Translation key (labels.text.*) — short queue description */
  descriptionKey: string;
  permission?: string | string[];
}

/** Unified inbox — all queues in one workbench view. */
export const ALL_PENDING_QUEUE: TaskQueueNavItem = {
  key: 'all-pending',
  route: 'all-pending',
  labelKey: 'labels.text.Tasks all pending',
  icon: 'playlist_add_check',
  descriptionKey: 'labels.text.Tasks all pending desc'
};

/** Queues for checker inbox & tasks — card picker + routed content. */
export const TASK_QUEUES: TaskQueueNavItem[] = [
  {
    key: 'checker-inbox',
    route: 'checker-inbox',
    labelKey: 'labels.inputs.Checker Inbox',
    icon: 'inbox',
    descriptionKey: 'labels.text.Tasks queue checker inbox',
    permission: [
      'ALL_FUNCTIONS_READ',
      'READ_MAKERCHECKER',
      'APPROVE_LOAN',
      'APPROVE_LOAN_CHECKER'
    ]
  },
  {
    key: 'client-approval',
    route: 'client-approval',
    labelKey: 'labels.inputs.Client Approval',
    icon: 'group',
    descriptionKey: 'labels.text.Tasks queue client approval',
    permission: 'READ_CLIENT'
  },
  {
    key: 'loan-approval',
    route: 'loan-approval',
    labelKey: 'labels.inputs.Loan Approval',
    icon: 'assignment',
    descriptionKey: 'labels.text.Tasks queue loan approval',
    permission: 'READ_LOAN'
  },
  {
    key: 'council-approval',
    route: 'council-approval',
    labelKey: 'labels.text.Council Approval',
    icon: 'gavel',
    descriptionKey: 'labels.text.Tasks queue council approval',
    permission: [
      'ALL_FUNCTIONS_READ',
      'READ_MAKERCHECKER',
      'APPROVE_LOAN',
      'APPROVE_LOAN_CHECKER'
    ]
  },
  {
    key: 'loan-disbursal',
    route: 'loan-disbursal',
    labelKey: 'labels.inputs.Loan Disbursal',
    icon: 'payments',
    descriptionKey: 'labels.text.Tasks queue loan disbursal',
    permission: 'READ_LOAN'
  },
  {
    key: 'reschedule-loan',
    route: 'reschedule-loan',
    labelKey: 'labels.inputs.Reschedule Loan',
    icon: 'event_repeat',
    descriptionKey: 'labels.text.Tasks queue reschedule loan',
    permission: 'RESCHEDULE_LOAN'
  }
];
