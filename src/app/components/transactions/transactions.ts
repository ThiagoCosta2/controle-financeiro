import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css'],
})
export class TransactionsComponent implements OnInit {
  allTransactions: Transaction[] = [];
  isPopupOpen = false;
  isConfirmDeleteOpen = false;
  transactionToDelete: Transaction | null = null;
  isEditMode = false;

  transactionForm: FormGroup;
  installmentsOptions: number[] = Array.from({ length: 11 }, (_, i) => i + 2);

  constructor(
    private transactionService: TransactionService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.transactionForm = this.fb.group({
      id: [null],
      description: ['', Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      type: ['', Validators.required],
      isParcelada: [false],
      numeroParcelas: [{ value: 2, disabled: true }],
      // NOVO CAMPO para controlar o tipo de lançamento da parcela
      tipoLancamentoParcela: ['total'],
      isRecorrente: [false],
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
    this.setupConditionalLogic();
  }

  setupConditionalLogic(): void {
    const isParceladaControl = this.transactionForm.get('isParcelada');
    const numeroParcelasControl = this.transactionForm.get('numeroParcelas');

    isParceladaControl?.valueChanges.subscribe((isParcelada) => {
      if (isParcelada) {
        numeroParcelasControl?.enable();
        this.transactionForm
          .get('isRecorrente')
          ?.setValue(false, { emitEvent: false });
      } else {
        numeroParcelasControl?.disable();
      }
    });

    this.transactionForm
      .get('isRecorrente')
      ?.valueChanges.subscribe((isRecorrente) => {
        if (isRecorrente) {
          this.transactionForm
            .get('isParcelada')
            ?.setValue(false, { emitEvent: false });
        }
      });

    this.transactionForm.get('type')?.valueChanges.subscribe(() => {
      this.transactionForm
        .get('isParcelada')
        ?.setValue(false, { emitEvent: false });
      this.transactionForm
        .get('isRecorrente')
        ?.setValue(false, { emitEvent: false });
    });
  }

  loadTransactions(): void {
    this.allTransactions = this.transactionService
      .getTransactions()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  formatCurrency(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.value) {
      this.transactionForm.get('value')?.setValue(null);
      return;
    }
    let numericValue = parseFloat(input.value.replace(/\D/g, '')) / 100;
    if (isNaN(numericValue)) numericValue = 0;

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
    this.transactionForm
      .get('value')
      ?.setValue(numericValue, { emitEvent: false });
    input.value = formattedValue;
  }

  saveTransaction(): void {
    if (this.transactionForm.invalid) return;

    const formValue = this.transactionForm.getRawValue();
    const baseDate = new Date(formValue.date + 'T12:00:00');

    // LÓGICA DE PARCELAMENTO ATUALIZADA
    if (
      formValue.isParcelada &&
      formValue.type === 'expense' &&
      !this.isEditMode
    ) {
      let valorParcela: number;

      // Decide o valor da parcela com base na nova opção
      if (formValue.tipoLancamentoParcela === 'total') {
        valorParcela = parseFloat(
          (formValue.value / formValue.numeroParcelas).toFixed(2)
        );
      } else {
        // tipoLancamentoParcela === 'parcela'
        valorParcela = formValue.value;
      }

      for (let i = 0; i < formValue.numeroParcelas; i++) {
        const dataParcela = new Date(baseDate);
        dataParcela.setMonth(baseDate.getMonth() + i);
        const newTransaction: Transaction = {
          ...formValue,
          id: `${new Date().getTime()}-${i}`,
          description: `${formValue.description} (${i + 1}/${
            formValue.numeroParcelas
          })`,
          value: valorParcela,
          date: dataParcela.toISOString().split('T')[0],
        };
        this.transactionService.addTransaction(newTransaction);
      }
    } else if (formValue.isRecorrente && !this.isEditMode) {
      const typeLabel = formValue.type === 'income' ? 'Receita' : 'Despesa';
      for (let i = 0; i < 12; i++) {
        const dataRecorrente = new Date(baseDate);
        dataRecorrente.setMonth(baseDate.getMonth() + i);
        const newTransaction: Transaction = {
          ...formValue,
          id: `${new Date().getTime()}-${i}`,
          description: `${formValue.description} (${typeLabel} Recorrente)`,
          date: dataRecorrente.toISOString().split('T')[0],
        };
        this.transactionService.addTransaction(newTransaction);
      }
    } else {
      let transactionToSave = { ...formValue };
      if (this.isEditMode) {
        this.transactionService.updateTransaction(transactionToSave);
      } else {
        transactionToSave.id = new Date().getTime().toString();
        this.transactionService.addTransaction(transactionToSave);
      }
    }

    this.loadTransactions();
    this.closePopups();
  }

  openAddPopup(): void {
    this.isEditMode = false;
    this.transactionForm.reset({
      type: '',
      date: new Date().toISOString().split('T')[0],
      isParcelada: false,
      tipoLancamentoParcela: 'total', // Reseta para o padrão
      isRecorrente: false,
      numeroParcelas: { value: 2, disabled: true },
    });
    this.isPopupOpen = true;
  }

  openEditPopup(transaction: Transaction): void {
    this.isEditMode = true;
    this.transactionForm.patchValue(transaction);
    this.isPopupOpen = true;
  }

  openConfirmDelete(transaction: Transaction): void {
    this.transactionToDelete = transaction;
    this.isConfirmDeleteOpen = true;
  }

  deleteTransaction(): void {
    if (!this.transactionToDelete?.id) return;
    this.transactionService.deleteTransaction(this.transactionToDelete.id);
    this.loadTransactions();
    this.closePopups();
  }

  closePopups(): void {
    this.isPopupOpen = false;
    this.isConfirmDeleteOpen = false;
    this.transactionToDelete = null;
    this.router.navigate([], {
      queryParams: { openPopup: null },
      queryParamsHandling: 'merge',
    });
  }
}
