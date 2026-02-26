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
      <div class="family-card">
        <h3 class="family-title">NEW FAMILY DETAILS</h3>

        <form (ngSubmit)="saveFamily()">
          <div class="family-row">
            <div class="family-field">
              <label>Father Name</label>
              <input
                type="text"
                class="family-input"
                [(ngModel)]="familyForm.fatherName"
                name="fatherName"
                [class.is-invalid]="submitted && !familyForm.fatherName"
              />
            </div>
            <div class="family-field">
              <label>Phone Number</label>
              <input
                type="text"
                class="family-input"
                [(ngModel)]="familyForm.fatherPhone"
                name="fatherPhone"
              />
            </div>
            <div class="family-field">
              <label>CNIC</label>
              <input
                type="text"
                class="family-input"
                [(ngModel)]="familyForm.fatherCnic"
                name="fatherCnic"
              />
            </div>
          </div>

          <div class="family-row">
            <div class="family-field">
              <label>Mother Name</label>
              <input
                type="text"
                class="family-input"
                [(ngModel)]="familyForm.motherName"
                name="motherName"
              />
            </div>
            <div class="family-field">
              <label>Phone Number</label>
              <input
                type="text"
                class="family-input"
                [(ngModel)]="familyForm.motherPhone"
                name="motherPhone"
              />
            </div>
            <div class="family-field">
              <label>CNIC</label>
              <input
                type="text"
                class="family-input"
                [(ngModel)]="familyForm.motherCnic"
                name="motherCnic"
              />
            </div>
          </div>

          <div class="family-row">
            <div class="family-field sms-field">
              <label>SMS Number (Contact Number)</label>
              <input
                type="text"
                class="family-input"
                [(ngModel)]="familyForm.smsNumber"
                name="smsNumber"
                [class.is-invalid]="submitted && !familyForm.smsNumber"
              />
            </div>
          </div>

          <div class="family-actions">
            <button type="submit" class="btn-save" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button type="button" class="btn-cancel" (click)="onCancel()" [disabled]="saving">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .family-page-container {
      padding: 2rem;
      background-color: #f3e2c2;
      min-height: calc(100vh - 120px);
    }

    .family-card {
      background-color: #fdf1dc;
      border-radius: 4px;
      padding: 1.5rem 2rem 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    .family-title {
      margin: 0 0 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .family-row {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .family-field {
      flex: 1;
      min-width: 200px;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sms-field {
      flex-basis: 100%;
    }

    label {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .family-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border-radius: 3px;
      border: 1px solid #d2b892;
      background-color: #fffdf8;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .family-input:focus {
      border-color: #a37b46;
      box-shadow: 0 0 0 2px rgba(163, 123, 70, 0.25);
    }

    .family-input.is-invalid {
      border-color: #dc3545;
    }

    .family-actions {
      margin-top: 1.5rem;
      display: flex;
      gap: 0.75rem;
    }

    .btn-save,
    .btn-cancel {
      min-width: 80px;
      padding: 0.45rem 1.25rem;
      border-radius: 3px;
      border: none;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .btn-save {
      background-color: #28a745;
      color: #ffffff;
    }

    .btn-save:disabled {
      opacity: 0.7;
      cursor: default;
    }

    .btn-cancel {
      background-color: #6c757d;
      color: #ffffff;
    }

    @media (max-width: 768px) {
      .family-page-container {
        padding: 1rem;
      }

      .family-card {
        padding: 1rem 1.25rem 1.5rem;
      }
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

