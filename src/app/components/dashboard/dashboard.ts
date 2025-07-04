import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  isSidebarCollapsed: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

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
