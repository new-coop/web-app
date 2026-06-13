/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Palette of accessible background colors; one is picked per name so a given user always gets the same color. */
const AVATAR_COLORS = [
  '#18181b',
  '#7c3aed',
  '#0f766e',
  '#b45309',
  '#be185d',
  '#4d7c0f',
  '#0369a1',
  '#9f1239'
];

/**
 * Circular avatar showing the initials of a name (e.g. "John Doe" -> "JD").
 * Used wherever a profile picture is needed but no photo is available.
 */
@Component({
  selector: 'mifosx-initials-avatar',
  standalone: true,
  template: `
    <span
      class="initials-avatar"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.font-size.px]="size() * 0.4"
      [style.background-color]="color()"
      [attr.aria-label]="name()"
      role="img"
    >
      {{ initials() }}
    </span>
  `,
  styles: [
    `
      .initials-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: #fff;
        font-weight: 600;
        line-height: 1;
        text-transform: uppercase;
        user-select: none;
        flex-shrink: 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InitialsAvatarComponent {
  /** Full name or username from which initials are derived. */
  name = input<string>('');

  /** Diameter in pixels. */
  size = input<number>(32);

  initials = computed(() => {
    const parts = (this.name() || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2);
    }
    return parts[0][0] + parts[parts.length - 1][0];
  });

  color = computed(() => {
    const value = this.name() || '';
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  });
}
