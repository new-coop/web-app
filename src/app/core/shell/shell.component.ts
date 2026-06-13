/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** PrimeNG Imports */
import { DrawerModule } from 'primeng/drawer';

/** Custom Services */
import { ProgressBarService } from '../progress-bar/progress-bar.service';
import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';
import { AppTopbarComponent } from './app-topbar/app-topbar.component';
import { GlobalSearchComponent } from './global-search/global-search.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { TranslatePipe } from '@ngx-translate/core';

const SIDEBAR_COLLAPSED_KEY = 'mifosXSidebarCollapsed';

/**
 * Shell component: redesigned layout with domain sidebar,
 * minimal topbar and global search.
 */
@Component({
  selector: 'mifosx-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  imports: [
    AsyncPipe,
    DrawerModule,
    AppSidebarComponent,
    AppTopbarComponent,
    GlobalSearchComponent,
    BreadcrumbComponent,
    ContentComponent,
    FooterComponent,
    TranslatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private progressBarService = inject(ProgressBarService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** Subscription to breakpoint observer for handset. */
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  private isHandset = false;

  /** Sidebar collapsed state, persisted across sessions. */
  sidenavCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  /** Mobile navigation drawer visibility. */
  mobileNavVisible = false;
  /** Progress bar mode. */
  progressBarMode = 'none';

  /**
   * Subscribes to progress bar to update its mode.
   */
  ngOnInit() {
    this.progressBarService.updateProgressBar.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((mode: string) => {
      this.progressBarMode = mode;
      this.cdr.detectChanges();
    });
    this.isHandset$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isHandset) => {
      this.isHandset = isHandset;
    });
  }

  /**
   * Hamburger behavior: collapses the sidebar on desktop,
   * opens the navigation drawer on mobile.
   */
  onMenuToggle() {
    if (this.isHandset) {
      this.mobileNavVisible = true;
    } else {
      this.sidenavCollapsed = !this.sidenavCollapsed;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(this.sidenavCollapsed));
    }
    this.cdr.detectChanges();
  }
}
