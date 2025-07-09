import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction } from '../models/transaction';
import { TransactionService } from './transaction.service';

// Interfaces para os dados que o serviço fornecerá
export interface FinancialSummary {
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthBalance: number;
  recentTransactions: Transaction[];
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface NextMonthProjection {
  projectedExpenses: number;
  expenseDetails: ChartData;
}

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private financialSummary = new BehaviorSubject<FinancialSummary | null>(null);
  private nextMonthProjection = new BehaviorSubject<NextMonthProjection | null>(
    null
  );
  private incomeChartData = new BehaviorSubject<ChartData | null>(null);
  private expenseChartData = new BehaviorSubject<ChartData | null>(null);

  private allTransactions: Transaction[] = [];

  constructor(private transactionService: TransactionService) {
    this.loadUserTransactions();
  }

  // --- MÉTODOS PÚBLICOS PARA OS COMPONENTES ---

  getFinancialSummary(): Observable<FinancialSummary | null> {
    return this.financialSummary.asObservable();
  }

  getNextMonthProjection(): Observable<NextMonthProjection | null> {
    return this.nextMonthProjection.asObservable();
  }

  getIncomeChartData(): Observable<ChartData | null> {
    return this.incomeChartData.asObservable();
  }

  getExpenseChartData(): Observable<ChartData | null> {
    return this.expenseChartData.asObservable();
  }

  addTransaction(transaction: Transaction): void {
    this.transactionService.addTransaction(transaction);
    this.loadUserTransactions();
  }

  updateTransaction(transaction: Transaction): void {
    this.transactionService.updateTransaction(transaction);
    this.loadUserTransactions();
  }

  deleteTransaction(transactionId: string): void {
    this.transactionService.deleteTransaction(transactionId);
    this.loadUserTransactions();
  }

  // --- LÓGICA INTERNA DO SERVIÇO ---

  private loadUserTransactions(): void {
    // CORREÇÃO: Usando o método correto do seu serviço
    this.allTransactions = this.transactionService.getTransactions();
    this.recalculate();
  }

  private recalculate(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const limitDate = new Date(currentYear, currentMonth + 2, 0);

    const effectiveTransactions = this.generateEffectiveTransactions(
      this.allTransactions,
      limitDate
    );

    const currentMonthTransactions = effectiveTransactions.filter((t) => {
      const tDate = new Date(t.date + 'T00:00:00');
      return (
        tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth
      );
    });

    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonthTransactions = effectiveTransactions.filter((t) => {
      const tDate = new Date(t.date + 'T00:00:00');
      return (
        tDate.getFullYear() === nextMonthDate.getFullYear() &&
        tDate.getMonth() === nextMonthDate.getMonth()
      );
    });

    // CORREÇÃO: Usando 'income'/'expense' e a propriedade 'value'
    const currentMonthIncome = this.sumTransactions(
      currentMonthTransactions,
      'income'
    );
    const currentMonthExpenses = this.sumTransactions(
      currentMonthTransactions,
      'expense'
    );
    const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

    const summary: FinancialSummary = {
      currentMonthIncome,
      currentMonthExpenses,
      currentMonthBalance,
      recentTransactions: [...currentMonthTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    };
    this.financialSummary.next(summary);

    const projectedExpenses = this.sumTransactions(
      nextMonthTransactions,
      'expense'
    );
    const nextMonthProjectionData: NextMonthProjection = {
      projectedExpenses,
      expenseDetails: this.calculateChartData(nextMonthTransactions, 'expense'),
    };
    this.nextMonthProjection.next(nextMonthProjectionData);

    this.incomeChartData.next(
      this.calculateChartData(currentMonthTransactions, 'income')
    );
    this.expenseChartData.next(
      this.calculateChartData(currentMonthTransactions, 'expense')
    );
  }

  private generateEffectiveTransactions(
    transactions: Transaction[],
    limitDate: Date
  ): Transaction[] {
    const effective: Transaction[] = [];

    transactions.forEach((t) => {
      const baseDate = new Date(t.date + 'T00:00:00');

      if (t.isRecurring) {
        let recurringDate = new Date(baseDate);
        while (recurringDate <= limitDate) {
          // CORREÇÃO: Converte Date de volta para string 'YYYY-MM-DD'
          effective.push({
            ...t,
            date: recurringDate.toISOString().split('T')[0],
          });
          recurringDate.setMonth(recurringDate.getMonth() + 1);
        }
      } else if (t.installments && t.installments > 1) {
        for (let i = 0; i < t.installments; i++) {
          let installmentDate = new Date(baseDate);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          if (installmentDate <= limitDate) {
            effective.push({
              ...t,
              // CORREÇÃO: Usa 'value' para o cálculo da parcela
              value: t.value / t.installments,
              // CORREÇÃO: Converte Date de volta para string 'YYYY-MM-DD'
              date: installmentDate.toISOString().split('T')[0],
              description: `${t.description} (${i + 1}/${t.installments})`,
            });
          }
        }
      } else {
        if (baseDate <= limitDate) {
          effective.push(t);
        }
      }
    });

    return effective;
  }

  private sumTransactions(
    transactions: Transaction[],
    type: 'income' | 'expense'
  ): number {
    return (
      transactions
        .filter((t) => t.type === type)
        // CORREÇÃO: Soma usando a propriedade 'value'
        .reduce((sum, t) => sum + t.value, 0)
    );
  }

  private calculateChartData(
    transactions: Transaction[],
    type: 'income' | 'expense'
  ): ChartData {
    const filtered = transactions.filter((t) => t.type === type);
    const grouped = filtered.reduce((acc, t) => {
      const category = t.category || 'Sem Categoria';
      // CORREÇÃO: Agrupa usando a propriedade 'value'
      acc[category] = (acc[category] || 0) + t.value;
      return acc;
    }, {} as { [key: string]: number });

    return {
      labels: Object.keys(grouped),
      data: Object.values(grouped),
    };
  }
}
