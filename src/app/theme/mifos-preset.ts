/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Mifos X design system preset — "noir" variant.
 *
 * Monochrome palette inspired by the PrimeNG showcase: zinc surfaces,
 * near-black primary actions on a light gray canvas, white cards with
 * thin borders. All text/background pairs meet WCAG 2.1 AA (>= 4.5:1).
 */
export const MifosPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}'
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.900}',
      offset: '2px'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{zinc.950}',
          contrastColor: '#FFFFFF',
          hoverColor: '{zinc.800}',
          activeColor: '{zinc.700}'
        },
        highlight: {
          background: '{zinc.950}',
          focusBackground: '{zinc.700}',
          color: '#FFFFFF',
          focusColor: '#FFFFFF'
        },
        surface: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B'
        }
      },
      dark: {
        primary: {
          color: '{zinc.200}',
          contrastColor: '{zinc.950}',
          hoverColor: '{zinc.300}',
          activeColor: '{zinc.400}'
        },
        highlight: {
          background: 'rgb(255 255 255 / 12%)',
          focusBackground: 'rgb(255 255 255 / 18%)',
          color: '{zinc.50}',
          focusColor: '{zinc.50}'
        },
        surface: {
          0: '#FAFAFA',
          50: '#E4E4E7',
          100: '#D4D4D8',
          200: '#A1A1AA',
          300: '#71717A',
          400: '#52525B',
          500: '#3F3F46',
          600: '#35383F',
          700: '#2C2F36',
          800: '#222228',
          900: '#1C1C21',
          950: '#0E0E11'
        }
      }
    }
  },
  components: {
    datatable: {
      headerCell: {
        padding: '0.875rem 1.25rem',
        background: 'transparent'
      },
      bodyCell: {
        padding: '0.875rem 1.25rem'
      },
      colorScheme: {
        light: {
          headerCell: {
            background: 'transparent'
          }
        },
        dark: {
          headerCell: {
            background: 'transparent'
          }
        }
      }
    },
    paginator: {
      root: {
        padding: '0.75rem 1.5rem'
      }
    }
  }
});
