export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: 'income' | 'expense';
  value: number;
  description: string;
  category?: string;
  date: string;
  isRecurring?: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  installments?: number;
  currentInstallment?: number;
  originalId?: string;
}
