export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  value: number;
  description: string;
  isFixed?: boolean;
  date: Date;
}
