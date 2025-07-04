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
    private route: ActivatedRoute, // Para ler parâmetros da URL
    private router: Router // Para navegar e limpar a URL
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.initForm();

    // Verifica se a URL contém o parâmetro para abrir o popup
    this.route.queryParams.subscribe((params) => {
      if (params['openPopup'] === 'true') {
        this.openAddPopup();
        // Limpa o parâmetro da URL para não reabrir o popup ao recarregar a página
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

  // Formata um objeto Date para o formato 'YYYY-MM-DD' que o input[type=date] aceita
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      id: [null],
      type: ['expense', Validators.required],
      date: [this.formatDateForInput(new Date()), Validators.required], // Usa a data atual como padrão
      value: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      isFixed: [false], // Para receitas
      isRecurring: [false], // Para despesas
      installments: [{ value: 2, disabled: true }, Validators.required],
    });

    // Habilita/desabilita campos com base no tipo (Entrada/Saída)
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

    // Habilita/desabilita o seletor de parcelas
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
      date: this.formatDateForInput(new Date()), // Garante que a data seja a atual ao abrir
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
    // As opções de recorrência são desabilitadas na edição para manter a simplicidade
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

    // Lógica para editar uma transação existente
    if (this.currentTransaction && this.currentTransaction.id) {
      const updatedData: Transaction = {
        ...this.currentTransaction,
        ...formData,
        date: new Date(formData.date + 'T00:00:00'), // Garante que a string de data seja convertida corretamente
      };
      this.transactionService.updateTransaction(updatedData);
    } else {
      // Lógica para adicionar nova(s) transação(ões)
      const { isFixed, isRecurring, installments, ...newTxData } = formData;
      const baseDate = new Date(newTxData.date + 'T12:00:00Z'); // Usar a data do formulário

      if (newTxData.type === 'income' && isFixed) {
        // Lógica para Renda Fixa: cria para os próximos 12 meses
        for (let i = 0; i < 12; i++) {
          const installmentDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth() + i,
            baseDate.getDate()
          );
          const tx: Omit<Transaction, 'id'> = {
            ...newTxData,
            description: `${newTxData.description}`, // Descrição não muda para renda fixa
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
        // Lógica para Despesa Parcelada
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
        // Lógica para Transação Única
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
