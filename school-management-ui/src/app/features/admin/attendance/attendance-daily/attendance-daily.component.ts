import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';

interface ClassBreakdown {
  classId: number;
  className: string;
  section: string;
  total: number;
  present: number;
  absent: number;
  notMarked: number;
  percent: number;
  status: 'complete' | 'partial' | 'pending';
}

interface NotMarkedItem {
  id: number;
  className: string;
  section: string;
  teacher?: string;
  type: 'class' | 'staff';
}

@Component({
  selector: 'app-admin-attendance-daily',
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
            <h2><i class="fa fa-bar-chart"></i> Daily Summary</h2>
            <p class="page-subtitle">Attendance stats and class-wise breakdown for the day</p>
          </div>
          <div class="header-actions">
            <div class="filter-group">
              <label>Date</label>
              <input type="date" class="form-control" [(ngModel)]="selectedDate" (ngModelChange)="loadData()">
            </div>
            <button type="button" class="btn btn-secondary" (click)="refresh()" [disabled]="loading">
              <i class="fa fa-refresh" [class.fa-spin]="loading"></i> Refresh
            </button>
            <button type="button" class="btn btn-warning" (click)="sendReminder()" [disabled]="notMarkedList.length === 0">
              <i class="fa fa-bell"></i> Send Reminder
            </button>
            <button type="button" class="btn btn-primary" (click)="exportData()">
              <i class="fa fa-download"></i> Export
            </button>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card total">
          <span class="stat-val">{{ stats.total }}</span>
          <span class="stat-lbl">Total</span>
        </div>
        <div class="stat-card present">
          <span class="stat-val">{{ stats.present }}</span>
          <span class="stat-lbl">Present</span>
        </div>
        <div class="stat-card absent">
          <span class="stat-val">{{ stats.absent }}</span>
          <span class="stat-lbl">Absent</span>
        </div>
        <div class="stat-card not-marked">
          <span class="stat-val">{{ stats.notMarked }}</span>
          <span class="stat-lbl">Not Marked</span>
        </div>
        <div class="stat-card percent">
          <span class="stat-val">{{ stats.percent }}%</span>
          <span class="stat-lbl">Attendance %</span>
        </div>
      </div>

      <div class="not-marked-card" *ngIf="notMarkedList.length > 0">
        <h3><i class="fa fa-exclamation-triangle"></i> Not Marked ({{ notMarkedList.length }})</h3>
        <p class="not-marked-desc">The following classes/staff have not submitted attendance for {{ selectedDate }}</p>
        <div class="not-marked-grid">
          <div *ngFor="let n of paginatedNotMarked" class="not-marked-item">
            <span class="badge" [class.badge-class]="n.type === 'class'" [class.badge-staff]="n.type === 'staff'">{{ n.type }}</span>
            <span class="item-name">{{ n.className }}{{ n.section ? ' - ' + n.section : '' }}</span>
            <span class="item-teacher" *ngIf="n.teacher">{{ n.teacher }}</span>
          </div>
        </div>
        <div class="pagination-bar small" *ngIf="notMarkedPages > 1">
          <span class="pagination-info">Showing {{ (notMarkedPage - 1) * 5 + 1 }} to {{ notMarkedEndIndex }} of {{ notMarkedList.length }}</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" (click)="notMarkedPrevPage()" [disabled]="notMarkedPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button type="button" class="page-btn" (click)="notMarkedNextPage()" [disabled]="notMarkedPage === notMarkedPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3><i class="fa fa-table"></i> Class-wise Breakdown ({{ classBreakdown.length }})</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Class</th>
              <th>Section</th>
              <th>Total</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Not Marked</th>
              <th>%</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of paginatedBreakdown; let i = index">
              <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td>{{ c.className }}</td>
              <td>{{ c.section }}</td>
              <td>{{ c.total }}</td>
              <td class="col-present">{{ c.present }}</td>
              <td class="col-absent">{{ c.absent }}</td>
              <td class="col-not-marked">{{ c.notMarked }}</td>
              <td><strong>{{ c.percent }}%</strong></td>
              <td>
                <span class="status-badge" [ngClass]="'status-' + c.status">
                  {{ c.status === 'complete' ? 'Complete' : c.status === 'partial' ? 'Partial' : 'Pending' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ classBreakdown.length }}</span>
          <div class="pagination-controls">
            <button type="button" class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button type="button" class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.35rem;
      color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none;
    }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .header-actions { display: flex; align-items: flex-end; gap: 0.75rem; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 0.75rem; color: #6a8cad; margin-bottom: 0.25rem; }
    .form-control { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; font-size: 0.9375rem; min-width: 140px; }

    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1rem; border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
    }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; }
    .btn-secondary { background: #e2e8f0; color: #374151; }
    .btn-warning { background: #f59e0b; color: #fff; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .stat-card .stat-val { display: block; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .stat-card .stat-lbl { font-size: 0.75rem; color: #6a8cad; }
    .stat-card.present .stat-val { color: #059669; }
    .stat-card.absent .stat-val { color: #dc2626; }
    .stat-card.not-marked .stat-val { color: #f59e0b; }
    .stat-card.percent .stat-val { color: #2563eb; }

    .not-marked-card {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
    }
    .not-marked-card h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #92400e; }
    .not-marked-card h3 i { margin-right: 0.5rem; }
    .not-marked-desc { margin: 0 0 1rem 0; font-size: 0.875rem; color: #a16207; }
    .not-marked-grid { display: flex; flex-direction: column; gap: 0.5rem; }
    .not-marked-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: #fff; border-radius: 8px; border: 1px solid #fde68a; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; }
    .badge-class { background: #dbeafe; color: #2563eb; }
    .badge-staff { background: #d1fae5; color: #059669; }
    .item-name { font-weight: 600; color: #0f2744; flex: 1; }
    .item-teacher { font-size: 0.8125rem; color: #6a8cad; }

    .table-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .table-header { padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0; }
    .table-header h3 { margin: 0; font-size: 1.125rem; color: #0f2744; }
    .table-header h3 i { color: #1e3a5f; margin-right: 0.5rem; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .col-present { color: #059669; font-weight: 600; }
    .col-absent { color: #dc2626; }
    .col-not-marked { color: #f59e0b; }
    .status-badge { padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .status-complete { background: #d1fae5; color: #059669; }
    .status-partial { background: #fef3c7; color: #d97706; }
    .status-pending { background: #fee2e2; color: #dc2626; }

    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem;
    }
    .pagination-bar.small { padding: 0.75rem 1rem; }
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
export class AdminAttendanceDailyComponent implements OnInit {
  selectedDate = '';
  loading = false;
  stats = { total: 0, present: 0, absent: 0, notMarked: 0, percent: 0 };
  classBreakdown: ClassBreakdown[] = [];
  notMarkedList: NotMarkedItem[] = [];
  pageSize = 10;
  currentPage = 1;
  notMarkedPage = 1;
  notMarkedPageSize = 5;

  get totalPages(): number {
    return Math.ceil(this.classBreakdown.length / this.pageSize) || 1;
  }

  get paginatedBreakdown(): ClassBreakdown[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.classBreakdown.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.classBreakdown.length);
  }

  get notMarkedPages(): number {
    return Math.ceil(this.notMarkedList.length / this.notMarkedPageSize) || 1;
  }

  get paginatedNotMarked(): NotMarkedItem[] {
    const start = (this.notMarkedPage - 1) * this.notMarkedPageSize;
    return this.notMarkedList.slice(start, start + this.notMarkedPageSize);
  }

  get notMarkedEndIndex(): number {
    return Math.min(this.notMarkedPage * this.notMarkedPageSize, this.notMarkedList.length);
  }

  constructor(private notify: NotificationService) {}

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadMockData();
  }

  loadData(): void {
    this.loadMockData();
  }

  refresh(): void {
    this.loading = true;
    setTimeout(() => {
      this.loadMockData();
      this.loading = false;
      this.notify.success('Data refreshed');
    }, 600);
  }

  sendReminder(): void {
    const count = this.notMarkedList.length;
    this.notify.success(`Reminder sent to ${count} teacher(s) / coordinator(s)`);
  }

  exportData(): void {
    this.notify.success('Export started. File will download shortly.');
    // In real app: generate CSV/Excel and trigger download
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  notMarkedPrevPage(): void {
    if (this.notMarkedPage > 1) this.notMarkedPage--;
  }

  notMarkedNextPage(): void {
    if (this.notMarkedPage < this.notMarkedPages) this.notMarkedPage++;
  }

  private loadMockData(): void {
    this.classBreakdown = [
      { classId: 1, className: 'Grade 10', section: 'A', total: 35, present: 32, absent: 2, notMarked: 1, percent: 91, status: 'partial' },
      { classId: 2, className: 'Grade 10', section: 'B', total: 38, present: 36, absent: 2, notMarked: 0, percent: 95, status: 'complete' },
      { classId: 3, className: 'Grade 9', section: 'A', total: 40, present: 38, absent: 1, notMarked: 1, percent: 95, status: 'partial' },
      { classId: 4, className: 'Grade 9', section: 'B', total: 42, present: 0, absent: 0, notMarked: 42, percent: 0, status: 'pending' },
      { classId: 5, className: 'Grade 8', section: 'A', total: 36, present: 34, absent: 2, notMarked: 0, percent: 94, status: 'complete' }
    ];
    this.notMarkedList = [
      { id: 1, className: 'Grade 10', section: 'A', teacher: 'John Smith', type: 'class' },
      { id: 2, className: 'Grade 9', section: 'A', teacher: 'Jane Doe', type: 'class' },
      { id: 3, className: 'Grade 9', section: 'B', teacher: 'Robert Johnson', type: 'class' }
    ];
    const t = this.classBreakdown.reduce((s, c) => s + c.total, 0);
    const p = this.classBreakdown.reduce((s, c) => s + c.present, 0);
    const a = this.classBreakdown.reduce((s, c) => s + c.absent, 0);
    const nm = this.classBreakdown.reduce((s, c) => s + c.notMarked, 0);
    this.stats = {
      total: t,
      present: p,
      absent: a,
      notMarked: nm,
      percent: t > 0 ? Math.round(((p + a) > 0 ? (p / (p + a)) * 100 : 0)) : 0
    };
  }
}
