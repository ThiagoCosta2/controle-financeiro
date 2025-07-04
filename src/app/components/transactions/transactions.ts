import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css'],
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  isPopupOpen = false;
  isConfirmDeleteOpen = false;
  transactionForm!: FormGroup;
  currentTransaction: Transaction | null = null;

  constructor(
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.initForm();
  }

  loadTransactions(): void {
    this.transactions = this.transactionService.getTransactions();
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      id: [null],
      type: ['expense', Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      isFixed: [false],
    });

    this.transactionForm.get('type')?.valueChanges.subscribe((type) => {
      const isFixedControl = this.transactionForm.get('isFixed');
      if (type === 'income') {
        isFixedControl?.enable();
      } else {
        isFixedControl?.setValue(false);
        isFixedControl?.disable();
      }
    });
  }

  openAddPopup(): void {
    this.currentTransaction = null;
    this.transactionForm.reset({
      type: 'expense',
      isFixed: false,
    });
    this.transactionForm.get('isFixed')?.disable();
    this.isPopupOpen = true;
  }

  openEditPopup(transaction: Transaction): void {
    this.currentTransaction = transaction;
    this.transactionForm.setValue({
      id: transaction.id,
      type: transaction.type,
      value: transaction.value,
      description: transaction.description,
      isFixed: transaction.isFixed ?? false,
    });
    if (transaction.type === 'income') {
      this.transactionForm.get('isFixed')?.enable();
    } else {
      this.transactionForm.get('isFixed')?.disable();
    }
    this.isPopupOpen = true;
  }

  openConfirmDelete(transaction: Transaction): void {
    this.currentTransaction = transaction;
    this.isConfirmDeleteOpen = true;
  }

  closePopups(): void {
    this.isPopupOpen = false;
    this.isConfirmDeleteOpen = false;
    this.currentTransaction = null;
  }

  saveTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const formData = this.transactionForm.value;

    if (this.currentTransaction && this.currentTransaction.id) {
      const updatedData: Transaction = {
        ...this.currentTransaction,
        ...formData,
      };
      this.transactionService.updateTransaction(updatedData);
    } else {
      const { id, ...newTransactionData } = formData;
      this.transactionService.addTransaction(newTransactionData);
    }

    this.loadTransactions();
    this.closePopups();
  }

  deleteTransaction(): void {
    if (this.currentTransaction && this.currentTransaction.id) {
      this.transactionService.deleteTransaction(this.currentTransaction.id);
      this.loadTransactions();
      this.closePopups();
    }
  }
}
