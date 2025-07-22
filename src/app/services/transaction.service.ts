// ARQUIVO: src/app/services/transaction.service.ts

import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction';
import { RecurrenceRule } from '../models/recurrence-rule.model'; // IMPORTAR
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionsKey = 'transactions';
  private rulesKey = 'recurrence_rules'; // NOVA CHAVE PARA REGRAS
  private ruleIdToEdit: string | null = null;

  constructor(private authService: AuthService) {}

  // --- MÉTODOS PARA TRANSAÇÕES ÚNICAS ---

  getTransactions(): Transaction[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    const allTransactions = this.getAllFromStorage<Transaction>(
      this.transactionsKey
    );
    return allTransactions.filter((t) => t.userId === currentUser.id);
  }

  addTransaction(transaction: Transaction): void {
    const allTransactions = this.getAllFromStorage<Transaction>(
      this.transactionsKey
    );
    allTransactions.push(transaction);
    this.saveAllToStorage(this.transactionsKey, allTransactions);
  }

  // --- MÉTODOS NOVOS PARA GERIR REGRAS DE RECORRÊNCIA ---

  getRecurrenceRules(): RecurrenceRule[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    const allRules = this.getAllFromStorage<RecurrenceRule>(this.rulesKey);
    return allRules.filter((r) => r.userId === currentUser.id);
  }

  addRecurrenceRule(rule: RecurrenceRule): void {
    const allRules = this.getAllFromStorage<RecurrenceRule>(this.rulesKey);
    allRules.push(rule);
    this.saveAllToStorage(this.rulesKey, allRules);
  }

  updateRecurrenceRule(updatedRule: RecurrenceRule): void {
    let allRules = this.getAllFromStorage<RecurrenceRule>(this.rulesKey);
    allRules = allRules.map((rule) =>
      rule.id === updatedRule.id ? updatedRule : rule
    );
    this.saveAllToStorage(this.rulesKey, allRules);
  }

  deleteRecurrenceRule(ruleId: string): void {
    let allRules = this.getAllFromStorage<RecurrenceRule>(this.rulesKey);
    allRules = allRules.filter((rule) => rule.id !== ruleId);
    this.saveAllToStorage(this.rulesKey, allRules);
  }

  // --- MÉTODOS GENÉRICOS DE ARMAZENAMENTO ---

  private getAllFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveAllToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // NOVOS MÉTODOS PARA CONTROLAR A EDIÇÃO
  startEdit(ruleId: string) {
    this.ruleIdToEdit = ruleId;
  }

  getRuleToEdit(): string | null {
    return this.ruleIdToEdit;
  }

  clearEdit() {
    this.ruleIdToEdit = null;
  }
}
