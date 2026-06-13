/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/** rxjs Imports */
import { Observable, forkJoin, of } from 'rxjs';
import { startWith, map, catchError } from 'rxjs/operators';

/** Custom Imports. */
import { activities } from './activities';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';

/** Custom Services */
import { AuthenticationService } from '../core/authentication/authentication.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { SettingsService } from 'app/settings/settings.service';
import { HomeService } from './home.service';

/** Custom Components */
import { NextStepDialogComponent } from '../configuration-wizard/next-step-dialog/next-step-dialog.component';
import { FaIconComponent } from 'app/shared/icons/fa-icon.component';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Key metric displayed on the home dashboard. */
interface KpiCard {
  labelKey: string;
  icon: string;
  theme: 'navy' | 'gold' | 'green' | 'slate';
  value: number | null;
  loaded: boolean;
}

/** Shortcut tile displayed on the home dashboard. */
interface QuickAction {
  labelKey: string;
  icon: string;
  path: string;
}

/**
 * Home component.
 */
@Component({
  selector: 'mifosx-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    WarningDialogComponent,
    MatAutocompleteTrigger,
    MatAutocomplete,
    AsyncPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {
  private authenticationService = inject(AuthenticationService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);
  private settingsService = inject(SettingsService);
  private homeService = inject(HomeService);
  private cdr = inject(ChangeDetectorRef);

  /** Username of authenticated user. */
  username: string;
  /** Tenant name */
  tenant: string;
  /** Activity Form. */
  activityForm: any;
  /** Search Text. */
  searchText: FormControl = new FormControl();
  /** Filtered Activities. */
  filteredActivities: Observable<any[]>;
  /** All User Activities. */
  allActivities: any[] = activities;
  /** Current date, shown in the hero header. */
  today = new Date();
  /** Translation key for the time-of-day greeting. */
  greetingKey = this.resolveGreetingKey();

  /** Key metrics shown at a glance. */
  kpiCards: KpiCard[] = [
    { labelKey: 'labels.heading.Clients', icon: 'users', theme: 'navy', value: null, loaded: false },
    { labelKey: 'labels.heading.Loan Accounts', icon: 'hand-holding-usd', theme: 'gold', value: null, loaded: false },
    { labelKey: 'labels.heading.Savings Accounts', icon: 'piggy-bank', theme: 'green', value: null, loaded: false },
    { labelKey: 'labels.heading.Offices', icon: 'building', theme: 'slate', value: null, loaded: false }
  ];

  /** Most common day-to-day destinations. */
  quickActions: QuickAction[] = [
    { labelKey: 'labels.buttons.Create Client', icon: 'plus', path: '/clients/create' },
    { labelKey: 'labels.menus.Clients', icon: 'users', path: '/clients' },
    { labelKey: 'labels.heading.Loan Products', icon: 'hand-holding-usd', path: '/products/loan-products' },
    { labelKey: 'labels.menus.Accounting', icon: 'book', path: '/accounting' },
    { labelKey: 'labels.menus.Reports', icon: 'chart-line', path: '/reports' },
    { labelKey: 'labels.menus.Organization', icon: 'sitemap', path: '/organization' }
  ];

  /* Reference of dashboard button */
  @ViewChild('buttonDashboard', { static: false }) buttonDashboard: ElementRef<any>;
  /* Template for popover on dashboard button */
  @ViewChild('templateButtonDashboard', { static: false }) templateButtonDashboard: TemplateRef<any>;
  /* Reference of search activity */
  @ViewChild('searchActivity', { static: false }) searchActivity: ElementRef<any>;
  /* Template for popover on search activity */
  @ViewChild('templateSearchActivity', { static: false }) templateSearchActivity: TemplateRef<any>;

  // All dependencies are injected using inject() above. No constructor needed.
  constructor() {}

  /**
   * Sets the username of the authenticated user.
   * Set Form.
   */
  ngOnInit() {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
    this.tenant = this.tenantIdentifier();
    this.setFilteredActivities();
    this.loadKpis();
  }

  /**
   * Loads headline metrics; each one degrades gracefully to an em dash on error.
   */
  private loadKpis(): void {
    forkJoin([
      this.homeService.getClientsCount().pipe(catchError(() => of(null))),
      this.homeService.getLoanAccountsCount().pipe(catchError(() => of(null))),
      this.homeService.getSavingsAccountsCount().pipe(catchError(() => of(null))),
      this.homeService.getOfficesCount().pipe(catchError(() => of(null)))
    ]).subscribe((values: (number | null)[]) => {
      values.forEach((value, index) => {
        this.kpiCards[index].value = value;
        this.kpiCards[index].loaded = true;
      });
      this.cdr.markForCheck();
    });
  }

  /**
   * Greeting translation key based on local time of day.
   */
  private resolveGreetingKey(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'labels.text.Good Morning';
    }
    return hour < 18 ? 'labels.text.Good Afternoon' : 'labels.text.Good Evening';
  }

  /**
   * Sets filtered activities for autocomplete.
   */
  setFilteredActivities() {
    this.filteredActivities = this.searchText.valueChanges.pipe(
      map((activity: any) => (typeof activity === 'string' ? activity : activity.activity)),
      map((activityName: string) => (activityName ? this.filterActivity(activityName) : this.allActivities))
    );
  }

  /**
   * Filters activities.
   * @param activityName Activity name to filter activity by.
   * @returns {any} Filtered activities.
   */
  private filterActivity(activityName: string): any {
    const filterValue = activityName.toLowerCase();
    return this.allActivities.filter((activity) => activity.activity.toLowerCase().indexOf(filterValue) === 0);
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showHome) {
      setTimeout(() => {
        this.showPopover(this.templateButtonDashboard, this.buttonDashboard.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showHomeSearchActivity) {
      setTimeout(() => {
        this.showPopover(this.templateSearchActivity, this.searchActivity.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Open Dialog for next step.
   * Next Step (Organization) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showHome = false;
    this.configurationWizardService.showHomeSearchActivity = false;
    this.openNextStepDialog();
  }

  /**
   * Next Step (Organization) Dialog Configuration Wizard.
   */
  openNextStepDialog() {
    const nextStepDialogRef = this.dialog.open(NextStepDialogComponent, {
      data: {
        nextStepName: 'Setup Organization',
        previousStepName: 'Home Tour',
        stepPercentage: 10
      }
    });
    nextStepDialogRef.afterClosed().subscribe((response: { nextStep: boolean }) => {
      if (response.nextStep) {
        this.configurationWizardService.showHome = false;
        this.configurationWizardService.showHomeSearchActivity = false;
        this.configurationWizardService.showCreateOffice = true;
        this.router.navigate(['/organization']);
      } else {
        this.configurationWizardService.showHome = false;
        this.configurationWizardService.showHomeSearchActivity = false;
        this.router.navigate(['/home']);
      }
    });
  }

  /**
   * Previous Step (Breadcrumbs) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showHome = false;
    this.configurationWizardService.showHomeSearchActivity = false;
    this.configurationWizardService.showBreadcrumbs = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }

  tenantIdentifier() {
    if (!this.settingsService.tenantIdentifier || this.settingsService.tenantIdentifier === '') {
      return 'default';
    }
    return this.settingsService.tenantIdentifier;
  }
}
