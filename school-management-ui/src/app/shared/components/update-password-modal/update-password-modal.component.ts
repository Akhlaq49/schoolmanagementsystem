import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-update-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="show" class="modal-overlay" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-icon">
            <i class="fa fa-lock"></i>
          </div>
          <h3>Update Password</h3>
          <p class="header-sub">Enter your current password and choose a new one</p>
          <button type="button" class="modal-close" (click)="close()" aria-label="Close">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <form (ngSubmit)="submit()" class="modal-body">
          <div class="form-group">
            <label for="currentPassword">
              <i class="fa fa-key"></i> Current Password <span class="required">*</span>
            </label>
            <input
              type="password"
              id="currentPassword"
              [(ngModel)]="form.currentPassword"
              name="currentPassword"
              placeholder="Enter current password"
              class="form-input"
              required
              [disabled]="loading"
              autocomplete="current-password">
          </div>
          <div class="form-group">
            <label for="newPassword">
              <i class="fa fa-shield"></i> New Password
            </label>
            <input
              type="password"
              id="newPassword"
              [(ngModel)]="form.newPassword"
              name="newPassword"
              placeholder="Enter new password (min 6 characters)"
              class="form-input"
              required
              minlength="6"
              [disabled]="loading"
              autocomplete="new-password">
          </div>
          <div class="form-group">
            <label for="confirmPassword">
              <i class="fa fa-check-circle"></i> Confirm New Password <span class="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="form.confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              class="form-input"
              required
              [disabled]="loading"
              autocomplete="new-password">
          </div>
          <p *ngIf="errorMessage" class="error-msg">
            <i class="fa fa-exclamation-circle"></i> {{ errorMessage }}
          </p>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" (click)="close()" [disabled]="loading">
              Cancel
            </button>
            <button type="submit" class="btn-submit" [disabled]="loading">
              <i *ngIf="loading" class="fa fa-spinner fa-spin"></i>
              <i *ngIf="!loading" class="fa fa-check"></i>
              {{ loading ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 39, 68, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal-card {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 24px 48px rgba(15, 39, 68, 0.18), 0 8px 24px rgba(15, 39, 68, 0.08);
      width: 100%;
      max-width: 440px;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .modal-header {
      padding: 2rem 2rem 1.25rem;
      text-align: center;
      position: relative;
    }
    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      color: #fff;
      font-size: 1.5rem;
    }
    .modal-header h3 {
      margin: 0 0 0.35rem;
      font-size: 1.375rem;
      font-weight: 700;
      color: #0f2744;
    }
    .header-sub {
      margin: 0;
      font-size: 0.9375rem;
      color: #6a8cad;
    }
    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 36px;
      height: 36px;
      border: none;
      background: #f1f5f9;
      border-radius: 10px;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .modal-close:hover {
      background: #e2e8f0;
      color: #0f2744;
    }
    .modal-body {
      padding: 0 2rem 2rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .form-group label i {
      color: #6a8cad;
      font-size: 0.875rem;
    }
    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.9375rem;
      color: #0f2744;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus {
      outline: none;
      border-color: #1e3a5f;
      box-shadow: 0 0 0 4px rgba(30, 58, 95, 0.1);
    }
    .form-input:disabled {
      background: #f8fafc;
      color: #94a3b8;
      cursor: not-allowed;
    }
    .form-input::placeholder {
      color: #94a3b8;
    }
    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1rem;
      padding: 0.75rem 1rem;
      background: #fef2f2;
      border-radius: 10px;
      font-size: 0.875rem;
      color: #dc2626;
    }
    .error-msg i {
      flex-shrink: 0;
    }
    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
    .btn-cancel,
    .btn-submit {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
    }
    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
    }
    .btn-cancel:hover:not(:disabled) {
      background: #e2e8f0;
      color: #0f2744;
    }
    .btn-submit {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: #fff;
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(30, 58, 95, 0.35);
    }
    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class UpdatePasswordModalComponent {
  @Input() show = false;
  @Input() loading = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<ChangePasswordForm>();

  form: ChangePasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  errorMessage = '';

  close(): void {
    this.errorMessage = '';
    this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.closeModal.emit();
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.form.currentPassword?.trim()) {
      this.errorMessage = 'Current password is required';
      return;
    }
    if (!this.form.newPassword?.trim()) {
      this.errorMessage = 'New password is required';
      return;
    }
    if (this.form.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters';
      return;
    }
    if (!this.form.confirmPassword?.trim()) {
      this.errorMessage = 'Confirm password is required';
      return;
    }
    if (this.form.newPassword !== this.form.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match';
      return;
    }
    this.submitForm.emit({ ...this.form });
  }

  setError(message: string): void {
    this.errorMessage = message;
  }
}
