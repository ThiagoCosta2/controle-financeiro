// ARQUIVO: src/app/components/settings/settings.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    // Formulário para dados do perfil
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: [{ value: '', disabled: true }, Validators.required], // Email não pode ser alterado
    });

    // Formulário para mudança de senha
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );

    this.currentUser = null;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      // Preenche o formulário de perfil com os dados do usuário atual
      this.profileForm.patchValue({
        nome: this.currentUser.nome,
        email: this.currentUser.email,
      });
    }
  }

  // Validador customizado para checar se as senhas coincidem
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      this.notificationService.show(
        'Por favor, preencha os campos corretamente.',
        'error'
      );
      return;
    }

    if (this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        nome: this.profileForm.value.nome,
      };

      const success = this.authService.updateUser(updatedUser);
      if (success) {
        this.notificationService.show(
          'Perfil atualizado com sucesso!',
          'success'
        );
      } else {
        this.notificationService.show(
          'Ocorreu um erro ao atualizar o perfil.',
          'error'
        );
      }
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.notificationService.show(
        'Por favor, verifique os campos do formulário de senha.',
        'error'
      );
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;
    const success = this.authService.changePassword(
      currentPassword,
      newPassword
    );

    if (success) {
      this.notificationService.show('Senha alterada com sucesso!', 'success');
      this.passwordForm.reset();
    } else {
      this.notificationService.show('A senha atual está incorreta.', 'error');
    }
  }
}
