// ARQUIVO: src/app/components/login/login.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit {
  email = '';
  senha = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['registered'] === 'true') {
        this.successMessage =
          'Conta criada com sucesso! Por favor, faça o login.';
      }
    });
  }

  onSubmit(): void {
    if (!this.email || !this.senha) {
      this.notificationService.show(
        'Por favor, preencha todos os campos.',
        'error'
      );
      return;
    }

    const success = this.authService.login({
      email: this.email,
      pass: this.senha,
    });

    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }
}
