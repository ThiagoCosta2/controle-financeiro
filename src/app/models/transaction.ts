// src/app/models/transaction.ts

export interface Transaction {
  id: string;
  description: string;
  value: number;
  date: string; // Manter como string para corresponder ao formulário
  type: 'income' | 'expense';
  category?: string;
  isFixed?: boolean;
  installments?: number;
  isRecurring?: boolean;
}
