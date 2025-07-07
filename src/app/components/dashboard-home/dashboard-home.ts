// src/app/components/dashboard-home/dashboard-home.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
// CAMINHO CORRIGIDO: Agora aponta para 'transaction.ts'
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardHomeComponent implements OnInit {
  saldoAtual = 0;
  receitasDoMes = 0;
  despesasDoMes = 0;
  transacoesRecentes: Transaction[] = [];
  areValuesVisible = true;

  constructor(
    private router: Router,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.saldoAtual = this.transactionService.getSaldoAtual();
    this.receitasDoMes = this.transactionService.getReceitasDoMes();
    this.despesasDoMes = this.transactionService.getDespesasDoMes();
    this.transacoesRecentes = this.transactionService.getTransacoesRecentes(5);
  }

  toggleValuesVisibility(): void {
    this.areValuesVisible = !this.areValuesVisible;
  }

  goToAddTransaction(): void {
    this.router.navigate(['/dashboard/transactions'], {
      queryParams: { openPopup: 'true' },
    });
  }
}
