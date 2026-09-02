import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  if (authService.isAuthenticated()) {
    return true;
  }

  notification.info('Please sign in to access this page.');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
