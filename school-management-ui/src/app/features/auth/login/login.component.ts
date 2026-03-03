import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-background">
        <div class="background-pattern"></div>
        <div class="background-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
      </div>
      
      <div class="login-content">
        <div class="login-card">
          <div class="login-header">
            <div class="logo-container">
              <i class="fa fa-graduation-cap logo-icon"></i>
            </div>
            <h1 class="brand-name">EduManage</h1>
            <h2 class="login-title">Welcome Back</h2>
            <p class="login-subtitle">Sign in to your school management account</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">
                <i class="fa fa-envelope label-icon"></i>
                Email Address
              </label>
              <div class="input-wrapper">
                <i class="fa fa-envelope input-icon"></i>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email" 
                  class="form-control"
                  placeholder="Enter your email"
                  [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              </div>
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">
                <i class="fa fa-lock label-icon"></i>
                Password
              </label>
              <div class="input-wrapper">
                <i class="fa fa-lock input-icon"></i>
                <input 
                  type="password" 
                  id="password" 
                  formControlName="password" 
                  class="form-control"
                  placeholder="Enter your password"
                  [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              </div>
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="invalid-feedback">
                <i class="fa fa-exclamation-circle"></i>
                Password is required
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger">
              <i class="fa fa-exclamation-triangle"></i>
              {{ errorMessage }}
            </div>

            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="loginForm.invalid || loading">
              <span *ngIf="loading" class="btn-content">
                <i class="fa fa-spinner fa-spin"></i>
                <span>Signing in...</span>
              </span>
              <span *ngIf="!loading" class="btn-content">
                <i class="fa fa-sign-in-alt"></i>
                <span>Sign In</span>
              </span>
            </button>
          </form>
          
          <div class="login-footer">
            <p class="footer-text">
              <i class="fa fa-shield-alt"></i>
              Secure login with encrypted credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #2b6cb0 100%);
    }
    
    .login-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      z-index: 0;
    }
    
    .background-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle at 20% 80%, rgba(212, 168, 75, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.06) 0%, transparent 40%);
      pointer-events: none;
    }
    
    .background-shapes {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(8px);
      animation: float 25s infinite ease-in-out;
    }
    
    .shape-1 {
      width: 320px;
      height: 320px;
      top: -120px;
      left: -80px;
      animation-delay: 0s;
    }
    
    .shape-2 {
      width: 180px;
      height: 180px;
      bottom: 10%;
      right: 5%;
      animation-delay: 4s;
    }
    
    .shape-3 {
      width: 120px;
      height: 120px;
      top: 40%;
      right: 15%;
      animation-delay: 8s;
    }
    
    .shape-4 {
      width: 200px;
      height: 200px;
      bottom: -60px;
      right: 25%;
      background: rgba(212, 168, 75, 0.08);
      animation-delay: 2s;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(25px, -25px) scale(1.02); }
      66% { transform: translate(-15px, 15px) scale(0.98); }
    }
    
    .login-content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: 2rem;
    }
    
    .login-card {
      background: #ffffff;
      padding: 2.75rem 2.5rem;
      border-radius: 1.25rem;
      box-shadow: 0 25px 80px rgba(15, 39, 68, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
      animation: cardFadeIn 0.5s ease-out;
    }
    
    @keyframes cardFadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2.25rem;
    }
    
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      border-radius: 1rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 8px 24px rgba(30, 58, 95, 0.35);
    }
    
    .logo-icon {
      font-size: 2.25rem;
      color: #d4a84b;
    }
    
    .brand-name {
      margin: 0 0 0.25rem 0;
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e3a5f;
      letter-spacing: -0.02em;
    }
    
    .login-title {
      margin: 0 0 0.35rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f2744;
      letter-spacing: -0.02em;
    }
    
    .login-subtitle {
      margin: 0;
      color: #6a8cad;
      font-size: 0.9375rem;
      font-weight: 500;
    }
    
    .login-form {
      margin-bottom: 1.75rem;
    }
    
    .form-group {
      margin-bottom: 1.375rem;
    }
    
    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 0.8125rem;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    
    .label-icon {
      color: #1e3a5f;
      font-size: 0.875rem;
      opacity: 0.8;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-icon {
      position: absolute;
      left: 1rem;
      color: #6a8cad;
      font-size: 1rem;
      z-index: 1;
      transition: color 0.2s;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border: 2px solid #d9e2ec;
      border-radius: 0.75rem;
      font-size: 0.9375rem;
      font-weight: 500;
      background: #fff;
      color: #0f2744;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #1e3a5f;
      box-shadow: 0 0 0 4px rgba(30, 58, 95, 0.12);
    }
    
    .input-wrapper:focus-within .input-icon {
      color: #1e3a5f;
    }
    
    .form-control::placeholder {
      color: #8aa8c4;
    }
    
    .form-control.is-invalid {
      border-color: #dc2626;
      background: rgba(220, 38, 38, 0.02);
    }
    
    .form-control.is-invalid:focus {
      box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
    }
    
    .invalid-feedback {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      color: #dc2626;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    
    .invalid-feedback i {
      font-size: 0.875rem;
    }
    
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 0.75rem;
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .alert-danger {
      background: rgba(220, 38, 38, 0.08);
      color: #b91c1c;
      border: 1px solid rgba(220, 38, 38, 0.2);
    }
    
    .alert-danger i {
      font-size: 1rem;
      flex-shrink: 0;
    }
    
    .btn {
      width: 100%;
      padding: 0.875rem 1.25rem;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: #fff;
      box-shadow: 0 4px 14px rgba(30, 58, 95, 0.35);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(30, 58, 95, 0.4);
      background: linear-gradient(135deg, #0f2744 0%, #1e3a5f 100%);
    }
    
    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }
    
    .btn-primary:disabled {
      background: #b5c9da;
      cursor: not-allowed;
      opacity: 0.85;
      box-shadow: none;
    }
    
    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .btn-content i {
      font-size: 1rem;
    }
    
    .login-footer {
      text-align: center;
      padding-top: 1.25rem;
      border-top: 1px solid #eef2f7;
    }
    
    .footer-text {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #6a8cad;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    
    .footer-text i {
      color: #059669;
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .login-content {
        padding: 1.25rem;
      }
      
      .login-card {
        padding: 2.25rem 1.75rem;
      }
      
      .brand-name {
        font-size: 1.5rem;
      }
      
      .login-title {
        font-size: 1.375rem;
      }
      
      .logo-container {
        width: 64px;
        height: 64px;
      }
      
      .logo-icon {
        font-size: 2rem;
      }
    }
    
    @media (max-width: 480px) {
      .login-card {
        padding: 1.75rem 1.25rem;
      }
      
      .brand-name {
        font-size: 1.375rem;
      }
      
      .login-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.notificationService.success('Login successful!');
          const roles = response.roles || this.authService.getUserRoles();
          
          // If user has multiple roles, show role selection
          if (roles && roles.length > 1) {
            // Store roles temporarily and navigate to role selection
            // For now, use the primary role (first role)
            const primaryRole = response.loginType || roles[0];
            this.router.navigate([`/${primaryRole}/dashboard`]);
          } else {
            // Single role, navigate directly
            const loginType = response.loginType || roles[0];
            this.router.navigate([`/${loginType}/dashboard`]);
          }
        },
        error: (error) => {
          this.loading = false;
          const errorMsg = error.error?.message || 'Invalid email or password';
          this.errorMessage = errorMsg;
          this.notificationService.error(errorMsg);
        }
      });
    }
  }
}
