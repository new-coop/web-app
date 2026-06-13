/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, AfterViewInit, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';

/** Custom Services */
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NavHubComponent, NavHubSection } from '../shared/nav-hub/nav-hub.component';
import { ConfigWizardStepComponent } from '../configuration-wizard/config-wizard-step/config-wizard-step.component';

@Component({
  selector: 'mifosx-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NavHubComponent,
    ConfigWizardStepComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemComponent implements AfterViewInit {
  private router = inject(Router);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);

  /* Template for popover on manage datables */
  @ViewChild('templateDatatables') templateDatatables: TemplateRef<any>;
  /* Template for popover on manage codes */
  @ViewChild('templateCodes') templateCodes: TemplateRef<any>;
  /* Template for popover on roles and permission */
  @ViewChild('templateRolesandPermission') templateRolesandPermission: TemplateRef<any>;
  /* Template for popover on maker checker tasks */
  @ViewChild('templateMakerCheckerTable') templateMakerCheckerTable: TemplateRef<any>;
  /* Template for popover on configurations */
  @ViewChild('templateConfigurations') templateConfigurations: TemplateRef<any>;
  /* Template for popover on scheduler jobs */
  @ViewChild('templateSchedulerJobs') templateSchedulerJobs: TemplateRef<any>;
  /* Template for popover on manage reports */
  @ViewChild('templateManageReports') templateManageReports: TemplateRef<any>;

  readonly sections: NavHubSection[] = [
    {
      label: 'labels.heading.Customization',
      items: [
        {
          label: 'labels.heading.Manage Data tables',
          description: 'labels.text.Add new extra fields to any entity',
          icon: 'table',
          link: '/system/data-tables',
          anchorId: 'wizard-datatables'
        },
        {
          label: 'labels.heading.Manage Codes',
          description: 'labels.text.Codes are used to define drop down values',
          icon: 'format_list_bulleted',
          link: '/system/codes',
          anchorId: 'wizard-codes'
        },
        {
          label: 'labels.heading.Entity to Entity Mapping',
          description: 'labels.text.Define or modify entity to entity mappings',
          icon: 'account_tree',
          link: '/system/entity-to-entity-mapping'
        },
        {
          label: 'labels.heading.Manage Surveys',
          description: 'labels.text.Manage Surveys',
          icon: 'assignment',
          link: '/system/surveys',
          disabled: true
        }
      ]
    },
    {
      label: 'labels.heading.Security and Oversight',
      items: [
        {
          label: 'labels.heading.Manage Roles and Permissions',
          description: 'labels.text.Define or modify roles and associated permissions',
          icon: 'admin_panel_settings',
          link: '/system/roles-and-permissions',
          anchorId: 'wizard-roles-and-permissions'
        },
        {
          label: 'labels.heading.Configure Maker Checker Tasks',
          description: 'labels.text.Define or modify Maker Checker tasks',
          icon: 'rule',
          link: '/system/configure-mc-tasks',
          anchorId: 'wizard-mc-tasks'
        },
        {
          label: 'labels.heading.Audit Trails',
          description: 'labels.text.Audit logs of all the activities',
          icon: 'history',
          link: '/system/audit-trails'
        }
      ]
    },
    {
      label: 'labels.heading.Automation and Integrations',
      items: [
        {
          label: 'labels.heading.Manage Jobs',
          description: 'labels.text.Manage Schedule and Workflow jobs, modify jobs',
          icon: 'schedule',
          link: '/system/manage-jobs',
          anchorId: 'wizard-scheduler-jobs'
        },
        {
          label: 'labels.heading.Manage Hooks',
          description: 'labels.text.Define Hooks',
          icon: 'webhook',
          link: '/system/hooks'
        },
        {
          label: 'labels.heading.Manage External Events',
          description: 'labels.text.External Events configuration, to enable or disable',
          icon: 'bolt',
          link: '/system/external-events',
          permission: 'READ_EXTERNAL_EVENT_CONFIGURATION'
        },
        {
          label: 'labels.heading.External Services',
          description: 'labels.text.External Services Configuration',
          icon: 'cloud',
          link: '/system/external-services'
        }
      ]
    },
    {
      label: 'labels.heading.Configuration',
      items: [
        {
          label: 'labels.heading.Configurations',
          description: 'labels.text.Global configurations, Cache and Business Date',
          icon: 'tune',
          link: '/system/configurations',
          anchorId: 'wizard-configurations'
        },
        {
          label: 'labels.heading.Account Number Preferences',
          description: 'labels.text.Preferences for generating account numbers for client',
          icon: 'tag',
          link: '/system/account-number-preferences'
        },
        {
          label: 'labels.heading.Manage Reports',
          description: 'labels.text.Add new report and classify reports',
          icon: 'summarize',
          link: '/system/reports',
          anchorId: 'wizard-manage-reports'
        }
      ]
    },
    {
      label: 'labels.heading.About',
      items: [
        {
          label: 'labels.heading.System Information',
          description: 'labels.text.View system version, server and licensing information',
          icon: 'info',
          link: '/system/system-information'
        },
        {
          label: 'labels.heading.About Us',
          description: 'labels.text.Learn about the Mifos Initiative and our mission',
          icon: 'groups',
          link: '/system/about-us'
        }
      ]
    }
  ];

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  closeConfigWizard(): void {
    this.configurationWizardService.closeConfigWizard();
  }

  /**
   * Configuration wizard popovers, anchored to the hub cards by element id.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showDatatables) {
      this.showWizardPopover(this.templateDatatables, 'wizard-datatables');
    }
    if (this.configurationWizardService.showSystemCodes) {
      this.showWizardPopover(this.templateCodes, 'wizard-codes');
    }
    if (this.configurationWizardService.showRolesandPermission) {
      this.showWizardPopover(this.templateRolesandPermission, 'wizard-roles-and-permissions');
    }
    if (this.configurationWizardService.showMakerCheckerTable) {
      this.showWizardPopover(this.templateMakerCheckerTable, 'wizard-mc-tasks');
    }
    if (this.configurationWizardService.showConfigurations) {
      this.showWizardPopover(this.templateConfigurations, 'wizard-configurations');
    }
    if (this.configurationWizardService.showSchedulerJobs) {
      this.showWizardPopover(this.templateSchedulerJobs, 'wizard-scheduler-jobs');
    }
    if (this.configurationWizardService.showManageReports) {
      this.showWizardPopover(this.templateManageReports, 'wizard-manage-reports');
    }
  }

  private showWizardPopover(template: TemplateRef<any>, anchorId: string): void {
    setTimeout(() => {
      const target = document.getElementById(anchorId);
      if (target) {
        this.showPopover(template, target, 'bottom', true);
      }
    });
  }

  /**
   * Next Step (Manage Datatables Page) Configuration Wizard.
   */
  nextStepDatatables() {
    this.configurationWizardService.showDatatables = false;
    this.configurationWizardService.showDatatablesPage = true;
    this.router.navigate(['/system/data-tables']);
  }

  /**
   * Previous Step (Define working days Page) Configuration Wizard.
   */
  previousStepDatatables() {
    this.configurationWizardService.showDatatables = false;
    this.configurationWizardService.showDefineWorkingDays = true;
    this.router.navigate(['/organization/working-days']);
  }

  /**
   * Next Step (Manage Codes Page) Configuration Wizard.
   */
  nextStepCodes() {
    this.configurationWizardService.showSystemCodes = false;
    this.configurationWizardService.showSystemCodesPage = true;
    this.router.navigate(['/system/codes']);
  }

  /**
   * Previous Step (Create Datatables Page) Configuration Wizard.
   */
  previousStepCodes() {
    this.configurationWizardService.showSystemCodes = false;
    this.configurationWizardService.showDatatablesForm = true;
    this.router.navigate(['/system/data-tables/create']);
  }

  /**
   * Next Step (Manage Roles and Permission Page) Configuration Wizard.
   */
  nextStepRolesandPermission() {
    this.configurationWizardService.showRolesandPermission = false;
    this.configurationWizardService.showRolesandPermissionPage = true;
    this.router.navigate(['/system/roles-and-permissions']);
  }

  /**
   * Previous Step (Create Codes Page) Configuration Wizard.
   */
  previousStepRolesandPermission() {
    this.configurationWizardService.showRolesandPermission = false;
    this.configurationWizardService.showSystemCodesForm = true;
    this.router.navigate(['/system/codes/create']);
  }

  /**
   * Next Step (Maker Checker Tasks Page) Configuration Wizard.
   */
  nextStepMakerCheckerTable() {
    this.configurationWizardService.showMakerCheckerTable = false;
    this.configurationWizardService.showMakerCheckerTablePage = true;
    this.router.navigate(['/system/configure-mc-tasks']);
  }

  /**
   * Previous Step (Create User Page) Configuration Wizard.
   */
  previousStepMakerCheckerTable() {
    this.configurationWizardService.showMakerCheckerTable = false;
    this.configurationWizardService.showUsersForm = true;
    this.router.navigate(['/users/create']);
  }

  /**
   * Next Step (Configurations Page) Configuration Wizard.
   */
  nextStepConfigurations() {
    this.configurationWizardService.showConfigurations = false;
    this.configurationWizardService.showConfigurationsPage = true;
    this.router.navigate(['/system/configurations']);
  }

  /**
   * Previous Step (Makerchecker Tasks Page) Configuration Wizard.
   */
  previousStepConfigurations() {
    this.configurationWizardService.showConfigurations = false;
    this.configurationWizardService.showMakerCheckerTableList = true;
    this.router.navigate(['/system/configure-mc-tasks']);
  }

  /**
   * Next Step (Manage Scheduler Jobs Page) Configuration Wizard.
   */
  nextStepSchedulerJobs() {
    this.configurationWizardService.showSchedulerJobs = false;
    this.configurationWizardService.showSchedulerJobsPage = true;
    this.router.navigate(['/system/scheduler-jobs']);
  }

  /**
   * Previous Step (Global Configurations Page) Configuration Wizard.
   */
  previousStepSchedulerJobs() {
    this.configurationWizardService.showSchedulerJobs = false;
    this.configurationWizardService.showConfigurationsList = true;
    this.router.navigate(['/system/global-configurations']);
  }

  /**
   * Next Step (Manage Reports Page) Configuration Wizard.
   */
  nextStepManageReports() {
    this.router.navigate(['/system/reports']);
  }

  /**
   * Previous Step (Manage Funds Page) Configuration Wizard.
   */
  previousStepManageReports() {
    this.configurationWizardService.showManageReports = false;
    this.configurationWizardService.showManageFunds = true;
    this.router.navigate(['/organization/manage-funds']);
  }
}
