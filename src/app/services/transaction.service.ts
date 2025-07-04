import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly TRANSACTIONS_KEY = 'financial_app_transactions';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getTransactions(): Transaction[] {
    if (!this.isBrowser) return [];
    const transactions = localStorage.getItem(this.TRANSACTIONS_KEY);
    const parsed = transactions
      ? (JSON.parse(transactions) as Transaction[])
      : [];
    // Ordena as transações pela data, da mais recente para a mais antiga
    return parsed.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  private saveTransactions(transactions: Transaction[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
    }
  }

  addTransaction(transactionData: Omit<Transaction, 'id' | 'date'>): void {
    const transactions = this.getTransactions();
    const newTransaction: Transaction = {
      ...transactionData,
      id: new Date().getTime().toString(), // ID único simples
      date: new Date(),
    };
    transactions.push(newTransaction);
    this.saveTransactions(transactions);
  }

  updateTransaction(updatedTransaction: Transaction): void {
    let transactions = this.getTransactions();
    transactions = transactions.map((t) =>
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    this.saveTransactions(transactions);
  }

  deleteTransaction(transactionId: string): void {
    let transactions = this.getTransactions();
    transactions = transactions.filter((t) => t.id !== transactionId);
    this.saveTransactions(transactions);
  }
}
