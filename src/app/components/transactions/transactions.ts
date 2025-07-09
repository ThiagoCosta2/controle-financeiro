import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction';
import { FinanceService } from '../../services/finance.service'; // MUDANÇA: Usar o FinanceService
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css'],
})
export class TransactionsComponent implements OnInit {
  transactionForm: FormGroup;
  transactions: Transaction[] = []; // Manter uma lista local para exibição na página

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService, // MUDANÇA: Injetar o FinanceService
    private authService: AuthService
  ) {
    this.transactionForm = this.fb.group({
      id: [null],
      // CORREÇÃO: O valor inicial do formulário agora é 'expense'
      type: ['expense', Validators.required],
      description: ['', Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required],
      category: [''],
      installments: [1],
      isRecurring: [false],
    });
  }

  ngOnInit(): void {
    // Poderíamos nos inscrever aqui para exibir a lista de transações se necessário
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // Idealmente, mostrar uma mensagem de erro para o usuário
      console.error('Usuário não encontrado!');
      return;
    }

    const formValue = this.transactionForm.value;

    const newTransaction: Transaction = {
      id: formValue.id || new Date().getTime().toString(), // Gera um ID simples
      username: currentUser.username,
      type: formValue.type, // O valor já será 'income' ou 'expense' vindo do HTML
      description: formValue.description,
      value: parseFloat(formValue.value),
      date: formValue.date,
      category: formValue.category,
      installments: parseInt(formValue.installments, 10),
      isRecurring: formValue.isRecurring,
    };

    // MUDANÇA: Usar o FinanceService para adicionar a transação
    // Isso vai salvar a transação E recalcular tudo automaticamente
    this.financeService.addTransaction(newTransaction);

    this.transactionForm.reset({
      type: 'expense',
      installments: 1,
      isRecurring: false,
    });
  }
}
