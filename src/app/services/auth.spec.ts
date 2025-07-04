// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ----- CORREÇÃO AQUI -----
  isAuthenticated(): boolean {
    // Esta função agora usa a lógica correta que você já tinha escrito.
    return this.isLoggedIn();
  }
  // -------------------------

  private readonly USERS_KEY = 'financial_users';
  private readonly LOGGED_USER_KEY = 'financial_logged_user';

  constructor(private router: Router) {}

  // Retorna a lista de usuários do localStorage
  private getUsers(): any[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Salva a lista de usuários no localStorage
  private saveUsers(users: any[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Cadastra um novo usuário
  register(user: any): boolean {
    const users = this.getUsers();
    const userExists = users.find((u) => u.usuario === user.usuario);
    if (userExists) {
      alert('Este nome de usuário já existe!');
      return false;
    }
    users.push(user);
    this.saveUsers(users);
    alert('Usuário cadastrado com sucesso!');
    return true;
  }

  // Realiza o login
  login(credentials: any): boolean {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.usuario === credentials.usuario && u.senha === credentials.senha
    );
    if (user) {
      localStorage.setItem(this.LOGGED_USER_KEY, JSON.stringify(user));
      this.router.navigate(['/dashboard']); // Redireciona para o dashboard
      return true;
    }
    alert('Usuário ou senha inválidos!');
    return false;
  }

  // Realiza o logout
  logout(): void {
    localStorage.removeItem(this.LOGGED_USER_KEY);
    this.router.navigate(['/login']);
  }

  // Verifica se há um usuário logado
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.LOGGED_USER_KEY);
  }
}
