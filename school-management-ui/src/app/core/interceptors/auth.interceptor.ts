import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone the request and add the authorization header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    // Log when token is missing for debugging
    console.warn('AuthInterceptor: No token found in localStorage for request to:', req.url);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.error('AuthInterceptor: Received 401 Unauthorized for:', req.url);
        
        // Only clear and redirect if we're not already on the login page
        if (!req.url.includes('/api/auth/login')) {
          // Clear stored authentication data
          localStorage.removeItem('token');
          localStorage.removeItem('loginType');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          localStorage.removeItem('userRoles');
          
          // Redirect to login page
          router.navigate(['/login']);
        }
      }
      
      return throwError(() => error);
    })
  );
};

