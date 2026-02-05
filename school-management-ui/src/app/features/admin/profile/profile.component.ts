import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h2>Manage Profile</h2>
      
      <div class="profile-card">
        <h3>Profile Information</h3>
        <form (ngSubmit)="updateProfile()">
          <div class="form-group">
            <label>Name *</label>
            <input type="text" [(ngModel)]="profileForm.name" name="name" required class="form-control">
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" [(ngModel)]="profileForm.email" name="email" required class="form-control">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" [(ngModel)]="profileForm.phone" name="phone" class="form-control">
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea [(ngModel)]="profileForm.address" name="address" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Update Profile</button>
          </div>
        </form>
      </div>

      <div class="profile-card">
        <h3>Change Password</h3>
        <form (ngSubmit)="changePassword()">
          <div class="form-group">
            <label>New Password *</label>
            <input type="password" [(ngModel)]="passwordForm.newPassword" name="newPassword" required class="form-control">
          </div>
          <div class="form-group">
            <label>Confirm Password *</label>
            <input type="password" [(ngModel)]="passwordForm.confirmPassword" name="confirmPassword" required class="form-control">
          </div>
          <div *ngIf="passwordError" class="alert alert-danger">
            {{ passwordError }}
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Change Password</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem;
    }
    .profile-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #667eea;
      color: white;
    }
    .alert {
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    .alert-danger {
      background: #f8d7da;
      color: #721c24;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: any = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  passwordForm: any = {
    newPassword: '',
    confirmPassword: ''
  };

  passwordError: string = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe(profile => {
      this.profileForm = {
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      };
    });
  }

  updateProfile() {
    this.profileService.updateProfile(this.profileForm).subscribe(() => {
      alert('Profile updated successfully!');
    });
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    this.passwordError = '';
    this.profileService.changePassword({
      newPassword: this.passwordForm.newPassword,
      confirmPassword: this.passwordForm.confirmPassword
    }).subscribe(() => {
      alert('Password changed successfully!');
      this.passwordForm = {
        newPassword: '',
        confirmPassword: ''
      };
    });
  }
}





