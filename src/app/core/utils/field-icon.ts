/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface FieldIconContext {
  type?: string | null;
  controlName?: string | null;
  label?: string | null;
  isSelect?: boolean;
  hasDatepicker?: boolean;
}

/** Exact normalized controlName → icon (camelCase names become lowercase alnum). */
const EXACT_CONTROL_ICONS: Record<string, string> = {
  username: 'account_circle',
  email: 'mail',
  firstname: 'person',
  lastname: 'badge',
  password: 'lock',
  repeatpassword: 'check_circle',
  currentpassword: 'lock',
  otp: 'shield_person',
  url: 'link',
  mobile: 'phone',
  mobileno: 'phone',
  phonenumber: 'phone',
  officeid: 'domain',
  staffid: 'support_agent',
  roles: 'admin_panel_settings',
  tenant: 'domain',
  language: 'translate',
  preferredlanguage: 'translate',
  currencycode: 'currency_exchange',
  countrycode: 'flag',
  gender: 'wc',
  amount: 'payments',
  principal: 'payments',
  transactionamount: 'payments',
  mincap: 'trending_down',
  maxcap: 'trending_up',
  description: 'notes',
  reportname: 'assessment',
  reporttype: 'assessment',
  reportsubtype: 'folder_open',
  reportcategory: 'category',
  reportsql: 'code',
  externalid: 'fingerprint',
  legalform: 'gavel',
  chargeappliesto: 'category',
  chargetimetype: 'schedule',
  chargecalculationtype: 'calculate',
  chargepaymentmode: 'payments',
  taxgroupid: 'percent',
  feeinterval: 'repeat',
  feefrequency: 'event_repeat',
  paymenttypeid: 'payments',
  productid: 'inventory_2',
  fundid: 'savings',
  clientid: 'person',
  groupid: 'groups',
  loanid: 'request_quote',
  accounttype: 'account_balance',
  prefixtype: 'tag',
  entitysubtype: 'category',
  datatablename: 'table_chart',
  apptablename: 'table_chart',
  displayname: 'badge',
  cronexpression: 'schedule',
  payloadurl: 'link',
  contenttype: 'article',
  smsprovider: 'cloud',
  smsprovideraccountid: 'badge',
  smsprovidertoken: 'key',
  host: 'dns',
  port: 'settings_ethernet',
  fromemail: 'mail',
  fromname: 'person',
  openingbalance: 'account_balance_wallet',
  accountnumber: 'numbers',
  accountno: 'numbers',
  routingcode: 'route',
  receiptnumber: 'receipt_long',
  checknumber: 'pin',
  banknumber: 'account_balance',
  requestedshares: 'pie_chart',
  unitprice: 'payments',
  submittedon: 'calendar_today',
  activationdate: 'calendar_today',
  fromdate: 'date_range',
  todate: 'date_range',
  duedate: 'event_upcoming',
  rejecteddate: 'calendar_today',
  approveddate: 'calendar_today',
  closeddate: 'calendar_today',
  requesteddate: 'calendar_today',
  activateddate: 'calendar_today',
  withdrawnondate: 'calendar_today',
  unassigneddate: 'calendar_today',
  transactiondate: 'calendar_today',
  datevalue: 'calendar_today',
  city: 'location_city',
  country: 'public',
  postalcode: 'markunread_mailbox',
  zip: 'markunread_mailbox',
  code: 'tag',
  value: 'tune',
  stringvalue: 'text_fields',
  note: 'sticky_note_2',
  notes: 'sticky_note_2',
  address: 'location_on',
  iban: 'account_balance',
  apikey: 'key',
  secret: 'key',
  token: 'key',
  beneficiary: 'person',
  remittance: 'send_money',
  glaccount: 'menu_book',
  penalty: 'gavel',
  collateral: 'security',
  interest: 'percent',
  term: 'timelapse',
  search: 'search',
  query: 'search',
  webhook: 'webhook',
  sql: 'code',
  filename: 'draft',
  title: 'title',
  subject: 'subject',
  locale: 'language',
  timezone: 'schedule',
  provider: 'cloud',
  path: 'route',
  route: 'route',
  version: 'info',
  quantity: 'pin',
  percentage: 'percent',
  rate: 'trending_up',
  tax: 'percent',
  balance: 'account_balance',
  limit: 'speed',
  invoice: 'receipt',
  voucher: 'receipt_long',
  teller: 'point_of_sale',
  cashier: 'person',
  cheque: 'payments',
  card: 'credit_card',
  wallet: 'account_balance_wallet',
  transfer: 'swap_horiz',
  deposit: 'savings',
  withdrawal: 'account_balance_wallet',
  repayment: 'payments',
  disbursement: 'account_balance_wallet'
};

/**
 * Longer fragments first — avoids `name` matching inside unrelated keys when
 * an exact entry is missing.
 */
const CONTROL_CONTAINS_RULES: ReadonlyArray<[
    string,
    string
  ]> = [
  [
    'repeatpassword',
    'check_circle'
  ],
  [
    'currentpassword',
    'lock'
  ],
  [
    'preferredlanguage',
    'translate'
  ],
  [
    'transactionamount',
    'payments'
  ],
  [
    'openingbalance',
    'account_balance_wallet'
  ],
  [
    'accountnumber',
    'numbers'
  ],
  [
    'routingcode',
    'route'
  ],
  [
    'receiptnumber',
    'receipt_long'
  ],
  [
    'checknumber',
    'pin'
  ],
  [
    'banknumber',
    'account_balance'
  ],
  [
    'requestedshares',
    'pie_chart'
  ],
  [
    'unitprice',
    'payments'
  ],
  [
    'smsprovideraccountid',
    'badge'
  ],
  [
    'smsprovidertoken',
    'key'
  ],
  [
    'smsprovider',
    'cloud'
  ],
  [
    'reportcategory',
    'category'
  ],
  [
    'reportsubtype',
    'folder_open'
  ],
  [
    'reportname',
    'assessment'
  ],
  [
    'reporttype',
    'assessment'
  ],
  [
    'reportsql',
    'code'
  ],
  [
    'cronexpression',
    'schedule'
  ],
  [
    'payloadurl',
    'link'
  ],
  [
    'contenttype',
    'article'
  ],
  [
    'datatablename',
    'table_chart'
  ],
  [
    'apptablename',
    'table_chart'
  ],
  [
    'entitysubtype',
    'category'
  ],
  [
    'chargeappliesto',
    'category'
  ],
  [
    'chargecalculationtype',
    'calculate'
  ],
  [
    'chargepaymentmode',
    'payments'
  ],
  [
    'chargetimetype',
    'schedule'
  ],
  [
    'paymenttype',
    'payments'
  ],
  [
    'taxgroup',
    'percent'
  ],
  [
    'feeinterval',
    'repeat'
  ],
  [
    'feefrequency',
    'event_repeat'
  ],
  [
    'currencycode',
    'currency_exchange'
  ],
  [
    'countrycode',
    'flag'
  ],
  [
    'officeid',
    'domain'
  ],
  [
    'staffid',
    'support_agent'
  ],
  [
    'externalid',
    'fingerprint'
  ],
  [
    'legalform',
    'gavel'
  ],
  [
    'firstname',
    'person'
  ],
  [
    'lastname',
    'badge'
  ],
  [
    'phonenumber',
    'phone'
  ],
  [
    'displayname',
    'badge'
  ],
  [
    'fromemail',
    'mail'
  ],
  [
    'fromname',
    'person'
  ],
  [
    'glaccount',
    'menu_book'
  ],
  [
    'description',
    'notes'
  ],
  [
    'password',
    'lock'
  ],
  [
    'email',
    'mail'
  ],
  [
    'amount',
    'payments'
  ],
  [
    'principal',
    'payments'
  ],
  [
    'mincap',
    'trending_down'
  ],
  [
    'maxcap',
    'trending_up'
  ],
  [
    'interest',
    'percent'
  ],
  [
    'address',
    'location_on'
  ],
  [
    'webhook',
    'webhook'
  ]
];

/** Label text (English UI copy) → icon; longest phrases first. */
const LABEL_RULES: ReadonlyArray<[
    string,
    string
  ]> = [
  [
    'confirm password',
    'check_circle'
  ],
  [
    'repeat password',
    'check_circle'
  ],
  [
    'current password',
    'lock'
  ],
  [
    'first name',
    'person'
  ],
  [
    'last name',
    'badge'
  ],
  [
    'display name',
    'badge'
  ],
  [
    'payment type',
    'payments'
  ],
  [
    'payment mode',
    'payments'
  ],
  [
    'transaction date',
    'calendar_today'
  ],
  [
    'transaction amount',
    'payments'
  ],
  [
    'account number',
    'numbers'
  ],
  [
    'account type',
    'account_balance'
  ],
  [
    'routing code',
    'route'
  ],
  [
    'receipt number',
    'receipt_long'
  ],
  [
    'check number',
    'pin'
  ],
  [
    'bank number',
    'account_balance'
  ],
  [
    'unit price',
    'payments'
  ],
  [
    'requested shares',
    'pie_chart'
  ],
  [
    'opening balance',
    'account_balance_wallet'
  ],
  [
    'charge applies',
    'category'
  ],
  [
    'time type',
    'schedule'
  ],
  [
    'calculation type',
    'calculate'
  ],
  [
    'fee frequency',
    'event_repeat'
  ],
  [
    'fee interval',
    'repeat'
  ],
  [
    'tax group',
    'percent'
  ],
  [
    'report name',
    'assessment'
  ],
  [
    'report type',
    'assessment'
  ],
  [
    'report sub type',
    'folder_open'
  ],
  [
    'report category',
    'category'
  ],
  [
    'data table',
    'table_chart'
  ],
  [
    'sub type',
    'folder_open'
  ],
  [
    'entity sub type',
    'category'
  ],
  [
    'cron expression',
    'schedule'
  ],
  [
    'payload url',
    'link'
  ],
  [
    'content type',
    'article'
  ],
  [
    'sms provider',
    'cloud'
  ],
  [
    'provider account',
    'badge'
  ],
  [
    'provider token',
    'key'
  ],
  [
    'from email',
    'mail'
  ],
  [
    'from name',
    'person'
  ],
  [
    'gl account',
    'menu_book'
  ],
  [
    'legal form',
    'gavel'
  ],
  [
    'external id',
    'fingerprint'
  ],
  [
    'postal code',
    'markunread_mailbox'
  ],
  [
    'string value',
    'text_fields'
  ],
  [
    'username',
    'account_circle'
  ],
  [
    'password',
    'lock'
  ],
  [
    'email',
    'mail'
  ],
  [
    'office',
    'domain'
  ],
  [
    'staff',
    'support_agent'
  ],
  [
    'roles',
    'admin_panel_settings'
  ],
  [
    'gender',
    'wc'
  ],
  [
    'currency',
    'currency_exchange'
  ],
  [
    'country',
    'flag'
  ],
  [
    'language',
    'translate'
  ],
  [
    'tenant',
    'domain'
  ],
  [
    'server',
    'dns'
  ],
  [
    'host',
    'dns'
  ],
  [
    'port',
    'settings_ethernet'
  ],
  [
    'amount',
    'payments'
  ],
  [
    'description',
    'notes'
  ],
  [
    'note',
    'sticky_note_2'
  ],
  [
    'comment',
    'chat'
  ],
  [
    'address',
    'location_on'
  ],
  [
    'city',
    'location_city'
  ],
  [
    'date',
    'calendar_today'
  ],
  [
    'time',
    'schedule'
  ],
  [
    'phone',
    'phone'
  ],
  [
    'mobile',
    'phone'
  ],
  [
    'search',
    'search'
  ],
  [
    'otp',
    'shield_person'
  ],
  [
    'charge',
    'monetization_on'
  ],
  [
    'report',
    'assessment'
  ],
  [
    'account',
    'account_balance'
  ],
  [
    'client',
    'person'
  ],
  [
    'loan',
    'request_quote'
  ],
  [
    'savings',
    'savings'
  ],
  [
    'share',
    'pie_chart'
  ],
  [
    'product',
    'inventory_2'
  ],
  [
    'fund',
    'savings'
  ],
  [
    'interest',
    'percent'
  ],
  [
    'rate',
    'trending_up'
  ],
  [
    'tax',
    'percent'
  ],
  [
    'sql',
    'code'
  ],
  [
    'url',
    'link'
  ],
  [
    'api key',
    'key'
  ],
  [
    'token',
    'key'
  ],
  [
    'secret',
    'key'
  ],
  [
    'name',
    'title'
  ],
  [
    'code',
    'tag'
  ],
  [
    'value',
    'tune'
  ],
  [
    'status',
    'info'
  ],
  [
    'type',
    'category'
  ]
];

const DATE_CONTROL_PATTERN = /(?:^date|date$|ondate$|fromdate|todate|duedate|submittedon)/i;

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeLabel(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().trim();
}

function iconFromInputType(type: string | null | undefined): string | null {
  switch (type) {
    case 'email':
      return 'mail';
    case 'password':
      return 'lock';
    case 'tel':
      return 'phone';
    case 'url':
      return 'link';
    case 'number':
      return 'numbers';
    case 'search':
      return 'search';
    case 'date':
    case 'datetime-local':
      return 'calendar_today';
    case 'time':
      return 'schedule';
    default:
      return null;
  }
}

function isLongTextField(controlKey: string, label: string): boolean {
  const haystack = `${controlKey} ${label}`.toLowerCase();
  return /(?:note|description|comment|remark|message|body|sql|reason|purpose|detail|narration|explanation|address)/.test(
    haystack
  );
}

function iconFromLabel(label: string | null | undefined): string | null {
  const normalized = normalizeLabel(label);
  if (!normalized) {
    return null;
  }

  for (const [
    fragment,
    icon
  ] of LABEL_RULES) {
    if (normalized.includes(fragment)) {
      return icon;
    }
  }

  return null;
}

function iconFromControlName(controlKey: string, isSelect: boolean): string | null {
  if (!controlKey) {
    return null;
  }

  if (controlKey === 'name') {
    return isSelect ? 'webhook' : 'title';
  }

  if (EXACT_CONTROL_ICONS[controlKey]) {
    return EXACT_CONTROL_ICONS[controlKey];
  }

  if (DATE_CONTROL_PATTERN.test(controlKey)) {
    return 'calendar_today';
  }

  for (const [
    fragment,
    icon
  ] of CONTROL_CONTAINS_RULES) {
    if (controlKey.includes(fragment)) {
      return icon;
    }
  }

  if (isSelect) {
    if (controlKey.endsWith('id')) {
      return 'tag';
    }
    if (controlKey.endsWith('type') || controlKey.endsWith('mode') || controlKey.endsWith('status')) {
      return 'category';
    }
    if (controlKey === 'name') {
      return 'webhook';
    }
  }

  return null;
}

/** Resolve a Material Symbols icon for a form field, or null when no confident match exists. */
export function resolveFieldIcon(ctx: FieldIconContext): string | null {
  if (ctx.hasDatepicker) {
    return 'calendar_today';
  }

  const controlKey = normalizeKey(ctx.controlName);
  const label = normalizeLabel(ctx.label);

  const byType = iconFromInputType(ctx.type);
  if (byType) {
    return byType;
  }

  const byControl = iconFromControlName(controlKey, !!ctx.isSelect);
  if (byControl) {
    return byControl;
  }

  const byLabel = iconFromLabel(ctx.label);
  if (byLabel) {
    return byLabel;
  }

  if (ctx.type === 'textarea' && isLongTextField(controlKey, label)) {
    return 'notes';
  }

  return null;
}
