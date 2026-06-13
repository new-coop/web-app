/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { NgTemplateOutlet } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { M3IconComponent } from '../../../shared/m3-ui/m3-icon/m3-icon.component';
import { remittanceConfig } from '../../../remittances/remittance.config';

interface NavItem {
  /** Key under labels.menus in translation files */
  label: string;
  /** Material Symbols icon name (https://fonts.google.com/icons) */
  icon: string;
  link: string;
  permission?: string | string[];
}

interface NavSection {
  /** Key under labels.menus; omitted for the top (Home) section */
  label?: string;
  items: NavItem[];
}

/**
 * Application sidebar: workflow domains with restored shortcuts from the legacy nav.
 */
@Component({
  selector: 'mifosx-app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    TooltipModule,
    NgTemplateOutlet,
    HasPermissionDirective,
    M3IconComponent
  ],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSidebarComponent {
  collapsed = input(false);
  /** Shows the collapse/expand toggle; enabled on desktop, off in the mobile drawer */
  collapsible = input(false);
  /** Emitted on every navigation; lets the mobile drawer close itself */
  navigated = output<void>();
  /** Emitted when the user clicks the collapse/expand toggle */
  collapseToggle = output<void>();

  readonly sections: NavSection[] = this.buildSections();

  private buildSections(): NavSection[] {
    const operationsItems: NavItem[] = [
      {
        label: 'Checker Inbox and Tasks',
        icon: 'fact_check',
        link: '/checker-inbox-and-tasks/checker-inbox',
        permission: [
          'ALL_FUNCTIONS_READ',
          'READ_MAKERCHECKER',
          'APPROVE_LOAN',
          'APPROVE_LOAN_CHECKER'
        ]
      },
      {
        label: 'Collection Sheet',
        icon: 'checklist',
        link: '/collections/collection-sheet',
        permission: 'READ_COLLECTIONSHEET'
      },
      {
        label: 'Individual Collection Sheet',
        icon: 'checklist_rtl',
        link: '/collections/individual-collection-sheet',
        permission: 'READ_COLLECTIONSHEET'
      },
      { label: 'Accounting', icon: 'account_balance', link: '/accounting', permission: 'READ_GLACCOUNT' }
    ];

    if (remittanceConfig.isRemittanceEnabled) {
      operationsItems.push({
        label: 'Remittances',
        icon: 'currency_exchange',
        link: '/remittances/process'
      });
    }

    return [
      {
        items: [
          { label: 'Home', icon: 'home', link: '/home' },
          { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
          { label: 'Navigation', icon: 'explore', link: '/navigation', permission: 'READ_CLIENT' }
        ]
      },
      {
        label: 'Clients',
        items: [
          { label: 'Clients', icon: 'person', link: '/clients', permission: 'READ_CLIENT' },
          { label: 'Groups', icon: 'group', link: '/groups', permission: 'READ_GROUP' },
          { label: 'Centers', icon: 'domain', link: '/centers', permission: 'READ_CENTER' }
        ]
      },
      {
        label: 'Operations',
        items: operationsItems
      },
      {
        label: 'Reports',
        items: [
          { label: 'Reports', icon: 'bar_chart', link: '/reports', permission: 'READ_REPORT' }
        ]
      },
      {
        label: 'Administration',
        items: [
          { label: 'Organization', icon: 'corporate_fare', link: '/organization', permission: 'READ_OFFICE' },
          { label: 'Products', icon: 'payments', link: '/products', permission: 'READ_LOANPRODUCT' },
          { label: 'Users', icon: 'manage_accounts', link: '/appusers', permission: 'READ_USER' },
          { label: 'Templates', icon: 'description', link: '/templates', permission: 'READ_TEMPLATE' },
          { label: 'System', icon: 'settings', link: '/system', permission: 'ALL_FUNCTIONS_READ' }
        ]
      }
    ];
  }
}
