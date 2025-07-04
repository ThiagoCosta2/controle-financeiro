// 1. IMPORTAÇÕES ADICIONAIS
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getCurrentUser() {
    throw new Error('Method not implemented.');
  }
  private readonly USERS_KEY = 'financial_app_users';
  private readonly LOGGED_IN_USER_KEY = 'financial_app_session';

  // Propriedade para guardar se estamos no navegador
  private isBrowser: boolean;

  // 2. INJETA O PLATFORM_ID PARA SABER ONDE O CÓDIGO ESTÁ RODANDO
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // Verifica uma vez e armazena o resultado
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  register(userData: any): boolean {
    // 3. ADICIONA A VERIFICAÇÃO ANTES DE USAR O LOCALSTORAGE
    if (this.isBrowser) {
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
    return false; // No servidor, o registro não pode ocorrer
  }

  login(credentials: any): boolean {
    if (this.isBrowser) {
      const users = this.getUsersFromStorage();
      const foundUser = users.find(
        (u) =>
          u.usuario === credentials.usuario && u.senha === credentials.senha
      );

      if (foundUser) {
        localStorage.setItem(
          this.LOGGED_IN_USER_KEY,
          JSON.stringify(foundUser)
        );
        return true;
      }

      alert('Usuário ou senha inválidos.');
      return false;
    }
    return false;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.LOGGED_IN_USER_KEY);
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    if (this.isBrowser) {
      return localStorage.getItem(this.LOGGED_IN_USER_KEY) !== null;
    }
    return false; // Se não está no navegador, não está autenticado
  }

  // --- Métodos de apoio privados ---

  private getUsersFromStorage(): any[] {
    if (this.isBrowser) {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    }
    return [];
  }

  private saveUsersToStorage(users: any[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }
}
