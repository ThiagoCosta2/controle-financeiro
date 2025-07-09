import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { FinanceService } from '../../services/finance.service';
import { Transaction } from '../../models/transaction';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class ReportsComponent implements OnInit {
  transactionHistory: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  nextMonthExpenses: Transaction[] = [];
  nextMonthTotal: number = 0;

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  itemsPerPageOptions = [5, 10, 15, 20];

  // =====> ALTERAÇÃO 1: Propriedade adicionada <=====
  isBalanceVisible: boolean = true;

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  // =====> ALTERAÇÃO 2: Método adicionado <=====
  toggleBalanceVisibility(): void {
    this.isBalanceVisible = !this.isBalanceVisible;
  }

  loadReportData(): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const allEffectiveTransactions =
      this.financeService.generateEffectiveTransactions();

    this.transactionHistory = allEffectiveTransactions
      .filter((t) => new Date(t.date) <= today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.updatePagination();

    const currentMonthTransactions = allEffectiveTransactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const incomeData = this.financeService.groupTransactionsByCategory(
      currentMonthTransactions,
      'income'
    );
    this.createDoughnutChart(
      'incomeChartCanvas',
      'Receitas do Mês por Categoria',
      incomeData,
      ['#28a745', '#218838', '#1e7e34']
    );

    const expenseData = this.financeService.groupTransactionsByCategory(
      currentMonthTransactions,
      'expense'
    );
    this.createDoughnutChart(
      'expenseChartCanvas',
      'Despesas do Mês por Categoria',
      expenseData,
      ['#dc3545', '#c82333', '#b21f2d']
    );

    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    this.nextMonthExpenses = allEffectiveTransactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' &&
        d.getMonth() === nextMonthDate.getMonth() &&
        d.getFullYear() === nextMonthDate.getFullYear()
      );
    });
    this.nextMonthTotal = this.nextMonthExpenses.reduce(
      (sum, t) => sum + t.value,
      0
    );
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(
      this.transactionHistory.length / this.itemsPerPage
    );
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedTransactions = this.transactionHistory.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  createDoughnutChart(
    canvasId: string,
    label: string,
    chartData: { labels: string[]; data: number[] },
    bgColors: string[]
  ): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{ label, data: chartData.data, backgroundColor: bgColors }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: label },
        },
      },
    });
  }
}
