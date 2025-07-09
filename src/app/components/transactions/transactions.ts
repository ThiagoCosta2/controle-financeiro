import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction'; // Verifique se a importação está correta
import { FinanceService } from '../../services/finance.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.html', // Garanta que o nome do seu arquivo HTML é este
  styleUrls: ['./transactions.css'], // Garanta que o nome do seu arquivo CSS é este
})
export class TransactionsComponent implements OnInit {
  transactionForm: FormGroup;
  transactions: Transaction[] = []; // Lista para exibir as transações na tela

  // Propriedade para controlar a visibilidade do modal/formulário
  isModalOpen = false;

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private authService: AuthService
  ) {
    // A construção do formulário acontece aqui uma única vez
    this.transactionForm = this.fb.group({
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
    this.loadTransactions(); // Carrega as transações ao iniciar o componente
  }

  /**
   * Carrega as transações do usuário para exibição na tela.
   */
  loadTransactions(): void {
    // Usamos o generateEffectiveTransactions para ter a visão mais completa
    this.transactions = this.financeService
      .generateEffectiveTransactions()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Método único para lidar com a submissão do formulário.
   */
  onSubmit(): void {
    if (this.transactionForm.invalid) {
      // Marcar campos como "tocados" para exibir mensagens de erro no HTML
      this.transactionForm.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Erro: Usuário não autenticado.'); // Substituir por notificação
      return;
    }

    const formValue = this.transactionForm.value;

    const newTransaction: Transaction = {
      id: new Date().getTime().toString(),
      // CORREÇÃO: Usando 'userId' como definido no modelo
      userId: currentUser.id,
      type: formValue.type,
      description: formValue.description,
      value: parseFloat(formValue.value),
      date: formValue.date,
      category: formValue.category,
      installments: parseInt(formValue.installments, 10),
      isRecurring: formValue.isRecurring,
    };

    // O FinanceService lida com a lógica de salvar a transação
    this.financeService.addTransaction(newTransaction);

    this.closeModal(); // Fecha o formulário
    this.loadTransactions(); // Atualiza a lista na tela
  }

  // Funções para controlar o modal (formulário)
  openModal(): void {
    this.isModalOpen = true;
    this.transactionForm.reset({
      type: 'expense',
      installments: 1,
      isRecurring: false,
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
}
