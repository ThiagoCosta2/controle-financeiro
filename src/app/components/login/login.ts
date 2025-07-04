import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Precisamos do ActivatedRoute para ler os parâmetros da URL
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
// FormsModule é necessário para o [(ngModel)]
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit {
  // Propriedades para conectar com os inputs do formulário
  usuario = '';
  senha = '';

  // Propriedade para guardar a mensagem de sucesso
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // Injeta o ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verifica se a URL tem o parâmetro 'registered=true'
    this.route.queryParams.subscribe((params) => {
      if (params['registered'] === 'true') {
        this.successMessage =
          'Conta criada com sucesso! Por favor, faça o login.';
      }
    });
  }

  onSubmit(): void {
    if (!this.usuario || !this.senha) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const success = this.authService.login({
      usuario: this.usuario,
      senha: this.senha,
    });

    if (success) {
      // Se o login for bem-sucedido, navega para o dashboard
      this.router.navigate(['/dashboard']);
    }
    // Se não for sucesso, o serviço já mostra um alerta de erro.
  }
}
