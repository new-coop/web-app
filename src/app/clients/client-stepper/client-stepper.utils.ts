/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

export function buildClientGeneralDetails(
  rawDetails: Record<string, any>,
  dateUtils: Dates,
  settingsService: SettingsService
): Record<string, any> {
  const generalDetails = { ...rawDetails };
  const dateFormat = settingsService.dateFormat;
  const locale = settingsService.language.code;

  for (const key in generalDetails) {
    if (generalDetails[key] === '' || key === 'addSavings') {
      delete generalDetails[key];
    }
  }

  if (generalDetails.submittedOnDate instanceof Date) {
    generalDetails.submittedOnDate = dateUtils.formatDate(generalDetails.submittedOnDate, dateFormat);
  }
  if (generalDetails.activationDate instanceof Date) {
    generalDetails.activationDate = dateUtils.formatDate(generalDetails.activationDate, dateFormat);
  }
  if (generalDetails.dateOfBirth instanceof Date) {
    generalDetails.dateOfBirth = dateUtils.formatDate(generalDetails.dateOfBirth, dateFormat);
  }

  if (generalDetails.clientNonPersonDetails?.incorpValidityTillDate) {
    generalDetails.clientNonPersonDetails = {
      ...generalDetails.clientNonPersonDetails,
      incorpValidityTillDate: dateUtils.formatDate(
        generalDetails.clientNonPersonDetails.incorpValidityTillDate,
        dateFormat
      ),
      dateFormat,
      locale
    };
  }

  return generalDetails;
}
