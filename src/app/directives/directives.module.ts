/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Custom Directives */
import { HasPermissionDirective } from './has-permission/has-permission.directive';
import { FormatAmountDirective } from './format-amount.directive';
import { ValidateOnFocusDirective } from './validate-on-focus.directive';
import { TouchOnSubmitDirective } from './touch-on-submit.directive';
import { ValidateOnBlurDirective } from './validate-on-blur.directive';
import { PositiveNumberDirective } from './positive-number.directive';
import { PositiveIntegerDirective } from './positive-integer.directive';
import { FieldIconDirective } from './field-icon/field-icon.directive';

/**
 *  Directives Module
 *
 *  All custom directives should be declared and exported here.
 */
@NgModule({
  imports: [
    CommonModule,
    HasPermissionDirective,
    FormatAmountDirective,
    ValidateOnFocusDirective,
    ValidateOnBlurDirective,
    TouchOnSubmitDirective,
    PositiveNumberDirective,
    PositiveIntegerDirective,
    FieldIconDirective
  ],
  exports: [
    HasPermissionDirective,
    FormatAmountDirective,
    ValidateOnFocusDirective,
    ValidateOnBlurDirective,
    TouchOnSubmitDirective,
    PositiveNumberDirective,
    PositiveIntegerDirective,
    FieldIconDirective
  ]
})
export class DirectivesModule {}
