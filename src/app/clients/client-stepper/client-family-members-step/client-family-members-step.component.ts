/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { ClientFamilyMemberDialogComponent } from './client-family-member-dialog/client-family-member-dialog.component';
import { getFormDialogConfig } from 'app/shared/form-dialog/form-dialog.config';
import { FaIconComponent } from 'app/shared/icons/fa-icon.component';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Client Family Members Step
 */
@Component({
  selector: 'mifosx-client-family-members-step',
  templateUrl: './client-family-members-step.component.html',
  styleUrls: ['./client-family-members-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    FindPipe,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientFamilyMembersStepComponent {
  dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  /** Cient Template */
  @Input() clientTemplate: any;
  /** Client Family Members */
  clientFamilyMembers: any[] = [];

  /**
   * Adds a family member.
   */
  addFamilyMember() {
    const addFamilyMemberDialogRef = this.dialog.open(
      ClientFamilyMemberDialogComponent,
      getFormDialogConfig({
        data: {
          isEdit: false,
          options: this.clientTemplate.familyMemberOptions
        }
      })
    );
    addFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.member) {
        this.clientFamilyMembers.push(response.member);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Edits the family member.
   * @param {any} member Family Member
   * @param {any} index Tree Index
   */
  editFamilyMember(member: any, index: any) {
    const addFamilyMemberDialogRef = this.dialog.open(
      ClientFamilyMemberDialogComponent,
      getFormDialogConfig({
        data: {
          isEdit: true,
          member: member,
          options: this.clientTemplate.familyMemberOptions
        }
      })
    );
    addFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.member) {
        this.clientFamilyMembers.splice(index, 1, response.member);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Deletes the family member
   */
  deleteFamilyMember(name: string, index: number) {
    const deleteFamilyMemberDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Family member name : ${name} ${index}` }
    });
    deleteFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientFamilyMembers.splice(index, 1);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Returns the array of client family members.
   */
  get familyMembers() {
    return { familyMembers: this.clientFamilyMembers };
  }
}
