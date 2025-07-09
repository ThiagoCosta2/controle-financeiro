// Copie e cole este código inteiro no seu arquivo finance.service.ts

import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { TransactionService } from './transaction.service';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  constructor(
    private authService: AuthService,
    private transactionService: TransactionService
  ) {}

  // ====================================================================
  // MÉTODOS PARA O NOVO DASHBOARD E TRANSACTIONS (CORRIGINDO OS ERROS)
  // ====================================================================

  /**
   * Adiciona uma transação através do TransactionService.
   * Este método é chamado pelo componente de transações.
   */
  public addTransaction(transaction: Transaction): void {
    this.transactionService.addTransaction(transaction);
  }

  /**
   * Retorna os totais de receita e despesa do mês atual.
   * Usado pelo dashboard-home.
   */
  public getMonthlySummary(): { income: number; expense: number } {
    const allTransactions = this.generateEffectiveTransactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = allTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const income = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const expense = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    return { income, expense };
  }

  // ====================================================================
  // MÉTODOS PARA A NOVA TELA DE RELATÓRIOS (JÁ CORRIGIDOS ANTES)
  // ====================================================================

  public generateEffectiveTransactions(): Transaction[] {
    const user = this.authService.getCurrentUser();
    if (!user) return [];

    const transactions = this.transactionService.getTransactions();
    const effectiveTransactions: Transaction[] = [];

    transactions.forEach((transaction) => {
      if (transaction.installments && transaction.installments > 1) {
        for (let i = 1; i <= transaction.installments; i++) {
          const installmentDate = new Date(transaction.date);
          installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
          effectiveTransactions.push({
            ...transaction,
            date: installmentDate.toISOString(),
            value: transaction.value,
            description: `${transaction.description} (${i}/${transaction.installments})`,
            id: `${transaction.id}-installment-${i}`,
          });
        }
      } else if (transaction.isRecurring) {
        for (let i = 0; i < 12; i++) {
          const recurringDate = new Date(transaction.date);
          recurringDate.setMonth(recurringDate.getMonth() + i);
          effectiveTransactions.push({
            ...transaction,
            date: recurringDate.toISOString(),
            id: `${transaction.id}-recurring-${i}`,
          });
        }
      } else {
        effectiveTransactions.push(transaction);
      }
    });

    return effectiveTransactions;
  }

  public groupTransactionsByCategory(
    transactions: Transaction[],
    type: 'income' | 'expense'
  ): { labels: string[]; data: number[] } {
    const filteredTransactions = transactions.filter((t) => t.type === type);
    const categoryMap = new Map<string, number>();

    for (const transaction of filteredTransactions) {
      const category =
        transaction.category ||
        (type === 'income' ? 'Outras Receitas' : 'Outras Despesas');
      const currentValue = categoryMap.get(category) || 0;
      categoryMap.set(category, currentValue + transaction.value);
    }

    return {
      labels: Array.from(categoryMap.keys()),
      data: Array.from(categoryMap.values()),
    };
  }
}
