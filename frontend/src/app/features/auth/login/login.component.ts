import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, FormErrorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page-container">
      <app-card [padding]="'lg'" class="auth-card">
        <div class="auth-header">
          <div class="auth-brand-badge">S</div>
          <h2 class="auth-title">Welcome Back</h2>
          <p class="auth-subtitle">Sign in to your ShopSphere account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              id="email"
              type="email"
              class="form-control"
              [class.is-invalid]="emailControl?.invalid && (emailControl?.dirty || emailControl?.touched)"
              formControlName="email"
              placeholder="e.g. customer@example.com"
              autocomplete="email"
            />
            <app-form-error [control]="emailControl" fieldName="Email Address"></app-form-error>
          </div>

          <div class="form-group">
            <div class="password-label-wrapper">
              <label class="form-label" for="password">Password</label>
            </div>
            <div class="password-input-wrapper">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="form-control"
                [class.is-invalid]="passwordControl?.invalid && (passwordControl?.dirty || passwordControl?.touched)"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="btn-toggle-pwd"
                (click)="showPassword.update(v => !v)"
                aria-label="Toggle password visibility"
              >
                @if (showPassword()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                }
              </button>
            </div>
            <app-form-error [control]="passwordControl" fieldName="Password"></app-form-error>
          </div>

          <div class="auth-action-row">
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [disabled]="loginForm.invalid || loading()"
              [loading]="loading()"
              class="w-full"
            >
              Sign In
            </app-button>
          </div>
        </form>

        <div class="auth-demo-hint">
          <strong>Default Admin Demo Account:</strong><br />
          <code>admin&#64;shopsphere.com</code> / <code>admin123</code>
        </div>

        <div class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/register" class="auth-link">Create Account</a>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .auth-page-container {
      min-height: calc(100vh - var(--header-height) - 150px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) var(--space-4);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .auth-brand-badge {
      width: 2.75rem;
      height: 2.75rem;
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-3);
    }

    .auth-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .auth-subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
    }

    .password-label-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-wrapper input {
      padding-right: 2.5rem;
    }

    .btn-toggle-pwd {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-1);
    }

    .btn-toggle-pwd:hover {
      color: var(--color-text-primary);
    }

    .auth-action-row {
      margin-top: var(--space-4);
    }

    .w-full {
      width: 100%;
      display: block;
    }

    .w-full button {
      width: 100%;
    }

    .auth-demo-hint {
      margin-top: var(--space-6);
      padding: var(--space-3);
      background-color: var(--color-bg-muted);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-align: center;
      line-height: 1.5;
    }

    .auth-demo-hint code {
      font-weight: 600;
      color: var(--color-brand);
    }

    .auth-footer {
      margin-top: var(--space-6);
      text-align: center;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      display: flex;
      justify-content: center;
      gap: var(--space-1);
    }

    .auth-link {
      font-weight: 700;
      color: var(--color-accent);
    }

    .auth-link:hover {
      text-decoration: underline;
    }
  `]
})
export default class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
