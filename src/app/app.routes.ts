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
// ... importe os outros (Reports, Settings)

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    // As rotas filhas que serão renderizadas no <router-outlet>
    children: [
      // Quando a URL for /dashboard, mostre o DashboardHomeComponent
      { path: '', component: DashboardHomeComponent },
      // Quando a URL for /dashboard/transactions, mostre o TransactionsComponent
      { path: 'transactions', component: TransactionsComponent },
      // ... adicione as outras rotas filhas aqui
    ],
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
