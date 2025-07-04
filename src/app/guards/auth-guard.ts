// In: d:/controle-financeiro/src/app/guards/auth-guard.ts

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.spec';

export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService); // Explicitly typed
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
