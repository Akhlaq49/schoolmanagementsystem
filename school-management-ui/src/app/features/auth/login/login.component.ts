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
        <div class="background-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      
      <div class="login-content">
        <div class="login-card">
          <div class="login-header">
            <div class="logo-container">
              <i class="fa fa-graduation-cap logo-icon"></i>
            </div>
            <h1 class="login-title">Welcome Back</h1>
            <p class="login-subtitle">Sign in to your account to continue</p>
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
      background: var(--primary-gradient);
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
    
    .background-shapes {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      animation: float 20s infinite ease-in-out;
    }
    
    .shape-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }
    
    .shape-2 {
      width: 200px;
      height: 200px;
      bottom: -50px;
      right: -50px;
      animation-delay: 5s;
    }
    
    .shape-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      right: 10%;
      animation-delay: 10s;
    }
    
    @keyframes float {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
      }
      33% {
        transform: translate(30px, -30px) rotate(120deg);
      }
      66% {
        transform: translate(-20px, 20px) rotate(240deg);
      }
    }
    
    .login-content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 450px;
      padding: 2rem;
    }
    
    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      padding: 3rem;
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-2xl);
      border: 1px solid rgba(255, 255, 255, 0.3);
      animation: fadeIn 0.5s ease-out;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: var(--primary-gradient);
      border-radius: var(--radius-xl);
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-lg);
    }
    
    .logo-icon {
      font-size: 2.5rem;
      color: var(--text-inverse);
    }
    
    .login-title {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }
    
    .login-subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }
    
    .login-form {
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .label-icon {
      color: var(--primary);
      font-size: 0.875rem;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-tertiary);
      font-size: 1rem;
      z-index: 1;
    }
    
    .form-control {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 2px solid var(--border-light);
      border-radius: var(--radius-lg);
      font-size: 1rem;
      background: var(--bg-primary);
      color: var(--text-primary);
      transition: all var(--transition-fast);
      font-family: var(--font-sans);
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      transform: translateY(-1px);
    }
    
    .form-control::placeholder {
      color: var(--text-tertiary);
    }
    
    .form-control.is-invalid {
      border-color: var(--accent-error);
    }
    
    .form-control.is-invalid:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .invalid-feedback {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      color: var(--accent-error);
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .invalid-feedback i {
      font-size: 0.875rem;
    }
    
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-lg);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .alert-danger {
      background: rgba(239, 68, 68, 0.1);
      color: var(--accent-error);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    
    .alert-danger i {
      font-size: 1rem;
    }
    
    .btn {
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: var(--radius-lg);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: var(--font-sans);
      position: relative;
      overflow: hidden;
    }
    
    .btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    
    .btn:hover::before {
      width: 300px;
      height: 300px;
    }
    
    .btn-primary {
      background: var(--primary-gradient);
      color: var(--text-inverse);
      box-shadow: var(--shadow-md);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }
    
    .btn-primary:disabled {
      background: var(--gray-400);
      cursor: not-allowed;
      opacity: 0.7;
    }
    
    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }
    
    .btn-content i {
      font-size: 1rem;
    }
    
    .login-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-light);
    }
    
    .footer-text {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--text-tertiary);
      font-size: 0.8125rem;
    }
    
    .footer-text i {
      color: var(--accent-success);
    }
    
    @media (max-width: 768px) {
      .login-content {
        padding: 1rem;
      }
      
      .login-card {
        padding: 2rem 1.5rem;
      }
      
      .login-title {
        font-size: 1.75rem;
      }
      
      .logo-container {
        width: 70px;
        height: 70px;
      }
      
      .logo-icon {
        font-size: 2rem;
      }
    }
    
    @media (max-width: 480px) {
      .login-card {
        padding: 1.5rem 1rem;
      }
      
      .login-title {
        font-size: 1.5rem;
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
