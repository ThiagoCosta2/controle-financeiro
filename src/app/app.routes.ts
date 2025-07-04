import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';

// Importa o guardião que acabamos de criar.
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // --- Rotas Públicas ---
  // Qualquer pessoa, logada ou não, pode acessar estas rotas.
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // --- Rota Protegida ---
  // Apenas usuários autenticados podem acessar esta rota.
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard], // O guardião é aplicado aqui!
  },

  // --- Redirecionamentos ---
  // Se alguém acessar a raiz do site (ex: "meusite.com"), será levado para a tela de login.
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Se alguém tentar acessar uma URL que não existe, também será levado para o login.
  { path: '**', redirectTo: 'login' },
];
