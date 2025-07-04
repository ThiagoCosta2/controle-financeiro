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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-transactions',
  standalone: true,
  // Imports foram limpos, sem Angular Material
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
  installmentsOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  constructor(
    private transactionService: TransactionService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.initForm();

    this.route.queryParams.subscribe((params) => {
      if (params['openPopup'] === 'true') {
        this.openAddPopup();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });
  }

  loadTransactions(): void {
    this.transactions = this.transactionService.getTransactions();
  }

  // Função para formatar a data para o input voltou a ser necessária
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      id: [null],
      type: ['expense', Validators.required],
      date: [this.formatDateForInput(new Date()), Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      isFixed: [false],
      isRecurring: [false],
      installments: [{ value: 2, disabled: true }, Validators.required],
    });

    this.transactionForm.get('type')?.valueChanges.subscribe((type) => {
      const isFixedControl = this.transactionForm.get('isFixed');
      const isRecurringControl = this.transactionForm.get('isRecurring');
      if (type === 'income') {
        isFixedControl?.enable();
        isRecurringControl?.setValue(false);
        isRecurringControl?.disable();
      } else {
        isFixedControl?.setValue(false);
        isFixedControl?.disable();
        isRecurringControl?.enable();
      }
    });

    this.transactionForm
      .get('isRecurring')
      ?.valueChanges.subscribe((isRecurring) => {
        const installmentsControl = this.transactionForm.get('installments');
        if (isRecurring) {
          installmentsControl?.enable();
        } else {
          installmentsControl?.disable();
        }
      });
  }

  openAddPopup(): void {
    this.currentTransaction = null;
    this.transactionForm.reset({
      type: 'expense',
      date: this.formatDateForInput(new Date()),
      value: null,
      description: '',
      isFixed: false,
      isRecurring: false,
      installments: 2,
    });
    this.transactionForm.get('isFixed')?.disable();
    this.transactionForm.get('installments')?.disable();
    this.isPopupOpen = true;
  }

  openEditPopup(transaction: Transaction): void {
    this.currentTransaction = transaction;
    this.transactionForm.setValue({
      id: transaction.id,
      type: transaction.type,
      date: this.formatDateForInput(new Date(transaction.date)),
      value: transaction.value,
      description: transaction.description,
      isFixed: transaction.isFixed ?? false,
      isRecurring: false,
      installments: 2,
    });
    this.transactionForm.get('isRecurring')?.disable();
    this.transactionForm.get('isFixed')?.disable();
    if (transaction.type === 'income') {
      this.transactionForm.get('isFixed')?.enable();
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

    const formData = this.transactionForm.getRawValue();

    if (this.currentTransaction && this.currentTransaction.id) {
      const updatedData: Transaction = {
        ...this.currentTransaction,
        ...formData,
        date: new Date(formData.date + 'T00:00:00'),
      };
      this.transactionService.updateTransaction(updatedData);
    } else {
      const { isFixed, isRecurring, installments, ...newTxData } = formData;
      const baseDate = new Date(newTxData.date + 'T12:00:00Z');

      if (newTxData.type === 'income' && isFixed) {
        for (let i = 0; i < 12; i++) {
          const installmentDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth() + i,
            baseDate.getDate()
          );
          const tx: Omit<Transaction, 'id'> = {
            ...newTxData,
            date: installmentDate,
            isFixed: true,
          };
          this.transactionService.addTransaction(tx);
        }
      } else if (
        newTxData.type === 'expense' &&
        isRecurring &&
        installments > 1
      ) {
        for (let i = 0; i < installments; i++) {
          const installmentDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth() + i,
            baseDate.getDate()
          );
          const tx: Omit<Transaction, 'id'> = {
            ...newTxData,
            description: `${newTxData.description} (${i + 1}/${installments})`,
            date: installmentDate,
            isFixed: false,
          };
          this.transactionService.addTransaction(tx);
        }
      } else {
        const tx: Omit<Transaction, 'id'> = {
          ...newTxData,
          date: baseDate,
          isFixed: newTxData.type === 'income' && isFixed,
        };
        this.transactionService.addTransaction(tx);
      }
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
