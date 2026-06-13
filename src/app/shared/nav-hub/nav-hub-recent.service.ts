/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { NavHubItem } from './nav-hub.component';

const STORAGE_KEY = 'mifosXNavHubRecent';
const VISITED_KEY = 'mifosXNavHubVisited';
const MAX_RECENT = 3;

type RecentStore = Record<string, NavHubItem[]>;
type VisitedStore = Record<string, string[]>;

/**
 * Persists recently visited nav-hub cards per module scope (localStorage).
 */
@Injectable({ providedIn: 'root' })
export class NavHubRecentService {
  getRecent(scope: string, availableItems: NavHubItem[]): NavHubItem[] {
    const availableByLink = new Map(
      availableItems.map((item) => [
        this.linkKey(item),
        item
      ])
    );
    return (this.readStore()[scope] ?? [])
      .map((stored) => availableByLink.get(this.linkKey(stored)))
      .filter((item): item is NavHubItem => !!item)
      .slice(0, MAX_RECENT);
  }

  recordVisit(scope: string, item: NavHubItem): void {
    const store = this.readStore();
    const key = this.linkKey(item);
    const next = [
      this.toStoredItem(item),
      ...(store[scope] ?? []).filter((s) => this.linkKey(s) !== key)
    ].slice(0, MAX_RECENT);
    store[scope] = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    this.recordExplored(scope, item);
  }

  getExploredKeys(scope: string): string[] {
    return this.readVisitedStore()[scope] ?? [];
  }

  hasExplored(scope: string, item: NavHubItem): boolean {
    return this.getExploredKeys(scope).includes(this.linkKey(item));
  }

  private recordExplored(scope: string, item: NavHubItem): void {
    const key = this.linkKey(item);
    const store = this.readVisitedStore();
    const visited = store[scope] ?? [];
    if (visited.includes(key)) {
      return;
    }
    store[scope] = [
      ...visited,
      key
    ];
    localStorage.setItem(VISITED_KEY, JSON.stringify(store));
  }

  private toStoredItem(item: NavHubItem): NavHubItem {
    return {
      label: item.label,
      description: item.description,
      icon: item.icon,
      link: item.link,
      queryParams: item.queryParams,
      permission: item.permission
    };
  }

  private linkKey(item: NavHubItem): string {
    return Array.isArray(item.link) ? item.link.join('/') : String(item.link);
  }

  private readStore(): RecentStore {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RecentStore) : {};
    } catch {
      return {};
    }
  }

  private readVisitedStore(): VisitedStore {
    try {
      const raw = localStorage.getItem(VISITED_KEY);
      return raw ? (JSON.parse(raw) as VisitedStore) : {};
    } catch {
      return {};
    }
  }
}
