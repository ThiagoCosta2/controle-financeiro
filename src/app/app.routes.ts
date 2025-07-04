import { Routes } from '@angular/router';

// Importe todos os seus componentes
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

// Importe os componentes filhos do dashboard
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home';
import { TransactionsComponent } from './components/transactions/transactions';
// Importando os componentes de Relatórios e Configurações
import { ReportsComponent } from './components/reports/reports';
import { SettingsComponent } from './components/settings/settings';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'transactions', component: TransactionsComponent },
      // Adicionando as rotas para Relatórios e Configurações
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
