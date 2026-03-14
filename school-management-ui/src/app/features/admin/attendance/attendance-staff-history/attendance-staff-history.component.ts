import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-attendance-staff-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header-card">
        <a routerLink="/admin/attendance/staff" class="back-link">
          <i class="fa fa-arrow-left"></i> Back to Staff Attendance
        </a>
        <h2><i class="fa fa-history"></i> Staff Attendance History</h2>
        <p class="page-subtitle" *ngIf="staffName">{{ staffName }} — Punctuality record</p>
      </div>
      <div class="content-card" *ngIf="rows.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of paginatedRows">
              <td>{{ r.date }}</td>
              <td><span class="badge pp">{{ r.status }}</span></td>
              <td>{{ r.timeIn }}</td>
              <td>{{ r.timeOut }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ rows.length }}</span>
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
    .page-container { padding: 1.5rem; max-width: 800px; margin: 0 auto; }
    .page-header-card { background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .back-link { display: inline-flex; align-items: center; gap: 0.35rem; color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none; }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .content-card { background: #fff; border-radius: 16px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; }
    .badge.pp { background: #d1fae5; color: #059669; }
    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem;
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
export class AdminAttendanceStaffHistoryComponent implements OnInit {
  staffName = '';
  rows: { date: string; status: string; timeIn: string; timeOut: string }[] = [];
  pageSize = 15;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.rows.length / this.pageSize) || 1;
  }

  get paginatedRows(): { date: string; status: string; timeIn: string; timeOut: string }[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.rows.length);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  private names: Record<number, string> = {
    1: 'John Smith', 2: 'Jane Doe', 3: 'Robert Johnson', 4: 'Sarah Williams', 5: 'Michael Brown'
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currentPage = 1;
      this.staffName = this.names[+id] ?? `Staff ${id}`;
      this.rows = [
        { date: new Date().toLocaleDateString(), status: 'PP', timeIn: '08:15', timeOut: '14:00' },
        { date: new Date(Date.now() - 864e5).toLocaleDateString(), status: 'PP', timeIn: '08:20', timeOut: '14:00' },
        { date: new Date(Date.now() - 864e5 * 2).toLocaleDateString(), status: 'PO', timeIn: '09:00', timeOut: '13:30' },
        { date: new Date(Date.now() - 864e5 * 3).toLocaleDateString(), status: 'PP', timeIn: '08:10', timeOut: '14:00' },
        { date: new Date(Date.now() - 864e5 * 4).toLocaleDateString(), status: 'A', timeIn: '—', timeOut: '—' }
      ];
    }
  }
}
