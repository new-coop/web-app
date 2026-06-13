/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PopoverRef } from '../popover/popover-ref';
import { M3ButtonComponent } from '../../shared/m3-ui/m3-button/m3-button.component';

/**
 * Reusable configuration-wizard popover body with consistent actions and optional step progress.
 */
@Component({
  selector: 'mifosx-config-wizard-step',
  standalone: true,
  imports: [
    TranslatePipe,
    M3ButtonComponent
  ],
  templateUrl: './config-wizard-step.component.html',
  styleUrl: './config-wizard-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigWizardStepComponent {
  /** Popover reference passed from the ng-template context */
  popover = input.required<PopoverRef>();
  /** Translation key for the step heading */
  heading = input.required<string>();
  /** Translation key for the step description */
  description = input.required<string>();
  /** Optional CSS class on the description paragraph (e.g. mw300) */
  descriptionClass = input<string>('');
  /** Optional 1-based step index; shown with totalSteps */
  step = input<number>();
  /** Optional total step count */
  totalSteps = input<number>();

  closed = output<void>();
  back = output<void>();
  next = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.dismiss(() => this.closed.emit());
  }

  onClose(): void {
    this.dismiss(() => this.closed.emit());
  }

  onBack(): void {
    this.dismiss(() => this.back.emit());
  }

  onNext(): void {
    this.dismiss(() => this.next.emit());
  }

  private dismiss(action: () => void): void {
    this.popover().close();
    action();
  }
}
