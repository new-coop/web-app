/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Chart palette — solid KPI accent colors (purple credit, green savings).
 */

export interface MifosChartPalette {
  pending: string;
  complete: string;
  clients: string;
  loans: string;
  pendingAccent: string;
  completeAccent: string;
  navy: string;
  legend: string;
  axis: string;
  grid: string;
}

const LIGHT: MifosChartPalette = {
  pending: '#8b5cf6',
  complete: '#22c55e',
  clients: '#8b5cf6',
  loans: '#22c55e',
  pendingAccent: '#7c3aed',
  completeAccent: '#16a34a',
  navy: '#18181b',
  legend: '#52525b',
  axis: '#71717a',
  grid: 'rgb(9 9 11 / 6%)'
};

const DARK: MifosChartPalette = {
  pending: '#a78bfa',
  complete: '#4ade80',
  clients: '#a78bfa',
  loans: '#4ade80',
  pendingAccent: '#c4b5fd',
  completeAccent: '#86efac',
  navy: '#d4d4d8',
  legend: '#d4d4d8',
  axis: '#a1a1aa',
  grid: 'rgb(255 255 255 / 8%)'
};

export function getMifosChartPalette(isDark: boolean): MifosChartPalette {
  return isDark ? DARK : LIGHT;
}

export interface DoughnutSegmentStyle {
  backgroundColor: [
    string,
    string
  ];
  borderColor: [
    string,
    string
  ];
  borderWidth: number;
  spacing: number;
}

/** Solid segment fills — no washed-out rings */
export function getDoughnutSegmentStyle(isDark: boolean): DoughnutSegmentStyle {
  const palette = getMifosChartPalette(isDark);
  const colors: [
    string,
    string
  ] = [
    palette.pending,
    palette.complete
  ];
  return {
    backgroundColor: colors,
    borderColor: colors,
    borderWidth: 0,
    spacing: 3
  };
}

export function getChartAccentColors(isDark: boolean): {
  pending: string;
  complete: string;
  clients: string;
  loans: string;
} {
  const palette = getMifosChartPalette(isDark);
  return {
    pending: palette.pending,
    complete: palette.complete,
    clients: palette.clients,
    loans: palette.loans
  };
}

export function getSeriesStyle(
  isDark: boolean,
  series: 'clients' | 'loans'
): {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  fill: boolean;
  tension: number;
} {
  const palette = getMifosChartPalette(isDark);
  const color = series === 'loans' ? palette.loans : palette.clients;
  const fillAlpha = isDark ? 0.18 : 0.12;
  return {
    backgroundColor: withAlpha(color, fillAlpha),
    borderColor: color,
    borderWidth: 2,
    fill: true,
    tension: 0.3
  };
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return hex;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}
