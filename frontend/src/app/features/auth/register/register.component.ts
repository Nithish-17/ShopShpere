import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { UserRegistrationRequest } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, FormErrorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page-container">
      <app-card [padding]="'lg'" class="auth-card">
        <div class="auth-header">
          <div class="auth-brand-badge">S</div>
          <h2 class="auth-title">Create an Account</h2>
          <p class="auth-subtitle">Join ShopSphere to explore tech essentials</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                class="form-control"
                [class.is-invalid]="firstNameControl?.invalid && (firstNameControl?.dirty || firstNameControl?.touched)"
                formControlName="firstName"
                placeholder="e.g. Alex"
              />
              <app-form-error [control]="firstNameControl" fieldName="First Name"></app-form-error>
            </div>

            <div class="form-group">
              <label class="form-label" for="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                class="form-control"
                [class.is-invalid]="lastNameControl?.invalid && (lastNameControl?.dirty || lastNameControl?.touched)"
                formControlName="lastName"
                placeholder="e.g. Morgan"
              />
              <app-form-error [control]="lastNameControl" fieldName="Last Name"></app-form-error>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              id="email"
              type="email"
              class="form-control"
              [class.is-invalid]="emailControl?.invalid && (emailControl?.dirty || emailControl?.touched)"
              formControlName="email"
              placeholder="e.g. alex.morgan@example.com"
              autocomplete="email"
            />
            <app-form-error [control]="emailControl" fieldName="Email Address"></app-form-error>
          </div>

          <div class="form-group">
            <label class="form-label" for="phone">Phone Number (10 Digits)</label>
            <input
              id="phone"
              type="tel"
              class="form-control"
              [class.is-invalid]="phoneControl?.invalid && (phoneControl?.dirty || phoneControl?.touched)"
              formControlName="phone"
              placeholder="e.g. 9876543210"
              maxlength="10"
            />
            <app-form-error [control]="phoneControl" fieldName="Phone Number"></app-form-error>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password (Min 8 characters)</label>
            <input
              id="password"
              type="password"
              class="form-control"
              [class.is-invalid]="passwordControl?.invalid && (passwordControl?.dirty || passwordControl?.touched)"
              formControlName="password"
              placeholder="Create a strong password"
              autocomplete="new-password"
            />
            <app-form-error [control]="passwordControl" fieldName="Password"></app-form-error>
          </div>

          <div class="auth-action-row">
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [disabled]="registerForm.invalid || loading()"
              [loading]="loading()"
              class="w-full"
            >
              Create Account
            </app-button>
          </div>
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/login" class="auth-link">Sign In</a>
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
      max-width: 480px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
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

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
    }
  `]
})
export default class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal<boolean>(false);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
  });

  get firstNameControl() { return this.registerForm.get('firstName'); }
  get lastNameControl() { return this.registerForm.get('lastName'); }
  get emailControl() { return this.registerForm.get('email'); }
  get phoneControl() { return this.registerForm.get('phone'); }
  get passwordControl() { return this.registerForm.get('password'); }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.registerForm.value as UserRegistrationRequest;

    this.authService.register(formValue).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
