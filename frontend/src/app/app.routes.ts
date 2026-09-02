import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from './layout/storefront/customer-layout.component';
import { AdminLayoutComponent } from './layout/admin/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { cartNotEmptyGuard } from './core/guards/cart-not-empty.guard';

export const routes: Routes = [
  // Storefront Experience Routes
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component')
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list/product-list.component')
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-detail/product-detail.component')
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () => import('./features/cart/cart-page/cart-page.component')
      },
      {
        path: 'checkout',
        canActivate: [authGuard, cartNotEmptyGuard],
        loadComponent: () => import('./features/checkout/checkout-page/checkout-page.component')
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () => import('./features/orders/order-list/order-list.component')
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./features/orders/order-detail/order-detail.component')
      },
      {
        path: 'payments',
        canActivate: [authGuard],
        loadComponent: () => import('./features/payments/payment-list/payment-list.component')
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
      },
      {
        path: '403',
        loadComponent: () => import('./features/errors/forbidden/forbidden.component')
      }
    ]
  },

  // Admin Console Operations Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component')
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/admin-product-list.component')
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/admin-category-list.component')
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/admin/inventory/admin-inventory-list.component')
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/admin-order-list.component')
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/admin/payments/admin-payment-list.component')
      }
    ]
  },

  // 404 Catch-All Route
  {
    path: '**',
    loadComponent: () => import('./features/errors/not-found/not-found.component')
  }
];
