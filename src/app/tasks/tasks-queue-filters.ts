/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Mirrors `AccountsFilterPipe` for client-approval (`type === 'clientApproval'`). */
export function countClientsPendingActivation(clients: unknown[]): number {
  return clients.filter(
    (client) =>
      (client as { active?: boolean; status?: { value?: string } }).active === false &&
      (client as { status?: { value?: string } }).status?.value === 'Pending'
  ).length;
}

/** Mirrors loan-approval tab (`status.pendingApproval`). */
export function countLoansPendingApproval(loans: unknown[]): number {
  return loans.filter((loan) => (loan as { status?: { pendingApproval?: boolean } }).status?.pendingApproval).length;
}

/** Mirrors loan-disbursal / council tabs (`status.waitingForDisbursal === true`). */
export function countLoansWaitingForDisbursal(loans: unknown[]): number {
  return loans.filter(
    (loan) => (loan as { status?: { waitingForDisbursal?: boolean } }).status?.waitingForDisbursal === true
  ).length;
}
