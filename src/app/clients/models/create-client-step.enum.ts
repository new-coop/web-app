/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Numbered sections in the create-client form (in display order). */
export enum CreateClientStep {
  Details = 'details',
  General = 'general',
  Contact = 'contact',
  Settings = 'settings',
  FamilyMembers = 'familyMembers',
  Address = 'address'
}

/** i18n keys for each section title. */
export const CREATE_CLIENT_SECTION_LABELS: Record<CreateClientStep, string> = {
  [CreateClientStep.Details]: 'labels.inputs.DETAILS',
  [CreateClientStep.General]: 'labels.inputs.GENERAL',
  [CreateClientStep.Contact]: 'labels.inputs.Contact Information',
  [CreateClientStep.Settings]: 'labels.inputs.SETTINGS',
  [CreateClientStep.FamilyMembers]: 'labels.inputs.FAMILY MEMBERS',
  [CreateClientStep.Address]: 'labels.inputs.ADDRESS'
};

/** Primary client sections before optional address. */
export const CREATE_CLIENT_CORE_SECTIONS: CreateClientStep[] = [
  CreateClientStep.Details,
  CreateClientStep.General,
  CreateClientStep.Contact,
  CreateClientStep.Settings,
  CreateClientStep.FamilyMembers
];
