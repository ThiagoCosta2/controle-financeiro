import { Routes } from '@angular/router';

// Importamos todos os componentes necessários para as rotas
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // 1. A ROTA INICIAL AGORA É A 'HOME'
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },

  // 2. REDIRECIONAMENTOS ATUALIZADOS
  // Se alguém acessar a raiz do site, será levado para a 'home'.
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Se alguém tentar acessar uma URL que não existe, também será levado para a 'home'.
  { path: '**', redirectTo: 'home' },
];
