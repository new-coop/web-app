/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type TaskGamificationAction = 'approve' | 'reject' | 'delete';

export interface TaskAchievementDef {
  id: string;
  icon: string;
  labelKey: string;
  descriptionKey: string;
}

export const TASK_XP_BY_ACTION: Record<TaskGamificationAction, number> = {
  approve: 10,
  reject: 5,
  delete: 5
};

export const TASK_XP_PER_LEVEL = 100;
export const TASK_MAX_LEVEL = 10;
export const TASK_DAILY_GOAL = 5;
export const TASK_QUEUE_HOT_THRESHOLD = 5;

export const TASK_ACHIEVEMENTS: TaskAchievementDef[] = [
  {
    id: 'first-task',
    icon: 'flag',
    labelKey: 'labels.text.Tasks achievement first task',
    descriptionKey: 'labels.text.Tasks achievement first task desc'
  },
  {
    id: 'tasks-10',
    icon: 'military_tech',
    labelKey: 'labels.text.Tasks achievement tasks 10',
    descriptionKey: 'labels.text.Tasks achievement tasks 10 desc'
  },
  {
    id: 'tasks-50',
    icon: 'workspace_premium',
    labelKey: 'labels.text.Tasks achievement tasks 50',
    descriptionKey: 'labels.text.Tasks achievement tasks 50 desc'
  },
  {
    id: 'streak-3',
    icon: 'local_fire_department',
    labelKey: 'labels.text.Tasks achievement streak 3',
    descriptionKey: 'labels.text.Tasks achievement streak 3 desc'
  },
  {
    id: 'streak-7',
    icon: 'whatshot',
    labelKey: 'labels.text.Tasks achievement streak 7',
    descriptionKey: 'labels.text.Tasks achievement streak 7 desc'
  },
  {
    id: 'inbox-zero',
    icon: 'inbox',
    labelKey: 'labels.text.Tasks achievement inbox zero',
    descriptionKey: 'labels.text.Tasks achievement inbox zero desc'
  }
];
