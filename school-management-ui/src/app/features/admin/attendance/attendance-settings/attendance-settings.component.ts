import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';

interface SettingRecord {
  id: number;
  key: string;
  label: string;
  value: string;
  unit?: string;
}

@Component({
  selector: 'app-admin-attendance-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Dashboard
            </a>
            <h2><i class="fa fa-cog"></i> Attendance Settings</h2>
            <p class="page-subtitle">Configure attendance rules, thresholds, and defaults</p>
          </div>
          <button type="button" class="btn btn-primary" (click)="saveAll()" [disabled]="saving">
            <i class="fa fa-save"></i> Save All
          </button>
        </div>
      </div>

      <div class="form-card">
        <h3><i class="fa fa-clock-o"></i> Time Settings</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Expected check-in (students)</label>
            <input type="time" class="form-control" [(ngModel)]="expectedCheckIn" />
          </div>
          <div class="form-group">
            <label>Expected check-out (students)</label>
            <input type="time" class="form-control" [(ngModel)]="expectedCheckOut" />
          </div>
          <div class="form-group">
            <label>Staff check-in (expected)</label>
            <input type="time" class="form-control" [(ngModel)]="staffCheckIn" />
          </div>
          <div class="form-group">
            <label>Late grace period (min)</label>
            <input type="number" class="form-control" [(ngModel)]="lateGraceMins" min="0" />
          </div>
        </div>
      </div>

      <div class="form-card">
        <h3><i class="fa fa-exclamation-triangle"></i> Thresholds</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Low-attendance threshold (%)</label>
            <input type="number" class="form-control" [(ngModel)]="lowAttendanceThreshold" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Auto-lock attendance after (days)</label>
            <input type="number" class="form-control" [(ngModel)]="autoLockDays" min="0" />
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Settings ({{ settings.length }})</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Setting</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of settings; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ s.label }}</td>
              <td>
                <input type="text" class="form-control inline" [(ngModel)]="s.value" [placeholder]="s.unit || ''">
                <span class="unit" *ngIf="s.unit">{{ s.unit }}</span>
              </td>
              <td>
                <button type="button" class="btn-icon" (click)="saveSingle(s)" title="Save">
                  <i class="fa fa-check"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing 1 to {{ settings.length }} of {{ settings.length }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.35rem;
      color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none;
    }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }

    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1.25rem; border: none; border-radius: 10px;
      font-size: 0.9375rem; font-weight: 600; cursor: pointer;
    }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .form-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .form-card h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #0f2744; }
    .form-card h3 i { color: #1e3a5f; margin-right: 0.5rem; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .form-group label { display: block; font-size: 0.8125rem; margin-bottom: 0.35rem; color: #6a8cad; font-weight: 500; }
    .form-control {
      padding: 0.5rem 0.75rem;
      border: 2px solid #d9e2ec;
      border-radius: 8px;
      font-size: 0.9375rem;
      width: 100%;
    }
    .form-control.inline { width: auto; min-width: 120px; display: inline-block; margin-right: 0.5rem; }

    .table-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .table-header { padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0; }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .unit { font-size: 0.8125rem; color: #6a8cad; }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; padding: 0; border: 2px solid #e2e8f0;
      background: #fff; border-radius: 8px; cursor: pointer; color: #1e3a5f;
    }
    .btn-icon:hover { border-color: #1e3a5f; background: #f7f9fc; }

    .pagination-bar { padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; background: #fafbfc; }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
  `]
})
export class AdminAttendanceSettingsComponent implements OnInit {
  expectedCheckIn = '08:15';
  expectedCheckOut = '14:00';
  staffCheckIn = '08:15';
  lateGraceMins = 15;
  lowAttendanceThreshold = 85;
  autoLockDays = 7;
  saving = false;
  settings: SettingRecord[] = [];
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.settings.length / this.pageSize) || 1;
  }

  constructor(private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadMockData();
  }

  saveAll(): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.notify.success('All settings saved');
    }, 500);
  }

  saveSingle(s: SettingRecord): void {
    this.notify.success(`Saved: ${s.label}`);
  }

  private loadMockData(): void {
    this.settings = [
      { id: 1, key: 'default_status', label: 'Default status for new day', value: '0', unit: '(0=Not marked)' },
      { id: 2, key: 'mark_holiday_absent', label: 'Mark holiday as absent', value: 'false', unit: '' },
      { id: 3, key: 'alert_reminder_time', label: 'Daily reminder time', value: '09:00', unit: '' },
      { id: 4, key: 'max_leave_days_per_month', label: 'Max leave days per month', value: '5', unit: 'days' },
      { id: 5, key: 'require_remarks_on_absent', label: 'Require remarks when absent', value: 'false', unit: '' }
    ];
  }
}
