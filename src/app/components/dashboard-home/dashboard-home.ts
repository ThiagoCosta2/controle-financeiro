import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Módulo para *ngIf, *ngFor, pipes
import { TransactionsComponent } from '../transactions/transactions'; // O componente do Modal
import { FinanceService } from '../../services/finance.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, TransactionsComponent], // Importa os módulos necessários
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardHomeComponent implements OnInit {
  monthlyIncome: number = 0;
  monthlyExpense: number = 0;
  currentBalance: number = 0;
  recentTransactions: Transaction[] = [];

  isBalanceVisible: boolean = true;
  showTransactionModal: boolean = false;

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Busca o resumo do mês
    const summary = this.financeService.getMonthlySummary();
    this.monthlyIncome = summary.income;
    this.monthlyExpense = summary.expense;
    this.currentBalance = this.monthlyIncome - this.monthlyExpense;

    // Lógica para transações recentes
    const allEffective = this.financeService.generateEffectiveTransactions();
    const today = new Date();
    this.recentTransactions = allEffective
      .filter((t) => new Date(t.date) <= today) // Filtra transações até a data de hoje
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ordena da mais nova para a mais antiga
      .slice(0, 5); // Pega as 5 primeiras
  }

  toggleBalanceVisibility(): void {
    this.isBalanceVisible = !this.isBalanceVisible;
  }

  openTransactionModal(): void {
    this.showTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.loadDashboardData(); // Recarrega os dados ao fechar o modal
  }
}
