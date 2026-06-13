/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../shared/input-amount/input-amount.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FaIconComponent } from 'app/shared/icons/fa-icon.component';

type TransactionView = 'details' | 'confirm' | 'complete';

/**
 * Create savings account transactions component.
 */
@Component({
  selector: 'mifosx-savings-transactions',
  templateUrl: './savings-account-transactions.component.html',
  styleUrls: ['./savings-account-transactions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    CdkTextareaAutosize,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavingsAccountTransactionsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);
  private savingsService = inject(SavingsService);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Savings account transaction form. */
  savingAccountTransactionForm: FormGroup;
  /** savings account transaction payment options. */
  paymentTypeOptions: {
    id: number;
    name: string;
    description: string;
    isCashPayment: boolean;
    position: number;
  }[];
  /** transaction type flag to render required UI */
  transactionType: { deposit: boolean; withdrawal: boolean } = { deposit: false, withdrawal: false };
  /** transaction command for submit request */
  transactionCommand: string;
  /** saving account's Id */
  savingAccountId: string;
  currency: Currency | null = null;
  /** Transaction response after submission */
  transactionResponse: any = null;
  /** Flag to track if transaction is being submitted */
  isSubmitting: boolean = false;
  /** Current flat view (no stepper) */
  currentView: TransactionView = 'details';

  /** i18n key for the form-workspace page title */
  get pageTitle(): string {
    return this.transactionType.withdrawal
      ? 'labels.heading.Withdraw Money From Saving Account'
      : 'labels.heading.Deposit Money To Saving Account';
  }

  /**
   * Retrieves the Saving Account transaction template data from `resolve`.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { savingsAccountActionData: any }) => {
      this.paymentTypeOptions = data.savingsAccountActionData.paymentTypeOptions;
      if (data.savingsAccountActionData.currency) {
        this.currency = data.savingsAccountActionData.currency;
      }
      this.cdr.markForCheck();
    });
    this.transactionCommand = this.route.snapshot.params['name'].toLowerCase();
    this.transactionType[this.transactionCommand as 'deposit' | 'withdrawal'] = true;
    this.savingAccountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the Saving account transaction form when component loads.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createSavingAccountTransactionForm();
  }

  /**
   * Method to create the Saving Account Transaction Form.
   */
  createSavingAccountTransactionForm() {
    this.savingAccountTransactionForm = this.formBuilder.group({
      transactionDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transactionAmount: [
        0,
        Validators.required
      ],
      paymentTypeId: [
        '',
        Validators.required
      ],
      accountNumber: [''],
      checkNumber: [''],
      routingCode: [''],
      receiptNumber: [''],
      bankNumber: [''],
      note: ['']
    });
  }

  /**
   * Method to proceed to confirmation view.
   */
  proceedToConfirmation() {
    if (this.savingAccountTransactionForm.valid) {
      this.currentView = 'confirm';
      this.cdr.markForCheck();
    }
  }

  /**
   * Method to go back to the details form.
   */
  goBack() {
    this.currentView = 'details';
    this.cdr.markForCheck();
  }

  /**
   * Method to submit the transaction details after confirmation.
   */
  confirmTransaction() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const savingAccountTransactionFormData = this.savingAccountTransactionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.savingAccountTransactionForm.value.transactionDate;
    if (savingAccountTransactionFormData.transactionDate instanceof Date) {
      savingAccountTransactionFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...savingAccountTransactionFormData,
      dateFormat,
      locale
    };
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.savingsService
      .executeSavingsAccountTransactionsCommand(this.savingAccountId, this.transactionCommand, data)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((res) => {
        this.transactionResponse = res;
        this.currentView = 'complete';
        this.cdr.markForCheck();
      });
  }

  /**
   * Method to navigate back to transactions list.
   */
  done() {
    this.router.navigate(['../../transactions'], { relativeTo: this.route });
  }

  /**
   * Method to get selected payment type name.
   */
  getPaymentTypeName(): string {
    const paymentTypeId = this.savingAccountTransactionForm.value.paymentTypeId;
    const paymentType = this.paymentTypeOptions.find((pt) => pt.id === paymentTypeId);
    return paymentType ? paymentType.name : '';
  }

  /**
   * Method to print transaction receipt.
   */
  printReceipt() {
    window.print();
  }
}
