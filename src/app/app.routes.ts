import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.LoginComponent),
  },
  // src/app/app.routes.ts
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard').then((m) => m.Dashboard),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
];
