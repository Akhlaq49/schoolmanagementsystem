import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FamilyService } from '../../../../core/services/family/family.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Family } from '../../../../core/models/family.model';

@Component({
  selector: 'app-family-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="family-page-container">
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-users"></i> Add New Family</h2>
            <p class="page-subtitle">Enter family details for father, mother and contact information</p>
          </div>
          <a routerLink="/admin/family/list" class="btn-back">
            <i class="fa fa-arrow-left"></i> Back to Family List
          </a>
        </div>
      </div>

      <div class="academy-form-card">
        <h3><i class="fa fa-user-plus"></i> Family Details</h3>
        <form (ngSubmit)="saveFamily()">
          <div class="form-section">
            <h4 class="section-label"><i class="fa fa-male"></i> Father Information</h4>
            <div class="academy-form-row">
              <div class="academy-form-group">
                <label>Father Name <span class="required">*</span></label>
                <input
                  type="text"
                  class="academy-input"
                  [(ngModel)]="familyForm.fatherName"
                  name="fatherName"
                  placeholder="e.g., Ahmad Khan"
                  [class.is-invalid]="submitted && !familyForm.fatherName"
                />
                <div *ngIf="submitted && !familyForm.fatherName" class="academy-invalid">Father name is required</div>
              </div>
              <div class="academy-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  class="academy-input"
                  [(ngModel)]="familyForm.fatherPhone"
                  name="fatherPhone"
                  placeholder="e.g., 03XX-XXXXXXX"
                />
              </div>
              <div class="academy-form-group">
                <label>CNIC</label>
                <input
                  type="text"
                  class="academy-input"
                  [(ngModel)]="familyForm.fatherCnic"
                  name="fatherCnic"
                  placeholder="e.g., 35201-XXXXXXX-X"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-label"><i class="fa fa-female"></i> Mother Information</h4>
            <div class="academy-form-row">
              <div class="academy-form-group">
                <label>Mother Name</label>
                <input
                  type="text"
                  class="academy-input"
                  [(ngModel)]="familyForm.motherName"
                  name="motherName"
                  placeholder="e.g., Fatima Khan"
                />
              </div>
              <div class="academy-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  class="academy-input"
                  [(ngModel)]="familyForm.motherPhone"
                  name="motherPhone"
                  placeholder="e.g., 03XX-XXXXXXX"
                />
              </div>
              <div class="academy-form-group">
                <label>CNIC</label>
                <input
                  type="text"
                  class="academy-input"
                  [(ngModel)]="familyForm.motherCnic"
                  name="motherCnic"
                  placeholder="e.g., 35201-XXXXXXX-X"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-label"><i class="fa fa-phone"></i> Contact</h4>
            <div class="academy-form-row">
              <div class="academy-form-group sms-field">
                <label>SMS Number (Contact Number) <span class="required">*</span></label>
                <input
                  type="text"
                  class="academy-input"
                  [(ngModel)]="familyForm.smsNumber"
                  name="smsNumber"
                  placeholder="Primary contact for SMS notifications"
                  [class.is-invalid]="submitted && !familyForm.smsNumber"
                />
                <div *ngIf="submitted && !familyForm.smsNumber" class="academy-invalid">SMS number is required</div>
              </div>
            </div>
          </div>

          <div class="academy-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa fa-spinner fa-spin" *ngIf="saving"></i>
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving"><i class="fa fa-save"></i> Save Family</span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="saving">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .family-page-container { padding: 0; }
    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; display: flex; align-items: center; gap: 0.75rem; }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0.25rem 0 0 0; font-size: 0.9375rem; color: #6a8cad; padding-left: 2.1rem; }
    .btn-back {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 10px;
      font-size: 0.9375rem; font-weight: 600; color: #1e3a5f; background: transparent;
      border: 2px solid #1e3a5f; text-decoration: none; cursor: pointer; transition: all 0.2s;
    }
    .btn-back:hover { background: rgba(30,58,95,0.08); }
    .academy-form-card {
      background: #fff; border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-form-card h3 { margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 700; color: #0f2744; display: flex; align-items: center; gap: 0.5rem; }
    .academy-form-card h3 i { color: #1e3a5f; }
    .form-section { margin-bottom: 2rem; padding: 1.5rem; background: #fafbfc; border-radius: 12px; border: 1px solid #eef2f7; }
    .form-section:last-of-type { margin-bottom: 0; }
    .section-label { margin: 0 0 1rem 0; font-size: 0.9375rem; font-weight: 600; color: #1e3a5f; display: flex; align-items: center; gap: 0.5rem; }
    .section-label i { color: #6a8cad; font-size: 0.875rem; }
    .academy-form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 0; }
    .academy-form-row:last-child { margin-bottom: 0; }
    .academy-form-group { display: flex; flex-direction: column; }
    .academy-form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #1e3a5f; }
    .academy-form-group .required { color: #dc2626; }
    .academy-input {
      padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .academy-input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .academy-input.is-invalid { border-color: #dc2626; }
    .academy-invalid { margin-top: 0.5rem; font-size: 0.8125rem; color: #dc2626; font-weight: 500; }
    .academy-form-group.sms-field { grid-column: 1 / -1; }
    .academy-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eef2f7; }
    .btn {
      padding: 0.65rem 1.25rem; border: none; border-radius: 0.75rem; cursor: pointer; font-size: 0.9375rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; box-shadow: 0 4px 14px rgba(30,58,95,0.35); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
    .btn-secondary { background: #6b7280; color: #fff; }
    .btn-secondary:hover:not(:disabled) { background: #4b5563; }
    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: flex-start; }
      .page-header-card, .academy-form-card { padding: 1.25rem; }
    }
  `]
})
export class FamilyAddComponent {
  familyForm: Family = {
    fatherName: '',
    fatherPhone: '',
    fatherCnic: '',
    motherName: '',
    motherPhone: '',
    motherCnic: '',
    smsNumber: ''
  };

  submitted = false;
  saving = false;

  constructor(
    private familyService: FamilyService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  saveFamily() {
    this.submitted = true;

    if (!this.familyForm.fatherName || !this.familyForm.smsNumber) {
      this.notificationService.warning('Father Name and SMS Number are required');
      return;
    }

    this.saving = true;
    this.familyService.createFamily(this.familyForm).subscribe({
      next: () => {
        this.notificationService.success('Family created successfully');
        this.saving = false;
        this.router.navigate(['/admin/family/list']);
      },
      error: (error) => {
        const message = error?.error?.message || 'Failed to create family';
        this.notificationService.error(message);
        this.saving = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/family/list']);
  }
}

