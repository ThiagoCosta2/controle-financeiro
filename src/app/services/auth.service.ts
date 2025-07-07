// ATENÇÃO: O armazenamento de dados do usuário no localStorage
// é inseguro e usado aqui apenas para fins de demonstração
// em um ambiente sem backend. Em produção, toda a lógica de
// autenticação e armazenamento deve ser gerenciada por um servidor seguro.
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface User {
  balance: number;
  nome: string;
  email: string;
  usuario: string;
  senha?: string; // Senha é opcional aqui, pois não a retornamos sempre
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'financial_app_users';
  private readonly LOGGED_IN_USER_KEY = 'financial_app_session';
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  register(userData: User): boolean {
    if (!this.isBrowser) return false;

    const users = this.getUsersFromStorage();
    const userExists = users.some(
      (u) => u.usuario === userData.usuario || u.email === userData.email
    );

    if (userExists) {
      alert('Erro: Usuário ou e-mail já cadastrado.');
      return false;
    }

    users.push(userData);
    this.saveUsersToStorage(users);
    return true;
  }

  login(credentials: any): boolean {
    if (!this.isBrowser) return false;

    const users = this.getUsersFromStorage();
    const foundUser = users.find(
      (u) => u.usuario === credentials.usuario && u.senha === credentials.senha
    );

    if (foundUser) {
      localStorage.setItem(this.LOGGED_IN_USER_KEY, JSON.stringify(foundUser));
      return true;
    }

    alert('Usuário ou senha inválidos.');
    return false;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.LOGGED_IN_USER_KEY);
      this.router.navigate(['/home']);
    }
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(this.LOGGED_IN_USER_KEY) !== null;
  }

  // 2. MÉTODO ATUALIZADO PARA RETORNAR O TIPO 'User'
  getCurrentUser(): User | null {
    if (!this.isBrowser) return null;

    const user = localStorage.getItem(this.LOGGED_IN_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  private getUsersFromStorage(): User[] {
    if (!this.isBrowser) return [];
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private saveUsersToStorage(users: User[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }
}
