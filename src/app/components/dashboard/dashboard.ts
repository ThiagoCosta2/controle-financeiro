import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. IMPORTAÇÕES ESSENCIAIS PARA ROTAS
// Precisamos importar os módulos do Router para que o HTML os reconheça.
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// Importamos o AuthService e a interface User para corrigir os erros de tipo.
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // 2. ADICIONAMOS OS MÓDULOS DE ROTA AOS IMPORTS
  // Agora o Angular saberá o que são <router-outlet> e routerLinkActiveOptions.
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  isSidebarCollapsed: boolean = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser: User | null = this.authService.getCurrentUser();
    // 3. CÓDIGO SEGURO CONTRA ERROS
    // Como agora sabemos que currentUser é do tipo 'User', o erro de 'nome' desaparece.
    if (currentUser) {
      this.userName = currentUser.nome.split(' ')[0];
    }
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
