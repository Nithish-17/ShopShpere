import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  UserRegistrationRequest,
  UserResponse,
  AuthState,
  Role
} from '../models/auth.models';
import { StorageService } from '../services/storage.service';
import { NotificationService } from '../services/notification.service';

const AUTH_TOKEN_KEY = 'shopsphere_token';
const AUTH_USER_KEY = 'shopsphere_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);
  private readonly notification = inject(NotificationService);

  private readonly _state = signal<AuthState>(this.getInitialState());

  readonly state = this._state.asReadonly();
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly token = computed(() => this._state().token);
  readonly email = computed(() => this._state().email);
  readonly role = computed(() => this._state().role);
  readonly isAdmin = computed(() => this._state().role === 'ROLE_ADMIN');

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    // Backend LoginRequest DTO field is 'username'
    const request: LoginRequest = {
      username: credentials.email.trim().toLowerCase(),
      password: credentials.password
    };

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        // Backend returns JWT in response.message
        const token = response.message;
        const email = this.extractEmailFromJwt(token) || request.username;
        const role = this.inferRoleFromEmail(email);

        this.setAuthSession(token, email, role);
        this.notification.success('Signed in successfully.');
      })
    );
  }

  register(data: UserRegistrationRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(() => {
        this.notification.success('Account created successfully! Please sign in with your credentials.');
      })
    );
  }

  logout(redirectUrl = '/login'): void {
    this.storage.removeItem(AUTH_TOKEN_KEY);
    this.storage.removeItem(AUTH_USER_KEY);
    this._state.set({
      token: null,
      email: null,
      role: null,
      isAuthenticated: false
    });
    this.router.navigateByUrl(redirectUrl);
  }

  private setAuthSession(token: string, email: string, role: Role): void {
    this.storage.setItem(AUTH_TOKEN_KEY, token);
    this.storage.setItem(AUTH_USER_KEY, { email, role });

    this._state.set({
      token,
      email,
      role,
      isAuthenticated: true
    });
  }

  private getInitialState(): AuthState {
    const token = this.storage.getItem<string>(AUTH_TOKEN_KEY);
    const userMeta = this.storage.getItem<{ email: string; role: Role }>(AUTH_USER_KEY);

    if (token && !this.isTokenExpired(token)) {
      const email = userMeta?.email || this.extractEmailFromJwt(token) || '';
      const role = userMeta?.role || this.inferRoleFromEmail(email);

      return {
        token,
        email,
        role,
        isAuthenticated: true
      };
    }

    return {
      token: null,
      email: null,
      role: null,
      isAuthenticated: false
    };
  }

  private extractEmailFromJwt(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private inferRoleFromEmail(email: string): Role {
    // In current backend, admin is admin@shopsphere.com
    if (email && email.toLowerCase().includes('admin@shopsphere.com')) {
      return 'ROLE_ADMIN';
    }
    return 'ROLE_CUSTOMER';
  }
}
