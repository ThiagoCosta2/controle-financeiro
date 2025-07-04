import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Define chaves únicas para salvar os dados no localStorage do navegador.
  private readonly USERS_KEY = 'financial_app_users';
  private readonly LOGGED_IN_USER_KEY = 'financial_app_session';

  constructor(private router: Router) {}

  /**
   * Registra um novo usuário no sistema.
   * Salva os dados no localStorage.
   */
  register(userData: any): boolean {
    const users = this.getUsersFromStorage();
    const userExists = users.some(
      (u) => u.usuario === userData.usuario || u.email === userData.email
    );

    if (userExists) {
      alert('Erro: Usuário ou e-mail já cadastrado.');
      return false;
    }

    // ATENÇÃO: Em um projeto real, a senha NUNCA deve ser salva como texto puro.
    // Ela precisa ser criptografada (hashed) em um servidor back-end.
    users.push(userData);
    this.saveUsersToStorage(users);
    alert('Conta criada com sucesso! Por favor, faça o login.');
    return true;
  }

  /**
   * Tenta autenticar um usuário com as credenciais fornecidas.
   */
  login(credentials: any): boolean {
    const users = this.getUsersFromStorage();
    const foundUser = users.find(
      (u) => u.usuario === credentials.usuario && u.senha === credentials.senha
    );

    if (foundUser) {
      // Se o usuário for encontrado, salva a sessão no localStorage.
      localStorage.setItem(this.LOGGED_IN_USER_KEY, JSON.stringify(foundUser));
      return true;
    }

    alert('Usuário ou senha inválidos.');
    return false;
  }

  /**
   * Remove a sessão do usuário do localStorage e o redireciona para o login.
   */
  logout(): void {
    localStorage.removeItem(this.LOGGED_IN_USER_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica se existe uma sessão de usuário ativa.
   * Este é o método que o Guardião de Rota irá usar.
   */
  isAuthenticated(): boolean {
    return localStorage.getItem(this.LOGGED_IN_USER_KEY) !== null;
  }

  // --- Métodos de apoio privados ---

  private getUsersFromStorage(): any[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private saveUsersToStorage(users: any[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }
}
