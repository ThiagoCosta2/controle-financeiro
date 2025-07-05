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

  // Função de formatação de moeda
  formatCurrency(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value === '') {
      this.transactionForm.get('value')?.setValue(null, { emitEvent: false });
      return;
    }

    const numericValue = parseFloat(value) / 100;
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);

    this.transactionForm
      .get('value')
      ?.setValue(formattedValue, { emitEvent: false });
  }

  // **CORRIGIDO E MELHORADO**: Lógica de filtro de data robusta e ordenação
  loadTransactions(): void {
    const allTransactions = this.transactionService.getTransactions();

    const today = new Date();
    // Ajusta para o fuso horário local e pega a string YYYY-MM-DD
    const todayString = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split('T')[0];

    this.transactions = allTransactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        // Faz o mesmo para a data da transação para uma comparação justa
        const transactionDateString = new Date(
          transactionDate.getTime() -
            transactionDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[0];

        return transactionDateString <= todayString;
      })
      // Ordena para que as transações mais recentes apareçam no topo
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Adiciona lógica para o novo campo de recorrência
  initForm(): void {
    this.transactionForm = this.fb.group({
      id: [null],
      type: ['expense', Validators.required],
      date: [this.formatDateForInput(new Date()), Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      isFixed: [false], // Para receitas recorrentes
      isRecurring: [false], // Para despesas parceladas
      installments: [{ value: 2, disabled: true }, Validators.required],
    });

    // Habilita/desabilita campos com base no TIPO (Entrada/Saída)
    this.transactionForm.get('type')?.valueChanges.subscribe((type) => {
      const isFixedControl = this.transactionForm.get('isFixed');
      const isRecurringControl = this.transactionForm.get('isRecurring');
      if (type === 'income') {
        isFixedControl?.enable();
        isRecurringControl?.setValue(false, { emitEvent: false });
        isRecurringControl?.disable();
      } else {
        isFixedControl?.setValue(false, { emitEvent: false });
        isFixedControl?.disable();
        isRecurringControl?.enable();
      }
    });

    // Habilita/desabilita parcelas para DESPESAS
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

    // Habilita/desabilita parcelas para RECEITAS
    this.transactionForm.get('isFixed')?.valueChanges.subscribe((isFixed) => {
      const installmentsControl = this.transactionForm.get('installments');
      if (isFixed) {
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
    // Formata o valor numérico para o padrão de moeda ao abrir a edição
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(transaction.value);

    this.transactionForm.setValue({
      id: transaction.id,
      type: transaction.type,
      date: this.formatDateForInput(new Date(transaction.date)),
      value: formattedValue, // Usa o valor formatado
      description: transaction.description,
      isFixed: transaction.isFixed ?? false,
      isRecurring: false, // Não permitimos alterar parcelamento na edição
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

  // Adiciona lógica para a nova recorrência de receita
  saveTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const formData = this.transactionForm.getRawValue();

    // Converte o valor formatado de volta para número antes de salvar
    if (typeof formData.value === 'string') {
      formData.value = parseFloat(
        formData.value
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .trim()
      );
    }

    if (this.currentTransaction && this.currentTransaction.id) {
      const updatedData: Transaction = {
        ...this.currentTransaction,
        ...formData,
        // Mantém a data ao meio-dia para consistência
        date: new Date(formData.date + 'T12:00:00'),
      };
      this.transactionService.updateTransaction(updatedData);
    } else {
      const { isFixed, isRecurring, installments, ...newTxData } = formData;
      // **ALTERAÇÃO CRÍTICA**: Usa o meio-dia para evitar problemas de fuso horário
      const baseDate = new Date(newTxData.date + 'T12:00:00');

      if (newTxData.type === 'income' && isFixed) {
        // Usa o número de meses do formulário
        for (let i = 0; i < installments; i++) {
          const installmentDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth() + i,
            baseDate.getDate()
          );
          const tx: Omit<Transaction, 'id'> = {
            ...newTxData,
            // Adiciona a parcela na descrição
            description: `${newTxData.description} (${i + 1}/${installments})`,
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
