import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 1. IMPORTADO AQUI
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // 2. ADICIONADO AQUI
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  providers: [AuthService], // <-- Adicionado para injeção de dependência
})
export class LoginComponent {
  // 3. PROPRIEDADES DECLARADAS
  usuario = '';
  senha = '';

  constructor(private authService: AuthService, private router: Router) {}

  // 4. MÉTODO ONSUBMIT DECLARADO
  onSubmit() {
    if (!this.usuario || !this.senha) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const success = this.authService.login({
      usuario: this.usuario,
      senha: this.senha,
    });

    if (!success) {
      // O alerta de "usuário ou senha inválidos" já está no seu serviço
      this.senha = ''; // Limpa o campo de senha em caso de falha
    }
  }
}
