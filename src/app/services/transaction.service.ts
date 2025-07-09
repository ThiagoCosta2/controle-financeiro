// src/app/services/transaction.service.ts

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Transaction } from '../models/transaction';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private TRANSACTIONS_KEY_PREFIX = 'transactions_';
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private getStorageKey(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${this.TRANSACTIONS_KEY_PREFIX}${user.username}` : ''; // Propriedade corrigida
  }

  getTransactions(): Transaction[] {
    if (!this.isBrowser) return [];
    const key = this.getStorageKey();
    if (!key) return [];
    const transactionsJson = localStorage.getItem(key);
    return transactionsJson ? JSON.parse(transactionsJson) : [];
  }

  saveTransactions(transactions: Transaction[]): void {
    if (!this.isBrowser) return;
    const key = this.getStorageKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(transactions));
    }
  }

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
  }

  deleteTransaction(id: string): void {
    let transactions = this.getTransactions();
    transactions = transactions.filter((t) => t.id !== id);
    this.saveTransactions(transactions);
  }

  updateTransaction(updatedTransaction: Transaction): void {
    let transactions = this.getTransactions();
    transactions = transactions.map((t) =>
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    this.saveTransactions(transactions);
  }

  /************************************************************/
  /* --- FUNÇÕES ADICIONADAS PARA CORRIGIR OS ERROS DO DASHBOARD --- */
  /************************************************************/

  getSaldoAtual(): number {
    const transactions = this.getTransactions();
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);
    return totalIncome - totalExpense;
  }

  getReceitasDoMes(): number {
    const now = new Date();
    return this.getTransactions()
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'income' &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
  }

  getDespesasDoMes(): number {
    const now = new Date();
    return this.getTransactions()
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
  }

  getTransacoesRecentes(limit: number): Transaction[] {
    return this.getTransactions()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}
