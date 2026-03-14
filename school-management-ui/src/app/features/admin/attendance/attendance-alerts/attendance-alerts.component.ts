import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';

interface AlertRecord {
  id: number;
  studentId: number;
  studentName: string;
  roll: string;
  className: string;
  section: string;
  percent: number;
  level: 'critical' | 'warning';
  raisedAt: string;
  resolved: boolean;
}

@Component({
  selector: 'app-admin-attendance-alerts',
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
            <h2><i class="fa fa-bell"></i> Low-attendance Alerts</h2>
            <p class="page-subtitle">Manage alerts, send notices, generate letters, mark resolved</p>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card open">
          <span class="val">{{ openCount }}</span>
          <span class="lbl">Open</span>
        </div>
        <div class="stat-card resolved">
          <span class="val">{{ resolvedCount }}</span>
          <span class="lbl">Resolved</span>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Alerts ({{ alerts.length }})</h3>
          <div class="filter-tabs">
            <button type="button" class="tab-btn" [class.active]="filterStatus === 'all'" (click)="filterStatus = 'all'">All</button>
            <button type="button" class="tab-btn" [class.active]="filterStatus === 'open'" (click)="filterStatus = 'open'">Open</button>
            <button type="button" class="tab-btn" [class.active]="filterStatus === 'resolved'" (click)="filterStatus = 'resolved'">Resolved</button>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Class</th>
              <th>Attendance %</th>
              <th>Level</th>
              <th>Raised</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of paginatedAlerts; let i = index" [class.resolved-row]="a.resolved">
              <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td>
                <a [routerLink]="['/admin/attendance/student', a.studentId]" class="student-link">{{ a.studentName }}</a>
                <br><small class="roll">{{ a.roll }}</small>
              </td>
              <td>{{ a.className }} {{ a.section }}</td>
              <td><strong [class.critical]="a.percent < 75" [class.warn]="a.percent >= 75">{{ a.percent }}%</strong></td>
              <td><span class="badge" [class.badge-critical]="a.level === 'critical'" [class.badge-warning]="a.level === 'warning'">{{ a.level }}</span></td>
              <td>{{ a.raisedAt }}</td>
              <td><span class="status" [class.status-open]="!a.resolved" [class.status-resolved]="a.resolved">{{ a.resolved ? 'Resolved' : 'Open' }}</span></td>
              <td>
                <div class="action-btns">
                  <button type="button" class="btn-icon" (click)="sendNotice(a)" [disabled]="a.resolved" title="Send notice to parent">
                    <i class="fa fa-envelope"></i>
                  </button>
                  <button type="button" class="btn-icon" (click)="generateLetter(a)" [disabled]="a.resolved" title="Generate letter">
                    <i class="fa fa-file-text"></i>
                  </button>
                  <button type="button" class="btn-icon btn-resolve" (click)="markResolved(a)" [disabled]="a.resolved" title="Mark resolved">
                    <i class="fa fa-check"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="filteredAlerts.length === 0">
          <i class="fa fa-check-circle"></i>
          <p>No alerts {{ filterStatus === 'all' ? '' : filterStatus }}</p>
        </div>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ filteredAlerts.length }}</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" (click)="goToPrevPage()" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button type="button" class="page-btn" (click)="goToNextPage()" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.35rem;
      color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none;
    }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }

    .stats-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      flex: 1;
      max-width: 150px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .stat-card .val { display: block; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .stat-card.open .val { color: #d97706; }
    .stat-card.resolved .val { color: #059669; }
    .stat-card .lbl { font-size: 0.75rem; color: #6a8cad; }

    .table-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .table-header {
      padding: 1.25rem 1.5rem;
      background: #f7f9fc;
      border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
    }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .filter-tabs { display: flex; gap: 0.5rem; }
    .tab-btn {
      padding: 0.4rem 0.75rem; border: 2px solid #e2e8f0;
      background: #fff; border-radius: 8px;
      font-size: 0.8125rem; font-weight: 500; color: #6a8cad;
      cursor: pointer;
    }
    .tab-btn:hover { border-color: #1e3a5f; color: #1e3a5f; }
    .tab-btn.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }

    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .resolved-row { background: #f8fafc; opacity: 0.9; }
    .student-link { color: #1e3a5f; font-weight: 500; text-decoration: none; }
    .student-link:hover { text-decoration: underline; }
    .roll { font-size: 0.75rem; color: #6a8cad; }
    .critical { color: #dc2626 !important; }
    .warn { color: #d97706 !important; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .badge-critical { background: #fecaca; color: #b91c1c; }
    .badge-warning { background: #fde68a; color: #b45309; }
    .status { font-size: 0.8125rem; font-weight: 500; }
    .status-open { color: #d97706; }
    .status-resolved { color: #059669; }

    .action-btns { display: flex; gap: 0.35rem; }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; padding: 0; border: 2px solid #e2e8f0;
      background: #fff; border-radius: 8px;
      cursor: pointer; color: #1e3a5f; font-size: 0.875rem;
    }
    .btn-icon:hover:not(:disabled) { border-color: #1e3a5f; background: #f7f9fc; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-icon.btn-resolve:hover:not(:disabled) { border-color: #059669; background: #d1fae5; color: #059669; }

    .empty-state { padding: 2rem; text-align: center; color: #6a8cad; }
    .empty-state i { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; color: #059669; }

    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc;
    }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
    .pagination-controls { display: flex; gap: 0.5rem; }
    .page-btn {
      padding: 0.4rem 0.75rem; border: 2px solid #e2e8f0; background: #fff; border-radius: 8px;
      cursor: pointer; font-size: 0.875rem; color: #1e3a5f;
    }
    .page-btn:hover:not(:disabled) { border-color: #1e3a5f; background: #f7f9fc; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AdminAttendanceAlertsComponent implements OnInit {
  alerts: AlertRecord[] = [];
  filterStatus: 'all' | 'open' | 'resolved' = 'all';
  pageSize = 10;
  currentPage = 1;

  get filteredAlerts(): AlertRecord[] {
    if (this.filterStatus === 'open') return this.alerts.filter(a => !a.resolved);
    if (this.filterStatus === 'resolved') return this.alerts.filter(a => a.resolved);
    return this.alerts;
  }

  get openCount(): number {
    return this.alerts.filter(a => !a.resolved).length;
  }

  get resolvedCount(): number {
    return this.alerts.filter(a => a.resolved).length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAlerts.length / this.pageSize) || 1;
  }

  get paginatedAlerts(): AlertRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAlerts.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredAlerts.length);
  }

  constructor(private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadMockData();
  }

  sendNotice(a: AlertRecord): void {
    this.notify.success(`Notice sent to parent of ${a.studentName}`);
  }

  generateLetter(a: AlertRecord): void {
    this.notify.success(`Letter generated for ${a.studentName}`);
  }

  markResolved(a: AlertRecord): void {
    a.resolved = true;
    this.notify.success(`Alert for ${a.studentName} marked as resolved`);
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  private loadMockData(): void {
    this.alerts = [
      { id: 1, studentId: 1, studentName: 'Ali Khan', roll: 'R101', className: 'Grade 10', section: 'A', percent: 55, level: 'critical', raisedAt: 'Mar 10, 2025', resolved: false },
      { id: 2, studentId: 2, studentName: 'Omar Riaz', roll: 'R105', className: 'Grade 10', section: 'A', percent: 73, level: 'critical', raisedAt: 'Mar 11, 2025', resolved: false },
      { id: 3, studentId: 3, studentName: 'Hassan Ali', roll: 'R112', className: 'Grade 9', section: 'B', percent: 77, level: 'warning', raisedAt: 'Mar 12, 2025', resolved: false },
      { id: 4, studentId: 4, studentName: 'Zara Khan', roll: 'R118', className: 'Grade 9', section: 'B', percent: 82, level: 'warning', raisedAt: 'Mar 9, 2025', resolved: true },
      { id: 5, studentId: 5, studentName: 'Ahmad Shah', roll: 'R125', className: 'Grade 8', section: 'A', percent: 68, level: 'critical', raisedAt: 'Mar 8, 2025', resolved: false }
    ];
  }
}
