import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model'; // A importação de User vem do modelo

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
      this.userName = currentUser.username.split(' ')[0]; // Apenas troque .nome por .usernamethis.userName = currentUser.username.split(' ')[0]; // Apenas troque .nome por .username
    }
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
