import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // A criação do formulário continua a mesma
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
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[&#64;$!%*?&])[A-Za-z\d&#64;$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmarSenha: ['', [Validators.required]],
      },
      { validators: this.senhasCoincidem }
    );
  }

  senhasCoincidem(group: FormGroup) {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { naoCoincidem: true };
  }

  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      return;
    }

    const { confirmarSenha, senha, ...resto } = this.registerForm.value;
    const userData = {
      ...resto,
      password: senha,
    };
    const success = this.authService.register(userData);

    if (success) {
      // MUDANÇA PRINCIPAL: Navega para a rota de login com um parâmetro de sucesso.
      this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
    }
  }
}
