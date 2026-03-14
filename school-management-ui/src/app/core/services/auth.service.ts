import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('loginType', response.loginType);
          localStorage.setItem('userId', response.userId.toString());
          localStorage.setItem('userName', response.name);
          
          // Extract roles from token or use response roles
          const roles = response.roles || this.getRolesFromToken(response.token);
          if (roles && roles.length > 0) {
            localStorage.setItem('userRoles', JSON.stringify(roles));
          }
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('loginType');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRoles');
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getLoginType(): string | null {
    return localStorage.getItem('loginType');
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get all roles for the current user
   */
  getUserRoles(): string[] {
    const rolesJson = localStorage.getItem('userRoles');
    if (rolesJson) {
      try {
        return JSON.parse(rolesJson);
      } catch {
        // Fallback: try to get from token
        const token = this.getToken();
        if (token) {
          return this.getRolesFromToken(token);
        }
      }
    }
    // Fallback: try to get from token
    const token = this.getToken();
    if (token) {
      return this.getRolesFromToken(token);
    }
    return [];
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role.toLowerCase());
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role.toLowerCase()));
  }

  /**
   * Decode JWT token to extract roles
   */
  private getRolesFromToken(token: string): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check for roles claim (comma-separated string)
      if (payload.roles) {
        return payload.roles.split(',').map((r: string) => r.trim().toLowerCase());
      }
      // Check for role claims (array)
      if (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
        const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        return Array.isArray(roleClaim) ? roleClaim.map((r: string) => r.toLowerCase()) : [roleClaim.toLowerCase()];
      }
      // Fallback to login_type
      if (payload.login_type) {
        return [payload.login_type.toLowerCase()];
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return [];
  }
}

