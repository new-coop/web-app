/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export type M3IconStyle = 'outlined' | 'filled' | 'rounded' | 'sharp' | 'duotone';

/**
 * Material Design 3 Icon Component
 *
 * Wrapper for Material Symbols icons following Material Design 3 specifications.
 * Uses Google's Material Symbols font for consistent iconography.
 *
 * Features:
 * - Multiple icon variants: duotone (default), outlined, filled, rounded, and sharp
 * - Automatic theme support
 * - Size control
 * - Color customization via CSS
 *
 * @example
 * // Basic usage
 * <mifosx-m3-icon name="account_circle"></mifosx-m3-icon>
 *
 * @example
 * // With filled variant
 * <mifosx-m3-icon name="lock" variant="filled"></mifosx-m3-icon>
 *
 * @example
 * // With custom size
 * <mifosx-m3-icon name="visibility" [size]="24"></mifosx-m3-icon>
 *
 * @example
 * // Duotone: a soft filled layer underneath a crisp outlined layer.
 * // Tones default to the theme primary color and can be overridden via the
 * // --m3-icon-duotone-color and --m3-icon-duotone-fill-color CSS variables.
 * <mifosx-m3-icon name="home" variant="duotone"></mifosx-m3-icon>
 *
 * Common icon mappings from Font Awesome:
 * - user-circle â†’ account_circle
 * - lock â†’ lock
 * - eye â†’ visibility
 * - eye-slash â†’ visibility_off
 * - home â†’ home
 * - search â†’ search
 * - settings â†’ settings
 * - menu â†’ menu
 * - close â†’ close
 */
@Component({
  selector: 'mifosx-m3-icon',
  templateUrl: './m3-icon.component.html',
  styleUrls: ['./m3-icon.component.scss'],
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class M3IconComponent {
  /**
   * Icon name from Material Symbols
   * See: https://fonts.google.com/icons
   */
  @Input() name!: string;

  /**
   * Icon style variant
   * - duotone: Two-tone icon — soft filled layer + outlined layer on top (default)
   * - outlined: Stroke-only icons
   * - filled: Solid filled icons
   * - rounded: Rounded corner icons
   * - sharp: Sharp corner icons
   *
   * Named `variant` (not `style`) because Angular reserves the static
   * `style` attribute for inline CSS and never forwards it to inputs.
   */
  @Input() variant: M3IconStyle = 'duotone';

  /**
   * Icon size in pixels
   * Default is 24px (Material Design standard)
   */
  @Input() size: number = 24;

  /**
   * Whether the icon should be filled (alternative to variant="filled")
   * This is a convenience property for backwards compatibility
   */
  @Input() filled: boolean = false;

  /**
   * Whether the icon renders as two stacked tone layers
   */
  get isDuotone(): boolean {
    return !this.filled && this.variant === 'duotone';
  }

  /**
   * Get the CSS class for the icon style
   */
  get iconClass(): string {
    const styleToUse = this.filled ? 'filled' : this.variant;
    return `material-symbols-${styleToUse}`;
  }

  /**
   * Get the inline styles for the icon
   */
  get iconStyles(): { [key: string]: string } {
    return {
      'font-size': `${this.size}px`,
      width: `${this.size}px`,
      height: `${this.size}px`
    };
  }
}
