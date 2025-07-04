import { Component, OnInit } from '@angular/core';
// 1. Apenas o CommonModule é necessário agora.
import { CommonModule } from '@angular/common';
// As importações de rota foram removidas pois não são usadas no template.
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // 2. O array de imports agora está mais limpo.
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  isSidebarCollapsed: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser: User | null = this.authService.getCurrentUser();
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
