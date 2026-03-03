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
      <div class="login-bg">
        <div class="bg-blob bg-blob-1"></div>
        <div class="bg-blob bg-blob-2"></div>
        <div class="bg-blob bg-blob-3"></div>
        <div class="bg-blob bg-blob-4"></div>
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
        <div class="bg-circle bg-circle-3"></div>
        <div class="bg-pattern"></div>
        <div class="bg-color-wash"></div>
        <div class="bg-shine"></div>
      </div>
      <div class="login-wrapper">
        <div class="login-left">
          <div class="logo-container">
            <i class="fa fa-graduation-cap logo-icon"></i>
          </div>
          <h1 class="brand-name">EduManage</h1>
          <h2 class="login-title">Welcome Back</h2>
          <p class="login-subtitle">Sign in to your school management account</p>
        </div>
        
        <div class="login-right">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">
                <i class="fa fa-envelope label-icon"></i>
                EMAIL ADDRESS
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
                PASSWORD
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
              class="btn-signin" 
              [disabled]="loginForm.invalid || loading">
              <span *ngIf="loading" class="btn-content">
                <i class="fa fa-spinner fa-spin"></i>
                <span>Signing in...</span>
              </span>
              <span *ngIf="!loading" class="btn-content">Sign In</span>
            </button>
          </form>
        </div>
      </div>
      
      <div class="login-footer">
        <p class="footer-text">Secure login with encrypted credentials</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #fcf4eb 0%, #f5e6d3 25%, #e8d4c4 50%, #ede0d4 75%, #f8efe6 100%);
      position: relative;
    }
    
    .login-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    }
    
    .bg-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.85;
      animation: blobFloat 20s ease-in-out infinite;
    }
    
    .bg-blob-1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(47, 72, 96, 0.4) 0%, rgba(47, 72, 96, 0.2) 40%, transparent 70%);
      top: -120px;
      right: -120px;
      animation-delay: 0s;
    }
    
    .bg-blob-2 {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(229, 193, 94, 0.5) 0%, rgba(229, 193, 94, 0.2) 40%, transparent 70%);
      bottom: -100px;
      left: -100px;
      animation-delay: -5s;
    }
    
    .bg-blob-3 {
      width: 280px;
      height: 280px;
      background: radial-gradient(circle, rgba(47, 72, 96, 0.25) 0%, transparent 70%);
      top: 45%;
      left: 10%;
      animation-delay: -10s;
    }
    
    .bg-blob-4 {
      width: 220px;
      height: 220px;
      background: radial-gradient(circle, rgba(229, 193, 94, 0.35) 0%, transparent 70%);
      top: 15%;
      right: 20%;
      animation-delay: -7s;
    }
    
    @keyframes blobFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -20px) scale(1.05); }
      66% { transform: translate(-20px, 25px) scale(0.95); }
    }
    
    .bg-circle {
      position: absolute;
      border-radius: 50%;
      border: 2px solid rgba(47, 72, 96, 0.12);
      animation: circlePulse 8s ease-in-out infinite;
    }
    
    .bg-circle-1 {
      width: 180px;
      height: 180px;
      top: 12%;
      left: 8%;
      animation-delay: 0s;
    }
    
    .bg-circle-2 {
      width: 120px;
      height: 120px;
      bottom: 25%;
      right: 12%;
      border-color: rgba(229, 193, 94, 0.18);
      animation-delay: -2s;
    }
    
    .bg-circle-3 {
      width: 90px;
      height: 90px;
      top: 70%;
      left: 25%;
      border-color: rgba(47, 72, 96, 0.1);
      animation-delay: -4s;
    }
    
    @keyframes circlePulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }
    
    .bg-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle at 1px 1px, rgba(47, 72, 96, 0.12) 2px, transparent 0);
      background-size: 40px 40px;
    }
    
    .bg-shine {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 100%);
      pointer-events: none;
    }
    
    .bg-color-wash {
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(120deg, rgba(47, 72, 96, 0.08) 0%, transparent 50%),
        linear-gradient(300deg, rgba(229, 193, 94, 0.12) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .login-wrapper {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 4rem;
      max-width: 900px;
      width: 100%;
    }
    
    .login-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background-color: #2f4860;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }
    
    .logo-icon {
      font-size: 2.5rem;
      color: #e5c15e;
    }
    
    .brand-name {
      margin: 0 0 0.25rem 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #404040;
    }
    
    .login-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #404040;
    }
    
    .login-subtitle {
      margin: 0;
      font-size: 0.9375rem;
      color: #707070;
    }
    
    .login-right {
      flex: 1;
      max-width: 380px;
    }
    
    .login-form {
      width: 100%;
    }
    
    .form-group {
      margin-bottom: 1.25rem;
    }
    
    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 0.75rem;
      color: #404040;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .label-icon {
      color: #404040;
      font-size: 0.875rem;
      opacity: 0.85;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-icon {
      position: absolute;
      left: 1rem;
      color: #a0a0a0;
      font-size: 1rem;
      z-index: 1;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border: 1px solid #dbd1c9;
      border-radius: 10px;
      font-size: 0.9375rem;
      background: #fcf4eb;
      color: #404040;
      transition: border-color 0.2s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #2f4860;
    }
    
    .form-control::placeholder {
      color: #a0a0a0;
    }
    
    .form-control.is-invalid {
      border-color: #dc2626;
    }
    
    .invalid-feedback {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      color: #dc2626;
      font-size: 0.8125rem;
    }
    
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      background: rgba(220, 38, 38, 0.08);
      color: #b91c1c;
    }
    
    .alert-danger i {
      font-size: 1rem;
    }
    
    .btn-signin {
      width: 100%;
      padding: 0.875rem 1.25rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      background-color: #afafaf;
      color: #ffffff;
      transition: background-color 0.2s;
    }
    
    .btn-signin:hover:not(:disabled) {
      background-color: #9a9a9a;
    }
    
    .btn-signin:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .login-footer {
      position: absolute;
      bottom: 1.5rem;
      left: 0;
      right: 0;
      text-align: center;
      z-index: 1;
    }
    
    .footer-text {
      margin: 0;
      font-size: 0.8125rem;
      color: #707070;
    }
    
    @media (max-width: 768px) {
      .login-wrapper {
        flex-direction: column;
        gap: 2rem;
      }
      
      .login-right {
        max-width: 100%;
      }
      
      .brand-name { font-size: 1.5rem; }
      .login-title { font-size: 1.5rem; }
      
      .logo-container {
        width: 70px;
        height: 70px;
      }
      
      .logo-icon {
        font-size: 2rem;
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
