import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../../features/cart/services/cart.service';
import { NotificationService } from '../services/notification.service';

export const cartNotEmptyGuard: CanActivateFn = () => {
  const cartService = inject(CartService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  if (!cartService.isEmpty()) {
    return true;
  }

  notification.info('Your cart is empty. Add products to continue to checkout.');
  return router.createUrlTree(['/products']);
};
