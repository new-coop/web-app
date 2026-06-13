/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Directive, HostListener, inject } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

/**
 * Marks every control as touched when a form is submitted while invalid,
 * so inline errors surface in one pass (UX: submit feedback).
 */
/* eslint-disable @angular-eslint/directive-selector */
@Directive({
  selector: 'form[formGroup]'
})
export class TouchOnSubmitDirective {
  private formGroup = inject(FormGroupDirective, { self: true, optional: true });

  @HostListener('ngSubmit')
  onSubmit(): void {
    const form = this.formGroup?.form;
    if (form?.invalid) {
      form.markAllAsTouched();
    }
  }
}
