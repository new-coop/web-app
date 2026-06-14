/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { resolveFieldIcon } from './field-icon';

describe('resolveFieldIcon', () => {
  it('maps identity and credential fields', () => {
    expect(resolveFieldIcon({ controlName: 'username' })).toBe('account_circle');
    expect(resolveFieldIcon({ controlName: 'email', type: 'text' })).toBe('mail');
    expect(resolveFieldIcon({ controlName: 'password', type: 'password' })).toBe('lock');
    expect(resolveFieldIcon({ controlName: 'repeatPassword' })).toBe('check_circle');
    expect(resolveFieldIcon({ controlName: 'firstName' })).toBe('person');
    expect(resolveFieldIcon({ controlName: 'officeId', isSelect: true })).toBe('domain');
  });

  it('maps financial and charge fields', () => {
    expect(resolveFieldIcon({ controlName: 'amount' })).toBe('payments');
    expect(resolveFieldIcon({ controlName: 'minCap' })).toBe('trending_down');
    expect(resolveFieldIcon({ controlName: 'chargeAppliesTo', isSelect: true })).toBe('category');
    expect(resolveFieldIcon({ controlName: 'taxGroupId', isSelect: true })).toBe('percent');
  });

  it('maps dates and long text semantically', () => {
    expect(resolveFieldIcon({ controlName: 'transactionDate', hasDatepicker: true })).toBe('calendar_today');
    expect(resolveFieldIcon({ controlName: 'rejectedDate' })).toBe('calendar_today');
    expect(resolveFieldIcon({ controlName: 'description', type: 'textarea' })).toBe('notes');
    expect(resolveFieldIcon({ controlName: 'note', type: 'textarea' })).toBe('sticky_note_2');
  });

  it('avoids misleading generic matches', () => {
    expect(resolveFieldIcon({ controlName: 'datatableName' })).toBe('table_chart');
    expect(resolveFieldIcon({ controlName: 'smsProviderAccountId' })).toBe('badge');
    expect(resolveFieldIcon({ controlName: 'reportSql', type: 'textarea' })).toBe('code');
    expect(resolveFieldIcon({ controlName: 'unknownFieldXYZ' })).toBeNull();
    expect(resolveFieldIcon({ controlName: 'misc', isSelect: true })).toBeNull();
  });

  it('uses label hints when control name is absent', () => {
    expect(resolveFieldIcon({ label: 'Payment Type', isSelect: true })).toBe('payments');
    expect(resolveFieldIcon({ label: 'GL Account' })).toBe('menu_book');
  });
});
