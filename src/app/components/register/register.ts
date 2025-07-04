import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
// Importa as ferramentas para formulários reativos
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, // Para usar *ngIf, *ngFor, etc.
    ReactiveFormsModule, // Essencial para [formGroup] e formControlName
    RouterLink, // Para o link de "Já tem uma conta?"
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  providers: [AuthService],
})
export class RegisterComponent implements OnInit {
  // A propriedade que vai controlar todo o nosso formulário
  registerForm!: FormGroup;

  // Injeta o FormBuilder para criar o formulário, o AuthService para registrar
  // e o Router para redirecionar o usuário.
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  // ngOnInit é o lugar perfeito para inicializar o formulário
  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        nome: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        usuario: ['', [Validators.required]],
        senha: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            // Regex que valida: 1 minúscula, 1 maiúscula, 1 número, 1 caractere especial
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[&#64;$!%*?&])[A-Za-z\d&#64;$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmarSenha: ['', [Validators.required]],
      },
      {
        // Adiciona um validador ao grupo inteiro para comparar as senhas
        validators: this.senhasCoincidem,
      }
    );
  }

  // Validador customizado para verificar se os campos 'senha' e 'confirmarSenha' são iguais
  senhasCoincidem(group: FormGroup): { [key: string]: any } | null {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;

    if (senha !== confirmarSenha) {
      // Define um erro no campo 'confirmarSenha' se não forem iguais
      group.get('confirmarSenha')?.setErrors({ naoCoincidem: true });
      return { naoCoincidem: true };
    } else {
      // Limpa o erro se as senhas voltarem a ser iguais
      if (group.get('confirmarSenha')?.hasError('naoCoincidem')) {
        group.get('confirmarSenha')?.setErrors(null);
      }
      return null;
    }
  }

  // Função chamada quando o usuário clica no botão "Criar Conta"
  onSubmit(): void {
    // Marca todos os campos como "tocados" para exibir as mensagens de erro
    this.registerForm.markAllAsTouched();

    // Se o formulário for inválido, interrompe a execução
    if (this.registerForm.invalid) {
      console.log('Formulário inválido. Por favor, corrija os erros.');
      return;
    }

    // Se o formulário for válido, prossegue com o registro
    console.log('Formulário válido!', this.registerForm.value);

    // Remove o campo 'confirmarSenha' antes de enviar para o serviço
    const { confirmarSenha, ...userData } = this.registerForm.value;

    const success = this.authService.register(userData);

    if (success) {
      // O alerta de sucesso já está no seu serviço, então apenas redirecionamos
      this.router.navigate(['/login']);
    }
    // Se não for sucesso, o serviço de autenticação já deve ter mostrado um alerta de erro.
  }
}
