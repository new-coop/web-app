/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { Router } from '@angular/router';

/** Custom Services */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Credentials } from 'app/core/authentication/credentials.model';
import { ChangePasswordDialogComponent } from 'app/shared/change-password-dialog/change-password-dialog.component';
import { SettingsService } from 'app/settings/settings.service';
import { InitialsAvatarComponent } from 'app/shared/initials-avatar/initials-avatar.component';
import { M3ButtonComponent } from 'app/shared/m3-ui/m3-button/m3-button.component';
import { M3IconComponent } from 'app/shared/m3-ui/m3-icon/m3-icon.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Profile Component.
 */
@Component({
  selector: 'mifosx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InitialsAvatarComponent,
    M3ButtonComponent,
    M3IconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  dialog = inject(MatDialog);

  /** Profile Data */
  profileData: Credentials;

  /** Roles Table Datasource */
  dataSource = new MatTableDataSource();
  /** Columns to be displayed in user roles table. */
  displayedColumns: string[] = [
    'role',
    'description'
  ];

  constructor() {
    this.profileData = this.authenticationService.getCredentials()!;
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.profileData.roles);
  }

  get rolesCount(): number {
    return this.profileData?.roles?.length ?? 0;
  }

  get permissionsCount(): number {
    return this.profileData?.permissions?.length ?? 0;
  }

  get languageName(): string {
    return this.settingsService.language?.name ?? 'English';
  }

  get tenantIdentifier(): string {
    return this.settingsService.tenantIdentifier || 'default';
  }

  navigateToPermissions(): void {
    this.router.navigate([
      '/system',
      'roles-and-permissions'
    ]);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  /**
   * Change Password of the user.
   */
  changeUserPassword() {
    const changeUserPasswordDialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px',
      height: '300px'
    });
    changeUserPasswordDialogRef.afterClosed().subscribe((response: any) => {
      if (response.password && response.repeatPassword) {
        const password = response.password;
        const repeatPassword = response.repeatPassword;
        const data = { password: password, repeatPassword: repeatPassword };
        this.authenticationService.changePassword(String(this.profileData.userId), data).subscribe(() => {
          this.router.navigate(['/home']);
        });
      }
    });
  }
}
