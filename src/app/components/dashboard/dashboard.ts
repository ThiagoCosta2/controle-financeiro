import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// IMPORTAÇÕES ESSENCIAIS: RouterOutlet e RouterLink são necessários para a navegação interna.
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Adicione RouterOutlet e RouterLink aqui para que o HTML os reconheça.
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  // Propriedade para armazenar o nome do usuário.
  userName: string = '';
  // Propriedade para controlar o estado (aberto/fechado) da sidebar.
  isSidebarCollapsed: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Busca os dados do usuário logado quando o componente é inicializado.
    const currentUser = this.authService.getCurrentUser();
    if (
      currentUser !== null &&
      currentUser !== undefined &&
      currentUser.nome !== null &&
      currentUser.nome !== undefined
    ) {
      // Pega o primeiro nome do usuário para uma saudação mais pessoal.
      this.userName = currentUser.nome.split(' ')[0];
    }
  }

  // Método para o botão de logout.
  logout(): void {
    this.authService.logout();
  }

  // Método para abrir/fechar a sidebar.
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
