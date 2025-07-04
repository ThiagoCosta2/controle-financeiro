import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 1. IMPORTADO AQUI
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // 2. ADICIONADO AQUI
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  // 3. PROPRIEDADES DECLARADAS
  nome = '';
  usuario = '';
  senha = '';
  confirmarSenha = '';

  constructor(private authService: AuthService, private router: Router) {}

  // 4. MÉTODO ONSUBMIT DECLARADO
  onSubmit() {
    if (!this.nome || !this.usuario || !this.senha) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    const success = this.authService.register({
      nome: this.nome,
      usuario: this.usuario,
      senha: this.senha,
    });

    if (success) {
      // O alerta de sucesso já está no seu serviço
      this.router.navigate(['/login']); // Redireciona para o login
    }
  }
}
