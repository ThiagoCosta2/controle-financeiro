import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // **PASSO 1: Garanta que 'ChangeDetectorRef' está importado aqui**
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class SettingsComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;
  profileSuccessMessage: string = '';
  passwordSuccessMessage: string = '';
  profileErrorMessage: string = '';
  passwordErrorMessage: string = '';

  isCurrentPasswordVisible: boolean = false;
  isNewPasswordVisible: boolean = false;
  isConfirmNewPasswordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cd: ChangeDetectorRef // **PASSO 2: Garanta que 'private cd: ChangeDetectorRef' está no construtor**
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initForms();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      nome: [this.currentUser?.nome || '', Validators.required],
      email: [
        this.currentUser?.email || '',
        [Validators.required, Validators.email],
      ],
      usuario: [this.currentUser?.usuario || ''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[&#64;$!%*?&])[A-Za-z\d&#64;$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmNewPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword
      ? null
      : { passwordsMismatch: true };
  }

  onUpdateProfile(): void {
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';

    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      this.profileErrorMessage =
        'Por favor, corrija os erros no formulário de perfil.';
      return;
    }

    if (this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        nome: this.profileForm.value.nome,
        email: this.profileForm.value.email,
        usuario: this.profileForm.value.usuario,
      };

      const users = this.authService['getUsersFromStorage']();
      const userIndex = users.findIndex(
        (u) => u.usuario === this.currentUser!.usuario
      );

      if (userIndex > -1) {
        users[userIndex] = updatedUser;
        this.authService['saveUsersToStorage'](users);
        localStorage.setItem(
          this.authService['LOGGED_IN_USER_KEY'],
          JSON.stringify(updatedUser)
        );
        this.currentUser = updatedUser;
        this.profileSuccessMessage = 'Perfil atualizado com sucesso!';
        console.log(
          'Mensagem de sucesso definida:',
          this.profileSuccessMessage
        );

        // ... (código existente)

        setTimeout(() => {
          this.profileSuccessMessage = ''; // Alterado para '' para garantir que o *ngIf funcione e evitar erro de tipo
          this.cd.detectChanges(); // Força a detecção de mudanças
          console.log(
            'Mensagem de sucesso limpa e detecção de mudanças forçada.'
          );
        }, 1000); // 1 segundo

        // ... (restante do código) // 1 segundo
      } else {
        this.profileErrorMessage = 'Erro ao atualizar perfil.';
      }
    }
  }

  onUpdatePassword(): void {
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) {
      this.passwordErrorMessage =
        'Por favor, corrija os erros no formulário de senha.';
      return;
    }

    const currentPassword = this.passwordForm.value.currentPassword;
    const newPassword = this.passwordForm.value.newPassword;

    if (this.currentUser && this.currentUser.senha === currentPassword) {
      const updatedUser: User = {
        ...this.currentUser,
        senha: newPassword,
      };

      const users = this.authService['getUsersFromStorage']();
      const userIndex = users.findIndex(
        (u) => u.usuario === this.currentUser!.usuario
      );

      if (userIndex > -1) {
        users[userIndex] = updatedUser;
        this.authService['saveUsersToStorage'](users);
        localStorage.setItem(
          this.authService['LOGGED_IN_USER_KEY'],
          JSON.stringify(updatedUser)
        );
        this.currentUser = updatedUser;
        this.passwordSuccessMessage = 'Senha alterada com sucesso!';
        this.passwordForm.reset();
      } else {
        this.passwordErrorMessage = 'Erro ao alterar senha.';
      }
    } else {
      this.passwordErrorMessage = 'Senha atual incorreta.';
    }
  }

  togglePasswordVisibility(
    field: 'currentPassword' | 'newPassword' | 'confirmNewPassword'
  ): void {
    const input = document.getElementById(field) as HTMLInputElement;
    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        if (field === 'currentPassword') {
          this.isCurrentPasswordVisible = true;
        } else if (field === 'newPassword') {
          this.isNewPasswordVisible = true;
        } else if (field === 'confirmNewPassword') {
          this.isConfirmNewPasswordVisible = true;
        }
      } else {
        input.type = 'password';
        if (field === 'currentPassword') {
          this.isCurrentPasswordVisible = false;
        } else if (field === 'newPassword') {
          this.isNewPasswordVisible = false;
        } else if (field === 'confirmNewPassword') {
          this.isConfirmNewPasswordVisible = false;
        }
      }
    }
  }
}
