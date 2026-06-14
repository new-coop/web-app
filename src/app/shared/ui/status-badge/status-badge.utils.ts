/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type StatusBadgeSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

export interface StatusBadgeConfig {
  severity: StatusBadgeSeverity;
  label: string;
}

/**
 * Single mapping of Fineract domain status codes to visual semantics.
 * Color is never the only indicator: every badge carries a text label.
 */
const STATUS_MAP: Record<string, StatusBadgeConfig> = {
  // Loans
  'loanStatusType.submitted.and.pending.approval': { severity: 'warn', label: 'Pendiente de aprobación' },
  'loanStatusType.approved': { severity: 'info', label: 'Aprobado' },
  'loanStatusType.active': { severity: 'success', label: 'Activo' },
  'loanStatusType.overpaid': { severity: 'info', label: 'Sobrepagado' },
  'loanStatusType.closed.obligations.met': { severity: 'secondary', label: 'Cerrado' },
  'loanStatusType.closed.written.off': { severity: 'danger', label: 'Castigado' },
  'loanStatusType.closed.reschedule.outstanding.amount': { severity: 'secondary', label: 'Reestructurado' },
  'loanStatusType.rejected': { severity: 'danger', label: 'Rechazado' },
  'loanStatusType.withdrawn.by.client': { severity: 'secondary', label: 'Retirado' },
  // Clients
  'clientStatusType.pending': { severity: 'warn', label: 'Pendiente' },
  'clientStatusType.active': { severity: 'success', label: 'Activo' },
  'clientStatusType.closed': { severity: 'secondary', label: 'Cerrado' },
  'clientStatusType.rejected': { severity: 'danger', label: 'Rechazado' },
  'clientStatusType.withdraw': { severity: 'secondary', label: 'Retirado' },
  'clientStatusType.transfer.in.progress': { severity: 'info', label: 'Transferencia en curso' },
  // Savings
  'savingsAccountStatusType.submitted.and.pending.approval': { severity: 'warn', label: 'Pendiente de aprobación' },
  'savingsAccountStatusType.approved': { severity: 'info', label: 'Aprobado' },
  'savingsAccountStatusType.active': { severity: 'success', label: 'Activa' },
  'savingsAccountStatusType.closed': { severity: 'secondary', label: 'Cerrada' },
  'savingsAccountStatusType.rejected': { severity: 'danger', label: 'Rechazada' },
  // Groups & centers
  'groupingStatusType.pending': { severity: 'warn', label: 'Pendiente' },
  'groupingStatusType.submitted.and.pending.approval': { severity: 'warn', label: 'Pendiente de aprobación' },
  'groupingStatusType.approved': { severity: 'info', label: 'Aprobado' },
  'groupingStatusType.active': { severity: 'success', label: 'Activo' },
  'groupingStatusType.closed': { severity: 'secondary', label: 'Cerrado' },
  'groupingStatusType.rejected': { severity: 'danger', label: 'Rechazado' },
  // Generic booleans
  'isSelfService.true': { severity: 'success', label: 'Sí' },
  'isSelfService.false': { severity: 'secondary', label: 'No' },
  'employee.active': { severity: 'success', label: 'Activo' },
  'employee.inactive': { severity: 'secondary', label: 'Inactivo' },
  'role.enabled': { severity: 'success', label: 'Activo' },
  'role.disabled': { severity: 'secondary', label: 'Deshabilitado' },
  'audit.failed': { severity: 'danger', label: 'Error' }
};

const STATUS_KPI_ICON: Record<StatusBadgeSeverity, string> = {
  info: 'verified',
  success: 'check_circle',
  warn: 'pending',
  danger: 'warning',
  secondary: 'info'
};

export function resolveStatusBadgeConfig(code: string, overdue = false, label?: string): StatusBadgeConfig {
  if (overdue) {
    return { severity: 'danger', label: 'En mora' };
  }
  const mapped = STATUS_MAP[code];
  if (mapped) {
    return mapped;
  }
  return { severity: 'secondary', label: label || code };
}

export function statusKpiIconName(severity: StatusBadgeSeverity): string {
  return STATUS_KPI_ICON[severity];
}
