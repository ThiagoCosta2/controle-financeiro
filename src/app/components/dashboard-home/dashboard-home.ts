import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable, Subscription } from 'rxjs';
import {
  FinanceService,
  FinancialSummary,
  ChartData,
} from '../../services/finance.service';
import { CommonModule } from '@angular/common';
import { TransactionsComponent } from '../transactions/transactions'; // Importar o componente de transações

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  // Adicionar TransactionsComponent aos imports para poder usá-lo no modal
  imports: [CommonModule, TransactionsComponent],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  summary$: Observable<FinancialSummary | null>;

  // Variáveis para controlar a UI
  isBalanceVisible = true;
  showTransactionModal = false;

  private expenseChart: Chart | undefined;
  private nextMonthProjectionChart: Chart | undefined;
  private subscriptions = new Subscription();

  constructor(private financeService: FinanceService) {
    this.summary$ = this.financeService.getFinancialSummary();
  }

  ngOnInit(): void {
    const expenseChartSubscription = this.financeService
      .getExpenseChartData()
      .subscribe((data) => {
        if (data) this.createExpenseChart(data);
      });

    const nextMonthSubscription = this.financeService
      .getNextMonthProjection()
      .subscribe((projection) => {
        if (projection)
          this.createNextMonthProjectionChart(projection.expenseDetails);
      });

    this.subscriptions.add(expenseChartSubscription);
    this.subscriptions.add(nextMonthSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // --- MÉTODOS PARA INTERAÇÃO DA UI ---

  toggleBalanceVisibility(): void {
    this.isBalanceVisible = !this.isBalanceVisible;
  }

  openTransactionModal(): void {
    this.showTransactionModal = true;
  }

  // O modal será fechado ao submeter o formulário ou clicar fora
  closeTransactionModal(): void {
    this.showTransactionModal = false;
    // Forçar o recarregamento dos dados após fechar o modal
    // (O FinanceService já faz isso ao adicionar transação, mas é uma garantia extra)
  }

  // --- MÉTODOS PARA CRIAR OS GRÁFICOS ---

  private createExpenseChart(chartData: ChartData): void {
    const canvas = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.expenseChart) this.expenseChart.destroy();

    this.expenseChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Despesas do Mês',
            data: chartData.data,
            backgroundColor: ['#FF6384', '#FFCD56', '#FF9F40'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Despesas do Mês Atual' },
        },
      },
    });
  }

  private createNextMonthProjectionChart(chartData: ChartData): void {
    const canvas = document.getElementById(
      'nextMonthProjectionChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;
    if (this.nextMonthProjectionChart) this.nextMonthProjectionChart.destroy();

    this.nextMonthProjectionChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Projeção de Despesas',
            data: chartData.data,
            backgroundColor: ['#36A2EB', '#4BC0C0', '#9966FF'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Projeção Próximo Mês' },
        },
      },
    });
  }
}
