import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class ReportsComponent implements OnInit, AfterViewInit {
  allRecentTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  currentMonthIncome = 0;
  currentMonthExpenses = 0;
  currentMonthBalance = 0;
  futureExpenses = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  itemsPerPageOptions = [5, 10, 20, 50];
  private currentMonthChart: Chart | undefined;
  private futureProjectionsChart: Chart | undefined;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.calculateReportData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createCurrentMonthChart();
      this.createFutureProjectionsChart();
    }, 0);
  }

  private calculateReportData(): void {
    const allTransactions = this.transactionService.getTransactions();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear =
      currentMonth === 0 ? currentYear - 1 : currentYear;
    const previousMonthTransactions = allTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getFullYear() === previousMonthYear &&
        transactionDate.getMonth() === previousMonth
      );
    });
    const previousMonthIncome = previousMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);
    const previousMonthExpenses = previousMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);
    const previousMonthSurplus = previousMonthIncome - previousMonthExpenses;
    const currentMonthTransactions = allTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getFullYear() === currentYear &&
        transactionDate.getMonth() === currentMonth
      );
    });
    this.currentMonthIncome =
      currentMonthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0) +
      (previousMonthSurplus > 0 ? previousMonthSurplus : 0);
    this.currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);
    this.currentMonthBalance =
      this.currentMonthIncome - this.currentMonthExpenses;
    this.futureExpenses = allTransactions
      .filter(
        (t) =>
          new Date(t.date) > new Date(currentYear, currentMonth + 1, 0) &&
          t.type === 'expense'
      )
      .reduce((sum, t) => sum + t.value, 0);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    this.allRecentTransactions = allTransactions
      .filter((t) => new Date(t.date) >= threeMonthsAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.totalPages = Math.ceil(
      this.allRecentTransactions.length / this.itemsPerPage
    );
    this.updatePaginatedTransactions();
  }

  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(selectElement.value);
    this.currentPage = 1;
    this.totalPages = Math.ceil(
      this.allRecentTransactions.length / this.itemsPerPage
    );
    this.updatePaginatedTransactions();
  }

  updatePaginatedTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTransactions = this.allRecentTransactions.slice(
      startIndex,
      endIndex
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTransactions();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  private createCurrentMonthChart(): void {
    const canvas = document.getElementById(
      'currentMonthChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;
    if (this.currentMonthChart) {
      this.currentMonthChart.destroy();
    }
    const data = {
      labels: ['Entradas Totais', 'Saídas do Mês', 'Saldo Restante'],
      datasets: [
        {
          data: [
            this.currentMonthIncome > 0 ? this.currentMonthIncome : 0,
            this.currentMonthExpenses > 0 ? this.currentMonthExpenses : 0,
            this.currentMonthBalance > 0 ? this.currentMonthBalance : 0,
          ],
          backgroundColor: ['#28a745', '#dc3545', '#007bff'],
          hoverOffset: 4,
        },
      ],
    };
    this.currentMonthChart = new Chart(canvas, {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        aspectRatio: 1, // **CORREÇÃO APLICADA AQUI**
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Resumo do Mês Atual' },
        },
      },
    });
  }

  private createFutureProjectionsChart(): void {
    const canvas = document.getElementById(
      'futureProjectionsChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;
    if (this.futureProjectionsChart) {
      this.futureProjectionsChart.destroy();
    }
    const data = {
      labels: ['Gastos Futuros Planejados'],
      datasets: [
        {
          data: [this.futureExpenses > 0 ? this.futureExpenses : 1],
          backgroundColor: ['#fd7e14'],
          hoverOffset: 4,
        },
      ],
    };
    this.futureProjectionsChart = new Chart(canvas, {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        aspectRatio: 1, // **CORREÇÃO APLICADA AQUI**
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Projeção de Despesas Futuras' },
        },
      },
    });
  }
}
