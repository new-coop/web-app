/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Directive, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';

/**
 * Marks a control as touched on blur so inline errors appear after the user
 * leaves a field — not only on submit (UX: validate on blur).
 */
/* eslint-disable @angular-eslint/directive-selector */
@Directive({
  selector: 'input[matInput], textarea[matInput], mat-select'
})
export class ValidateOnBlurDirective implements OnInit, OnDestroy {
  private control = inject(NgControl, { optional: true });
  private matSelect = inject(MatSelect, { optional: true, host: true });
  private closedSub?: Subscription;

  ngOnInit(): void {
    if (this.matSelect) {
      this.closedSub = this.matSelect.openedChange.subscribe((opened) => {
        if (!opened) {
          this.markTouched();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.closedSub?.unsubscribe();
  }

  @HostListener('blur')
  onBlur(): void {
    if (!this.matSelect) {
      this.markTouched();
    }
  }

  private markTouched(): void {
    const ctrl = this.control?.control;
    if (!ctrl || ctrl.disabled) {
      return;
    }

    ctrl.markAsTouched();
    ctrl.updateValueAndValidity({ emitEvent: false });
  }
}
