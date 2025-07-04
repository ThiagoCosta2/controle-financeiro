import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

// Para as rotas filhas, vamos criar componentes de exemplo.
// No seu terminal, rode:
// ng g c components/transactions
// ng g c components/reports
// ng g c components/settings
// ng g c components/dashboard-home  // Esta será a tela inicial do dashboard

import { Transactions } from './components/transactions/transactions';
import { Reports } from './components/reports/reports';
import { Settings } from './components/settings/settings';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rota do Dashboard agora é um "Layout" que contém outras rotas
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      // Quando o usuário for para '/dashboard', ele verá o DashboardHomeComponent
      { path: '', component: DashboardHomeComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
