import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';
import { ErrorResponse } from '../models/common.models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notification = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error) {
        if (typeof error.error === 'string') {
          try {
            const parsed = JSON.parse(error.error) as ErrorResponse;
            errorMessage = parsed.message || errorMessage;
          } catch {
            errorMessage = error.error;
          }
        } else if (typeof error.error === 'object') {
          // Check if Map<String, String> from validation error handler
          if (!error.error.message && Object.keys(error.error).length > 0) {
            const fieldErrors = Object.values(error.error) as string[];
            errorMessage = fieldErrors.join(', ');
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }
      }

      switch (error.status) {
        case 401:
          // Unauthenticated or token expired
          if (!req.url.includes('/api/auth/login')) {
            notification.error('Session expired. Please sign in again.');
            authService.logout(router.url);
          } else {
            notification.error('Invalid email or password.');
          }
          break;

        case 403:
          notification.error('You do not have permission to perform this action.');
          router.navigateByUrl('/403');
          break;

        case 404:
          // Individual component handlers can intercept if needed, otherwise inform user
          if (!req.url.includes('/images/')) {
            notification.error(errorMessage || 'Resource not found.');
          }
          break;

        case 400:
        case 409:
          notification.error(errorMessage);
          break;

        case 500:
        case 502:
        case 503:
          notification.error('Server error encountered. Please check if backend is running.');
          break;

        case 0:
          notification.error('Unable to reach backend server. Please ensure Spring Boot backend is active on port 8000.');
          break;

        default:
          notification.error(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
