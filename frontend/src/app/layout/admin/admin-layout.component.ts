import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-wrapper">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar" [class.sidebar-open]="isSidebarOpen()">
        <div class="sidebar-header">
          <a routerLink="/" class="admin-brand">
            <span class="brand-badge">ADMIN</span>
            <span class="brand-title">ShopSphere</span>
          </a>
          <button type="button" class="btn-close-sidebar" (click)="isSidebarOpen.set(false)" aria-label="Close sidebar">
            &times;
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-label">Core Modules</div>
          <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="isSidebarOpen.set(false)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" (click)="isSidebarOpen.set(false)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span>Products</span>
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" (click)="isSidebarOpen.set(false)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <span>Categories</span>
          </a>
          <a routerLink="/admin/inventory" routerLinkActive="active" (click)="isSidebarOpen.set(false)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <span>Inventory</span>
          </a>

          <div class="nav-section-label">Operations</div>
          <a routerLink="/admin/orders" routerLinkActive="active" (click)="isSidebarOpen.set(false)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Orders</span>
          </a>
          <a routerLink="/admin/payments" routerLinkActive="active" (click)="isSidebarOpen.set(false)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            <span>Payments</span>
          </a>

          <div class="nav-section-label">Shortcuts</div>
          <a routerLink="/" class="storefront-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Storefront &rarr;</span>
          </a>
        </nav>
      </aside>

      <!-- Main Admin Area -->
      <div class="admin-main">
        <!-- Admin Topbar -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <button
              type="button"
              class="btn-toggle-sidebar"
              (click)="isSidebarOpen.update(v => !v)"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h2 class="topbar-title">Operations Console</h2>
          </div>

          <div class="topbar-right">
            <div class="admin-user-pill">
              <span class="user-role-dot"></span>
              <span class="admin-email">{{ authService.email() }}</span>
            </div>
            <button type="button" class="btn-admin-logout" (click)="logout()">
              Sign Out
            </button>
          </div>
        </header>

        <!-- Admin Content Outlet -->
        <div class="admin-content-area">
          <router-outlet></router-outlet>
        </div>
      </div>

      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: var(--color-bg-body);
    }

    .admin-sidebar {
      width: 260px;
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 120;
      transition: transform var(--transition-normal);
    }

    .sidebar-header {
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .admin-brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      color: var(--color-text-inverse);
    }

    .brand-badge {
      background-color: var(--color-accent);
      color: var(--color-text-inverse);
      font-size: 0.625rem;
      font-weight: 800;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
    }

    .brand-title {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .btn-close-sidebar {
      display: none;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .sidebar-nav {
      padding: var(--space-4) var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      overflow-y: auto;
    }

    .nav-section-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
      padding: var(--space-3) var(--space-3) var(--space-1);
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 0.625rem var(--space-3);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      color: #94a3b8;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .sidebar-nav a:hover {
      color: var(--color-text-inverse);
      background-color: rgba(255, 255, 255, 0.05);
    }

    .sidebar-nav a.active {
      color: var(--color-text-inverse);
      background-color: var(--color-accent);
    }

    .storefront-link {
      margin-top: var(--space-2);
      color: #60a5fa !important;
    }

    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-topbar {
      height: var(--header-height);
      background-color: var(--color-bg-surface);
      border-bottom: 1px solid var(--color-border);
      padding: 0 var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .btn-toggle-sidebar {
      display: none;
      background: none;
      border: none;
      color: var(--color-text-primary);
      cursor: pointer;
      padding: var(--space-1);
    }

    .topbar-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .admin-user-pill {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.375rem 0.75rem;
      background-color: var(--color-bg-muted);
      border-radius: var(--radius-full);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .user-role-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-success);
    }

    .btn-admin-logout {
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-danger);
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-admin-logout:hover {
      background-color: var(--color-danger-bg);
      border-color: var(--color-danger-border);
    }

    .admin-content-area {
      padding: var(--space-6);
      flex: 1;
    }

    @media (max-width: 900px) {
      .admin-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
      }

      .admin-sidebar.sidebar-open {
        transform: translateX(0);
        box-shadow: var(--shadow-xl);
      }

      .btn-close-sidebar {
        display: block;
      }

      .btn-toggle-sidebar {
        display: block;
      }
    }
  `]
})
export class AdminLayoutComponent {
  readonly authService = inject(AuthService);
  isSidebarOpen = signal<boolean>(false);

  logout(): void {
    this.authService.logout('/');
  }
}
