export interface Transaction {
  id: string;
  username: string;
  type: 'income' | 'expense'; // PADRÃO: Usaremos 'income' para Receita e 'expense' para Despesa
  description: string;
  value: number; // PADRÃO: A propriedade para o valor monetário é 'value'
  date: string; // Formato YYYY-MM-DD
  category?: string;
  installments?: number;
  isRecurring?: boolean;
}
