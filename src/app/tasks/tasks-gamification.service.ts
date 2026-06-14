/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject, signal } from '@angular/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import {
  TASK_ACHIEVEMENTS,
  TASK_DAILY_GOAL,
  TASK_MAX_LEVEL,
  TASK_XP_BY_ACTION,
  TASK_XP_PER_LEVEL,
  TaskAchievementDef,
  TaskGamificationAction
} from './tasks-gamification.config';

const STORAGE_PREFIX = 'mifosXTasksGamification';

export interface TaskGamificationState {
  totalXp: number;
  totalCompleted: number;
  streak: number;
  lastActiveDate: string | null;
  todayCompleted: number;
  todayDate: string | null;
  unlockedAchievements: string[];
}

export interface TaskGamificationSnapshot {
  level: number;
  levelTitleKey: string;
  xpInLevel: number;
  xpToNextLevel: number;
  levelProgress: number;
  totalXp: number;
  totalCompleted: number;
  streak: number;
  todayCompleted: number;
  dailyGoal: number;
  dailyGoalProgress: number;
  achievements: Array<TaskAchievementDef & { unlocked: boolean }>;
  newlyUnlockedAchievementIds: string[];
}

const EMPTY_STATE: TaskGamificationState = {
  totalXp: 0,
  totalCompleted: 0,
  streak: 0,
  lastActiveDate: null,
  todayCompleted: 0,
  todayDate: null,
  unlockedAchievements: []
};

@Injectable({ providedIn: 'root' })
export class TasksGamificationService {
  private authenticationService = inject(AuthenticationService);

  private readonly state = signal<TaskGamificationState>(this.loadState());
  readonly snapshot = signal<TaskGamificationSnapshot>(this.buildSnapshot(this.state(), []));

  recordCompletions(count: number, action: TaskGamificationAction = 'approve'): void {
    if (count <= 0) {
      return;
    }

    const today = this.todayKey();
    const current = { ...this.state() };
    const xpGain = count * TASK_XP_BY_ACTION[action];

    if (current.todayDate !== today) {
      current.todayDate = today;
      current.todayCompleted = 0;
    }

    current.totalXp += xpGain;
    current.totalCompleted += count;
    current.todayCompleted += count;
    current.streak = this.nextStreak(current.lastActiveDate, current.streak, today);
    current.lastActiveDate = today;

    const newlyUnlocked = this.evaluateAchievements(current);
    this.persist(current);
    this.state.set(current);
    this.snapshot.set(this.buildSnapshot(current, newlyUnlocked));
  }

  checkInboxZero(totalPending: number): void {
    if (totalPending > 0) {
      return;
    }

    const current = { ...this.state() };
    if (current.totalCompleted === 0 || current.unlockedAchievements.includes('inbox-zero')) {
      return;
    }

    const newlyUnlocked = this.unlockAchievements(current, ['inbox-zero']);
    if (newlyUnlocked.length === 0) {
      return;
    }

    this.persist(current);
    this.state.set(current);
    this.snapshot.set(this.buildSnapshot(current, newlyUnlocked));
  }

  private nextStreak(lastActiveDate: string | null, streak: number, today: string): number {
    if (lastActiveDate === today) {
      return streak;
    }
    if (lastActiveDate === this.yesterdayKey(today)) {
      return streak + 1;
    }
    return 1;
  }

  private evaluateAchievements(state: TaskGamificationState): string[] {
    const candidates: string[] = [];
    if (state.totalCompleted >= 1) {
      candidates.push('first-task');
    }
    if (state.totalCompleted >= 10) {
      candidates.push('tasks-10');
    }
    if (state.totalCompleted >= 50) {
      candidates.push('tasks-50');
    }
    if (state.streak >= 3) {
      candidates.push('streak-3');
    }
    if (state.streak >= 7) {
      candidates.push('streak-7');
    }
    return this.unlockAchievements(state, candidates);
  }

  private unlockAchievements(state: TaskGamificationState, ids: string[]): string[] {
    const newlyUnlocked: string[] = [];
    ids.forEach((id) => {
      if (!state.unlockedAchievements.includes(id)) {
        state.unlockedAchievements = [
          ...state.unlockedAchievements,
          id
        ];
        newlyUnlocked.push(id);
      }
    });
    return newlyUnlocked;
  }

  private buildSnapshot(state: TaskGamificationState, newlyUnlockedAchievementIds: string[]): TaskGamificationSnapshot {
    const level = Math.min(TASK_MAX_LEVEL, Math.floor(state.totalXp / TASK_XP_PER_LEVEL) + 1);
    const xpInLevel = state.totalXp % TASK_XP_PER_LEVEL;
    const xpToNextLevel = level >= TASK_MAX_LEVEL ? TASK_XP_PER_LEVEL : TASK_XP_PER_LEVEL - xpInLevel;
    const levelProgress = level >= TASK_MAX_LEVEL ? 1 : xpInLevel / TASK_XP_PER_LEVEL;

    return {
      level,
      levelTitleKey: `labels.text.Tasks gamification level ${level}`,
      xpInLevel,
      xpToNextLevel,
      levelProgress,
      totalXp: state.totalXp,
      totalCompleted: state.totalCompleted,
      streak: state.streak,
      todayCompleted: state.todayDate === this.todayKey() ? state.todayCompleted : 0,
      dailyGoal: TASK_DAILY_GOAL,
      dailyGoalProgress: Math.min(
        1,
        (state.todayDate === this.todayKey() ? state.todayCompleted : 0) / TASK_DAILY_GOAL
      ),
      achievements: TASK_ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        unlocked: state.unlockedAchievements.includes(achievement.id)
      })),
      newlyUnlockedAchievementIds
    };
  }

  private loadState(): TaskGamificationState {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) {
        return { ...EMPTY_STATE };
      }
      const parsed = JSON.parse(raw) as Partial<TaskGamificationState>;
      return {
        ...EMPTY_STATE,
        ...parsed,
        unlockedAchievements: parsed.unlockedAchievements ?? []
      };
    } catch {
      return { ...EMPTY_STATE };
    }
  }

  private persist(state: TaskGamificationState): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(state));
  }

  private storageKey(): string {
    const userId = this.authenticationService.getCredentials()?.userId ?? 'anonymous';
    return `${STORAGE_PREFIX}:${userId}`;
  }

  private todayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private yesterdayKey(today: string): string {
    const date = new Date(`${today}T12:00:00`);
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
  }
}
