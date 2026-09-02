import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../features/cart/services/cart.service';
import { CategoryService } from '../../features/products/services/category.service';
import { CategoryResponse } from '../../core/models';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    CartDrawerComponent,
    ToastComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="storefront-wrapper">
      <!-- Top Announcement Banner -->
      <div class="top-banner">
        <div class="container banner-content">
          <span>✨ WELCOME TO SHOPSPHERE </span>  
          @if (authService.isAdmin()) {
            <a routerLink="/admin" class="admin-quick-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Go to Admin Console &rarr;
            </a>
          }
        </div>
      </div>

      <!-- Main Navigation Header -->
      <header class="site-header">
        <div class="container header-inner">
          <!-- Logo & Brand -->
          <a routerLink="/" class="brand-logo">
            <span class="logo-icon">S</span>
            <span class="logo-text">ShopSphere</span>
          </a>

          <!-- Search Bar -->
          <form class="search-form" (ngSubmit)="onSearch()">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                class="search-input"
                name="searchQuery"
                placeholder="Search products, brands, tech..."
                [(ngModel)]="searchQuery"
              />
              @if (searchQuery) {
                <button type="button" class="btn-clear-search" (click)="searchQuery = ''">
                  &times;
                </button>
              }
            </div>
          </form>

          <!-- Navigation Links -->
          <nav class="nav-links" [class.mobile-open]="isMobileMenuOpen()">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
            <a routerLink="/products" routerLinkActive="active">Catalog</a>

            <div class="category-dropdown-wrapper">
              <button type="button" class="category-btn" (click)="toggleCategoryMenu()">
                <span>Categories</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>

              @if (isCategoryMenuOpen()) {
                <div class="category-dropdown-menu" (mouseleave)="isCategoryMenuOpen.set(false)">
                  @for (cat of categories(); track cat.id) {
                    <a
                      [routerLink]="['/products']"
                      [queryParams]="{ categoryId: cat.id }"
                      class="category-dropdown-item"
                      (click)="isCategoryMenuOpen.set(false); isMobileMenuOpen.set(false)"
                    >
                      {{ cat.name }}
                    </a>
                  }
                </div>
              }
            </div>

            @if (authService.isAuthenticated()) {
              <a routerLink="/orders" routerLinkActive="active">My Orders</a>
            }
          </nav>

          <!-- User & Cart Actions -->
          <div class="header-actions">
            <!-- Cart Button with Dynamic Badge -->
            <button
              type="button"
              class="action-btn cart-action-btn"
              (click)="cartService.toggleDrawer(true)"
              aria-label="View shopping cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span class="action-label">Cart</span>
              @if (cartService.totalItems() > 0) {
                <span class="cart-badge">{{ cartService.totalItems() }}</span>
              }
            </button>

            <!-- User Auth Profile Menu -->
            @if (authService.isAuthenticated()) {
              <div class="user-menu-wrapper">
                <button type="button" class="action-btn user-btn" (click)="toggleUserMenu()">
                  <div class="user-avatar">{{ authService.email()?.charAt(0)?.toUpperCase() || 'U' }}</div>
                  <span class="user-email-text">{{ authService.email() }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                @if (isUserMenuOpen()) {
                  <div class="user-dropdown-menu" (mouseleave)="isUserMenuOpen.set(false)">
                    <div class="dropdown-header">
                      <div class="user-name-title">Signed in as</div>
                      <div class="user-email-title">{{ authService.email() }}</div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a routerLink="/orders" class="dropdown-item" (click)="isUserMenuOpen.set(false)">
                      My Orders
                    </a>
                    <a routerLink="/payments" class="dropdown-item" (click)="isUserMenuOpen.set(false)">
                      Payment Receipts
                    </a>
                    @if (authService.isAdmin()) {
                      <div class="dropdown-divider"></div>
                      <a routerLink="/admin" class="dropdown-item admin-item" (click)="isUserMenuOpen.set(false)">
                        Admin Console
                      </a>
                    }
                    <div class="dropdown-divider"></div>
                    <button type="button" class="dropdown-item btn-logout" (click)="logout()">
                      Sign Out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <div class="auth-buttons">
                <a routerLink="/login" class="btn-login-link">Sign In</a>
                <a routerLink="/register" class="btn-register-link">Register</a>
              </div>
            }

            <!-- Mobile Menu Toggle -->
            <button
              type="button"
              class="mobile-toggle-btn"
              (click)="isMobileMenuOpen.update(v => !v)"
              aria-label="Toggle navigation menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Outlet -->
      <main class="site-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Global Storefront Footer -->
      <footer class="site-footer">
        <div class="container footer-inner">
          <div class="footer-col brand-col">
            <div class="brand-logo footer-logo">
              <span class="logo-icon">S</span>
              <span class="logo-text">ShopSphere</span>
            </div>
            <p class="footer-tagline">
              Curated minimal e-commerce platform
            </p>
          </div>

          <div class="footer-col">
            <h4 class="footer-heading">Catalog</h4>
            <ul class="footer-list">
              <li><a routerLink="/products">All Products</a></li>
              @for (cat of categories().slice(0, 4); track cat.id) {
                <li><a [routerLink]="['/products']" [queryParams]="{ categoryId: cat.id }">{{ cat.name }}</a></li>
              }
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-heading">Account</h4>
            <ul class="footer-list">
              @if (authService.isAuthenticated()) {
                <li><a routerLink="/orders">My Orders</a></li>
                <li><a routerLink="/payments">Payment History</a></li>
                <li><a routerLink="/cart">Shopping Cart</a></li>
              } @else {
                <li><a routerLink="/login">Sign In</a></li>
                <li><a routerLink="/register">Create Account</a></li>
              }
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-heading">System</h4>
            <div class="system-status">
              <span class="status-indicator"></span>
              <span>Backend API :8000</span>
            </div>
            <p class="system-meta">
              Simulated Payment Gateway (80% Success Rate)

            </p>
          </div>
        </div>

        <div class="container footer-bottom">
          <p>&copy; 2026 ShopSphere E-Commerce. All rights reserved.</p>
        </div>
      </footer>

      <!-- Embedded Slide-over Cart & Toasts -->
      <app-cart-drawer></app-cart-drawer>
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .storefront-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top-banner {
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      font-size: 0.8125rem;
      padding: var(--space-2) 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .banner-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .admin-quick-link {
      color: #93c5fd;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .admin-quick-link:hover {
      color: #ffffff;
      text-decoration: underline;
    }

    .site-header {
      background-color: var(--color-bg-surface);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
      height: var(--header-height);
      display: flex;
      align-items: center;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-6);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      flex-shrink: 0;
    }

    .logo-icon {
      width: 2rem;
      height: 2rem;
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
    }

    .logo-text {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-text-primary);
      letter-spacing: -0.03em;
    }

    .search-form {
      flex: 1;
      max-width: 420px;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.875rem;
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 2rem 0.5rem 2.5rem;
      font-size: 0.875rem;
      background-color: var(--color-bg-muted);
      border: 1px solid transparent;
      border-radius: var(--radius-full);
      outline: none;
      transition: all var(--transition-fast);
    }

    .search-input:focus {
      background-color: var(--color-bg-surface);
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .btn-clear-search {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: 1.125rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-6);
    }

    .nav-links a {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      transition: color var(--transition-fast);
    }

    .nav-links a:hover,
    .nav-links a.active {
      color: var(--color-text-primary);
    }

    .category-dropdown-wrapper {
      position: relative;
    }

    .category-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: none;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-family: inherit;
    }

    .category-btn:hover {
      color: var(--color-text-primary);
    }

    .category-dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 0.5rem;
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      min-width: 200px;
      padding: var(--space-2);
      z-index: 200;
      animation: fadeIn 0.15s ease-out;
    }

    .category-dropdown-item {
      display: block;
      padding: 0.5rem 0.875rem;
      font-size: 0.875rem;
      color: var(--color-text-primary);
      border-radius: var(--radius-md);
    }

    .category-dropdown-item:hover {
      background-color: var(--color-bg-muted);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-primary);
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      transition: background-color var(--transition-fast);
      position: relative;
    }

    .action-btn:hover {
      background-color: var(--color-bg-muted);
    }

    .cart-badge {
      background-color: var(--color-accent);
      color: var(--color-text-inverse);
      font-size: 0.6875rem;
      font-weight: 800;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-full);
      min-width: 1.25rem;
      text-align: center;
    }

    .user-menu-wrapper {
      position: relative;
    }

    .user-avatar {
      width: 1.75rem;
      height: 1.75rem;
      background-color: var(--color-bg-muted);
      border: 1px solid var(--color-border);
      color: var(--color-brand);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .user-email-text {
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-dropdown-menu {
      position: absolute;
      right: 0;
      top: 100%;
      margin-top: 0.5rem;
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      min-width: 220px;
      padding: var(--space-2);
      z-index: 200;
      animation: fadeIn 0.15s ease-out;
    }

    .dropdown-header {
      padding: 0.5rem 0.875rem;
    }

    .user-name-title {
      font-size: 0.6875rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--color-text-muted);
    }

    .user-email-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: 0.25rem 0;
    }

    .dropdown-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.5rem 0.875rem;
      font-size: 0.875rem;
      color: var(--color-text-primary);
      border-radius: var(--radius-md);
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
    }

    .dropdown-item:hover {
      background-color: var(--color-bg-muted);
    }

    .dropdown-item.admin-item {
      color: var(--color-accent);
      font-weight: 600;
    }

    .dropdown-item.btn-logout {
      color: var(--color-danger);
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .btn-login-link {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      padding: 0.5rem 0.875rem;
      border-radius: var(--radius-md);
    }

    .btn-login-link:hover {
      color: var(--color-text-primary);
      background-color: var(--color-bg-muted);
    }

    .btn-register-link {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-inverse);
      background-color: var(--color-brand);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xs);
    }

    .btn-register-link:hover {
      background-color: var(--color-brand-light);
    }

    .mobile-toggle-btn {
      display: none;
      background: none;
      border: none;
      color: var(--color-text-primary);
      cursor: pointer;
      padding: var(--space-1);
    }

    .site-main {
      flex: 1;
    }

    /* Footer */
    .site-footer {
      background-color: var(--color-bg-surface);
      border-top: 1px solid var(--color-border);
      margin-top: var(--space-16);
      padding-top: var(--space-12);
      padding-bottom: var(--space-8);
    }

    .footer-inner {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: var(--space-8);
      margin-bottom: var(--space-10);
    }

    .footer-logo {
      margin-bottom: var(--space-3);
    }

    .footer-tagline {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
      max-width: 320px;
    }

    .footer-heading {
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-primary);
      margin-bottom: var(--space-4);
    }

    .footer-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .footer-list a {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .footer-list a:hover {
      color: var(--color-text-primary);
    }

    .system-status {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      background-color: var(--color-success);
      border-radius: 50%;
      box-shadow: 0 0 0 2px var(--color-success-bg);
    }

    .system-meta {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    .footer-bottom {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-6);
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      text-align: center;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .footer-inner {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .search-form { display: none; }
      .mobile-toggle-btn { display: block; }
      .user-email-text { display: none; }

      .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--color-bg-surface);
        border-bottom: 1px solid var(--color-border);
        flex-direction: column;
        align-items: flex-start;
        padding: var(--space-4);
        box-shadow: var(--shadow-lg);
      }

      .nav-links.mobile-open {
        display: flex;
      }

      .footer-inner {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CustomerLayoutComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  searchQuery = '';
  categories = signal<CategoryResponse[]>([]);
  isCategoryMenuOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: () => {}
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { keyword: this.searchQuery.trim() }
      });
    }
  }

  toggleCategoryMenu(): void {
    this.isCategoryMenuOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout('/');
  }
}
