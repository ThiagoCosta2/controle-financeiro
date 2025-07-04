import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Este é um Guardião de Rota funcional, a forma moderna de proteger rotas no Angular.
 */
export const authGuard: CanActivateFn = (route, state) => {
  // Pega uma instância do nosso AuthService e do Router.
  const authService = inject(AuthService);
  const router = inject(Router);

  // Pergunta ao serviço: "O usuário está autenticado?"
  if (authService.isAuthenticated()) {
    return true; // SIM. Permite o acesso à rota.
  }

  // NÃO. Redireciona o usuário para a página de login.
  router.navigate(['/login']);
  return false; // Bloqueia o acesso à rota que ele tentou entrar.
};
