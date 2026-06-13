/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * KPI summary card: label on top, large tabular figure, optional detail line.
 * Pass `link` to make the whole card navigate (keyboard accessible).
 */
@Component({
  selector: 'mifosx-summary-card',
  standalone: true,
  imports: [SkeletonModule],
  template: `
    <div
      class="summary-card"
      [class.clickable]="!!link()"
      [attr.tabindex]="link() ? 0 : null"
      [attr.role]="link() ? 'link' : null"
      (click)="navigate()"
      (keydown.enter)="navigate()"
    >
      <span class="label">{{ label() }}</span>
      @if (loading()) {
        <p-skeleton height="2rem" width="60%" />
      } @else {
        <span class="value numeric" [class]="'value numeric ' + tone()">{{ value() }}</span>
        @if (detail()) {
          <span class="detail">{{ detail() }}</span>
        }
      }
    </div>
  `,
  styles: `
    .summary-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      padding: var(--space-4);
      background: var(--p-surface-0);
      border: 1px solid var(--p-surface-200);
      border-radius: var(--radius-md);

      &.clickable {
        cursor: pointer;
        transition: border-color var(--motion-fast) var(--ease-enter);

        &:hover {
          border-color: var(--p-primary-400);
        }

        &:focus-visible {
          outline: 2px solid var(--p-primary-500);
          outline-offset: 2px;
        }
      }
    }

    .label {
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--p-surface-600);
    }

    .value {
      font-size: var(--text-2xl);
      font-weight: 600;
      text-align: left;
      color: var(--p-surface-900);

      &.danger {
        color: var(--p-red-700);
      }

      &.success {
        color: var(--p-green-700);
      }
    }

    .detail {
      font-size: var(--text-xs);
      color: var(--p-surface-500);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryCardComponent {
  private router = inject(Router);

  label = input.required<string>();
  value = input.required<string>();
  detail = input<string>();
  tone = input<'default' | 'success' | 'danger'>('default');
  loading = input(false);
  link = input<string | unknown[]>();

  navigate(): void {
    const target = this.link();
    if (!target) {
      return;
    }
    if (typeof target === 'string') {
      this.router.navigateByUrl(target);
    } else {
      this.router.navigate(target);
    }
  }
}
