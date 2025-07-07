// src/app/components/reports/reports.ts

import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
// CORREÇÃO CRÍTICA: Adicionada a palavra 'export'
export class ReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Dados do Resumo Mensal
  currentMonthIncome = 0;
  currentMonthExpenses = 0;
  currentMonthBalance = 0;

  // Projeções futuras
  futureExpenses = 0;

  // Histórico e Paginação
  allRecentTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  itemsPerPageOptions = [5, 10, 20, 50];

  // Gráficos
  private currentMonthChart: Chart | undefined;
  private futureProjectionsChart: Chart | undefined;

  // Variável interna para o cálculo do gráfico
  private actualIncomeThisMonth = 0;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.calculateReportData();
    this.updatePaginatedTransactions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createCurrentMonthChart();
      this.createFutureProjectionsChart();
    }, 0);
  }

  ngOnDestroy(): void {
    this.currentMonthChart?.destroy();
    this.futureProjectionsChart?.destroy();
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

    this.actualIncomeThisMonth = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);
    this.currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);
    this.currentMonthIncome =
      this.actualIncomeThisMonth +
      (previousMonthSurplus > 0 ? previousMonthSurplus : 0);
    this.currentMonthBalance =
      this.currentMonthIncome - this.currentMonthExpenses;

    this.futureExpenses = allTransactions
      .filter((t) => new Date(t.date) > now && t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    this.allRecentTransactions = allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.totalPages = Math.ceil(
      this.allRecentTransactions.length / this.itemsPerPage
    );
  }

  private createCurrentMonthChart(): void {
    const canvas = document.getElementById(
      'currentMonthChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;

    if (this.currentMonthChart) {
      this.currentMonthChart.destroy();
    }

    const income = this.actualIncomeThisMonth;
    const expenses = this.currentMonthExpenses;
    const totalFlow = income + expenses;

    const labels = [];
    const dataPoints = [];
    const colors = [];

    if (totalFlow === 0) {
      labels.push('Sem dados');
      dataPoints.push(1);
      colors.push('#cccccc');
    } else if (income / totalFlow < 0.02) {
      labels.push('Saídas');
      dataPoints.push(expenses);
      colors.push('#dc3545');
    } else if (expenses / totalFlow < 0.02) {
      labels.push('Entradas');
      dataPoints.push(income);
      colors.push('#28a745');
    } else {
      labels.push('Entradas', 'Saídas');
      dataPoints.push(income, expenses);
      colors.push('#28a745', '#dc3545');
    }

    this.currentMonthChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data: dataPoints, backgroundColor: colors }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
      },
    });
  }

  private createFutureProjectionsChart(): void {
    const canvas = document.getElementById(
      'futureProjectionsChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;

    this.futureProjectionsChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Despesas Futuras'],
        datasets: [
          {
            data: [this.futureExpenses > 0 ? this.futureExpenses : 1],
            backgroundColor: ['#fd7e14'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
      },
    });
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePaginatedTransactions();
  }

  updatePaginatedTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedTransactions = this.allRecentTransactions.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTransactions();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTransactions();
    }
  }
}
