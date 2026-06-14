/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  afterNextRender,
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  Input,
  createComponent,
  inject
} from '@angular/core';
import { resolveFieldIcon } from 'app/core/utils/field-icon';
import { M3IconComponent } from 'app/shared/m3-ui/m3-icon/m3-icon.component';

const FORM_CONTEXT_SELECTOR = [
  '.form-workspace',
  '.form-grid',
  '.form-page',
  '.form-card',
  '.form-array-row',
  '.form-section',
  '.login-field',
  '.reset-password-field',
  '.two-factor-auth-input',
  '.auth-tenant',
  '[mat-dialog-content]'
].join(', ');

/**
 * Adds a contextual prefix icon inside Material's form-field flex row.
 * Only runs in workspace / dialog forms — not list filters or toolbars.
 */
/* eslint-disable @angular-eslint/directive-selector */
@Directive({
  selector: 'mat-form-field'
})
export class FieldIconDirective {
  /** false skips auto icon; a string uses that Material Symbol name directly. */
  @Input() mifosxFieldIcon: boolean | string = true;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private iconRef?: ComponentRef<M3IconComponent>;

  constructor() {
    afterNextRender(() => this.attachIconIfNeeded());
  }

  private attachIconIfNeeded(): void {
    if (this.mifosxFieldIcon === false || this.shouldSkip()) {
      return;
    }

    const iconName =
      typeof this.mifosxFieldIcon === 'string' && this.mifosxFieldIcon.length > 0
        ? this.mifosxFieldIcon
        : resolveFieldIcon(this.buildContext());

    if (!iconName) {
      return;
    }

    const flex = this.host.nativeElement.querySelector('.mat-mdc-form-field-flex');
    if (!flex || flex.querySelector('.mifosx-auto-field-icon')) {
      return;
    }

    const prefixShell = document.createElement('div');
    prefixShell.classList.add('mat-mdc-form-field-icon-prefix', 'mifosx-auto-field-icon');

    this.iconRef = createComponent(M3IconComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: prefixShell
    });
    this.iconRef.setInput('name', iconName);
    this.iconRef.setInput('variant', 'duotone');
    this.iconRef.setInput('size', 20);
    this.iconRef.changeDetectorRef.detectChanges();

    flex.insertBefore(prefixShell, flex.firstChild);
    this.host.nativeElement.classList.add('mifosx-has-field-icon');

    this.destroyRef.onDestroy(() => this.iconRef?.destroy());
  }

  private shouldSkip(): boolean {
    const host = this.host.nativeElement;

    if (this.hasExistingPrefix()) {
      return true;
    }

    if (!host.closest(FORM_CONTEXT_SELECTOR)) {
      return true;
    }

    if (host.closest('.mat-mdc-select-panel, .mat-mdc-autocomplete-panel, .auth-toolbar')) {
      return true;
    }

    if (host.querySelector('.input-group')) {
      return true;
    }

    // Selects already expose a dropdown affordance; prefix icons read as stray glyphs when empty.
    if (host.querySelector('mat-select')) {
      return true;
    }

    // Date fields use the suffix datepicker toggle — skip duplicate calendar prefix.
    if (host.querySelector('mat-datepicker-toggle, [matDatepicker]')) {
      return true;
    }

    // Form dialogs use a compact grid; prefix icons add noise without aiding scan.
    if (host.closest('.form-dialog-form')) {
      return true;
    }

    const input = host.querySelector('input[matInput], textarea[matInput]') as HTMLInputElement | null;
    if (input?.disabled) {
      return true;
    }

    return false;
  }

  private hasExistingPrefix(): boolean {
    const host = this.host.nativeElement;
    return !!(
      host.querySelector('[matIconPrefix], [matPrefix], mifosx-m3-icon[matIconPrefix]') ||
      host.querySelector('.mat-mdc-form-field-icon-prefix mifosx-m3-icon, .mifosx-auto-field-icon')
    );
  }

  private buildContext() {
    const host = this.host.nativeElement;
    const input = host.querySelector('input[matInput], textarea[matInput]') as HTMLInputElement | null;
    const select = host.querySelector('mat-select');
    const label =
      host.querySelector('mat-label')?.textContent?.trim() ??
      input?.getAttribute('placeholder') ??
      select?.getAttribute('placeholder') ??
      null;

    return {
      type: input?.type ?? (input?.tagName.toLowerCase() === 'textarea' ? 'textarea' : null),
      controlName: input?.getAttribute('formControlName') ?? select?.getAttribute('formControlName') ?? null,
      label,
      isSelect: !!select,
      hasDatepicker: !!host.querySelector('[matDatepicker], mat-datepicker-toggle')
    };
  }
}
