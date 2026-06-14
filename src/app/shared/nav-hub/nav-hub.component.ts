/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgTemplateOutlet } from '@angular/common';
import { M3IconComponent } from '../m3-ui/m3-icon/m3-icon.component';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { environment } from '../../../environments/environment';
import { NavHubRecentService } from './nav-hub-recent.service';

export interface NavHubItem {
  /** Translation key (under labels.*) for the card title */
  label: string;
  /** Translation key (under labels.*) for the always-visible description */
  description?: string;
  /** Material Symbols icon name (https://fonts.google.com/icons) */
  icon: string;
  /** Absolute router link, e.g. '/system/codes' */
  link: string | any[];
  queryParams?: Params;
  permission?: string | string[];
  /** DOM id rendered on the card, used by the configuration wizard popovers */
  anchorId?: string;
  disabled?: boolean;
  /** When true, shown in the pinned "Common tasks" section (hidden from its parent section) */
  featured?: boolean;
}

export interface NavHubSection {
  /** Translation key (under labels.*) for the section heading */
  label?: string;
  items: NavHubItem[];
}

/**
 * Landing-page navigation hub: sections of link cards with always-visible
 * descriptions and a quick filter. Replaces the legacy mat-nav-list menus
 * on the Administration landing pages (System, Organization, Products).
 */
@Component({
  selector: 'mifosx-nav-hub',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    NgTemplateOutlet,
    M3IconComponent
  ],
  templateUrl: './nav-hub.component.html',
  styleUrl: './nav-hub.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavHubComponent implements AfterViewInit {
  private translateService = inject(TranslateService);
  private authenticationService = inject(AuthenticationService);
  private recentService = inject(NavHubRecentService);

  private readonly userPermissions: string[] = this.authenticationService.getCredentials()?.permissions ?? [];
  private readonly rbacEnabled = environment.productionModeEnableRBAC;

  /** Translation key for the page subtitle (title lives in the shell breadcrumb) */
  hubSubtitle = input<string>();
  /** Translation key for the local filter placeholder */
  filterPlaceholder = input<string>('labels.text.Search settings');
  /** Scope key for recent-visit tracking, e.g. 'accounting' */
  recentScope = input<string>();
  /** Translation key for the empty filter state (defaults to generic settings message) */
  emptySearchMessage = input<string>('labels.text.No settings match your search');
  /** Translation key for the pinned common-tasks section heading */
  featuredSectionLabel = input<string>('labels.heading.Common tasks');
  sections = input.required<NavHubSection[]>();

  readonly query = signal('');
  /** Enables one-time staggered card entrance after first paint. */
  readonly hasEntered = signal(false);

  readonly hasActiveFilter = computed(() => this.normalize(this.query()).length > 0);

  /** Pinned high-frequency tasks, shown above Recent when not filtering */
  readonly featuredItems = computed<NavHubItem[]>(() => {
    if (this.hasActiveFilter()) {
      return [];
    }
    return this.sections()
      .flatMap((section) => section.items)
      .filter((item) => item.featured && this.isItemPermitted(item) && !item.disabled);
  });

  /** Sections with permission- and filter-aware item lists */
  readonly visibleSections = computed<NavHubSection[]>(() => {
    const query = this.normalize(this.query());
    const hideFeatured = !query && this.featuredItems().length > 0;
    return this.sections()
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => this.isItemPermitted(item) && this.matches(item, query) && !(hideFeatured && item.featured)
        )
      }))
      .filter((section) => section.items.length > 0);
  });

  readonly isAccessDenied = computed(
    () =>
      !this.hasActiveFilter() &&
      this.sections().some((section) => section.items.length > 0) &&
      this.visibleSections().length === 0 &&
      this.featuredItems().length === 0
  );

  readonly recentItems = computed<NavHubItem[]>(() => {
    const scope = this.recentScope();
    if (!scope || this.hasActiveFilter()) {
      return [];
    }
    const available = this.sections()
      .flatMap((section) => section.items)
      .filter((item) => this.isItemPermitted(item) && !item.disabled);
    return this.recentService.getRecent(scope, available);
  });

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.hasEntered.set(true));
  }

  onQueryInput(value: string): void {
    this.query.set(value);
  }

  clearQuery(): void {
    this.query.set('');
  }

  onCardClick(item: NavHubItem): void {
    const scope = this.recentScope();
    if (scope && !item.disabled) {
      this.recentService.recordVisit(scope, item);
    }
  }

  cardEnterDelay(index: number): string {
    return `${index * 45}ms`;
  }

  private matches(item: NavHubItem, query: string): boolean {
    if (!query) {
      return true;
    }
    const title = this.normalize(this.translateService.instant(item.label));
    if (title.includes(query)) {
      return true;
    }
    return item.description ? this.normalize(this.translateService.instant(item.description)).includes(query) : false;
  }

  private isItemPermitted(item: NavHubItem): boolean {
    if (!item.permission) {
      return true;
    }
    return this.hasPermission(item.permission);
  }

  private hasPermission(permission: string | string[]): boolean {
    if (!this.rbacEnabled) {
      return true;
    }
    if (this.userPermissions.includes('ALL_FUNCTIONS')) {
      return true;
    }
    if (typeof permission === 'string') {
      return this.checkSinglePermission(permission);
    }
    return permission.some((p) => this.checkSinglePermission(p));
  }

  private checkSinglePermission(permission: string): boolean {
    const trimmed = permission.trim();
    if (!trimmed) {
      return false;
    }
    if (trimmed.startsWith('READ_') && this.userPermissions.includes('ALL_FUNCTIONS_READ')) {
      return true;
    }
    return this.userPermissions.includes(trimmed);
  }

  /** Case- and accent-insensitive so "configuración" matches "configuracion" */
  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
