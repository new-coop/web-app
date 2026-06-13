/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Home Service
 */
@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private http = inject(HttpClient);

  /**
   * Total number of clients across the institution.
   * @returns {Observable<number>}
   */
  getClientsCount(): Observable<number> {
    const httpParams = new HttpParams().set('limit', '1').set('offset', '0');
    return this.http
      .get('/clients', { params: httpParams })
      .pipe(map((response: any) => response.totalFilteredRecords));
  }

  /**
   * Total number of loan accounts across the institution.
   * @returns {Observable<number>}
   */
  getLoanAccountsCount(): Observable<number> {
    const httpParams = new HttpParams().set('limit', '1').set('offset', '0');
    return this.http.get('/loans', { params: httpParams }).pipe(map((response: any) => response.totalFilteredRecords));
  }

  /**
   * Total number of savings accounts across the institution.
   * @returns {Observable<number>}
   */
  getSavingsAccountsCount(): Observable<number> {
    const httpParams = new HttpParams().set('limit', '1').set('offset', '0');
    return this.http
      .get('/savingsaccounts', { params: httpParams })
      .pipe(map((response: any) => response.totalFilteredRecords));
  }

  /**
   * Total number of offices.
   * @returns {Observable<number>}
   */
  getOfficesCount(): Observable<number> {
    return this.http.get('/offices').pipe(map((response: any) => (Array.isArray(response) ? response.length : 0)));
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getCollectedAmount(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/Demand Vs Collection', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getDisbursedAmount(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/Disbursal Vs Awaitingdisbursal', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByDay(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByDay', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByWeek(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByWeek', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByMonth(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByMonth', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByDay(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByDay', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByWeek(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByWeek', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByMonth(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByMonth', { params: httpParams });
  }
}
