/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { catchError, finalize, of, take } from 'rxjs';
import { AuthenticationService } from '../../authentication/authentication.service';
import { ConfigurationWizardComponent } from '../../../configuration-wizard/configuration-wizard.component';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { LanguageSelectorComponent } from '../../../shared/language-selector/language-selector.component';
import { InitialsAvatarComponent } from '../../../shared/initials-avatar/initials-avatar.component';
import { M3IconComponent } from '../../../shared/m3-ui/m3-icon/m3-icon.component';
import { NotificationsTrayComponent } from '../../../shared/notifications-tray/notifications-tray.component';
import { KeyboardShortcutsDialogComponent } from '../../../shared/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';
import { ThemeToggleComponent } from '../../../shared/theme-toggle/theme-toggle.component';
import { DocumentationLinksService } from '../../../shared/services/documentation-links.service';
import { environment } from '../../../../environments/environment';

/**
 * Redesigned topbar: sidebar toggle, global search trigger (Ctrl+K),
 * notifications tray, theme, language and user menu.
 */
@Component({
  selector: 'mifosx-app-topbar',
  standalone: true,
  imports: [
    TranslatePipe,
    MenuModule,
    HasPermissionDirective,
    LanguageSelectorComponent,
    InitialsAvatarComponent,
    M3IconComponent,
    NotificationsTrayComponent,
    ThemeToggleComponent
  ],
  templateUrl: './app-topbar.component.html',
  styleUrl: './app-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTopbarComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private configurationWizardService = inject(ConfigurationWizardService);
  private documentationLinks = inject(DocumentationLinksService);

  /** Sidebar collapse (desktop) or drawer open (mobile); the shell decides */
  menuToggle = output<void>();
  searchOpen = output<void>();

  username = '';
  userMenuItems: MenuItem[] = [];
  private userPermissions: string[] = [];
  /** Platform-appropriate shortcut label for global search */
  readonly searchShortcut = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform) ? '⌘K' : 'Ctrl K';

  ngOnInit(): void {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials?.username ?? '';
    this.userPermissions = credentials?.permissions ?? [];
    this.userMenuItems = this.buildUserMenuItems();
  }

  private buildUserMenuItems(): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: this.translateService.instant('labels.menus.Profile'),
        icon: 'account_circle',
        command: () => this.router.navigate(['/profile'])
      },
      {
        label: this.translateService.instant('labels.menus.Settings'),
        icon: 'settings',
        command: () => this.router.navigate(['/settings'])
      },
      {
        label: this.translateService.instant('labels.menus.Help'),
        icon: 'help',
        command: () => this.help()
      },
      {
        label: this.translateService.instant('labels.menus.Keyboard Shortcuts'),
        icon: 'keyboard',
        command: () => this.showKeyboardShortcuts()
      }
    ];

    if (this.hasPermission('READ_CONFIG_WIZARD')) {
      items.push({
        label: this.translateService.instant('labels.menus.Configuration Wizard'),
        icon: 'auto_awesome',
        command: () => this.openConfigWizard()
      });
    }

    items.push(
      { separator: true },
      {
        label: this.translateService.instant('labels.menus.Sign Out'),
        icon: 'logout',
        command: () => this.logout()
      }
    );

    return items;
  }

  /** Global shortcut: Ctrl+K / Cmd+K opens search from anywhere */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchOpen.emit();
    }
  }

  help(): void {
    this.documentationLinks.open('userManual');
  }

  showKeyboardShortcuts(): void {
    this.dialog.open(KeyboardShortcutsDialogComponent);
  }

  openConfigWizard(): void {
    const configWizardRef = this.dialog.open(ConfigurationWizardComponent, {});

    configWizardRef.afterClosed().subscribe((response: { show: number } | undefined) => {
      if (!response) {
        return;
      }

      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';

      switch (response.show) {
        case 1:
          this.configurationWizardService.showToolbar = true;
          this.router.navigate(['/home']);
          break;
        case 2:
          this.configurationWizardService.showCreateOffice = true;
          this.router.navigate(['/organization']);
          break;
        case 3:
          this.configurationWizardService.showDatatables = true;
          this.router.navigate(['/system']);
          break;
        case 4:
          this.configurationWizardService.showChartofAccounts = true;
          this.router.navigate(['/accounting']);
          break;
        case 5:
          this.configurationWizardService.showCharges = true;
          this.router.navigate(['/products']);
          break;
        case 6:
          this.configurationWizardService.showManageFunds = true;
          this.router.navigate(['/organization']);
          break;
      }
    });
  }

  logout(): void {
    this.authenticationService
      .logout()
      .pipe(
        take(1),
        catchError(() => of(void 0)),
        finalize(() => this.router.navigate(['/login'], { replaceUrl: true }))
      )
      .subscribe();
  }

  private hasPermission(permission: string): boolean {
    if (!environment.productionModeEnableRBAC) {
      return true;
    }
    if (this.userPermissions.includes('ALL_FUNCTIONS')) {
      return true;
    }
    if (permission.startsWith('READ_') && this.userPermissions.includes('ALL_FUNCTIONS_READ')) {
      return true;
    }
    return this.userPermissions.includes(permission);
  }
}
