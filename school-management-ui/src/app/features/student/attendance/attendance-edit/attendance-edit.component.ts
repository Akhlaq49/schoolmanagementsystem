import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="edit-container">
      <div class="page-header">
        <h2><i class="fa fa-pencil-square-o"></i> Edit Attendance</h2>
        <p class="subtitle">Request correction or edit your attendance records</p>
      </div>
      <div class="listing-card">
        <h3>Attendance Correction Requests</h3>
        <div class="empty-state" *ngIf="editRequests.length === 0">
          <i class="fa fa-inbox"></i>
          <p>No correction requests yet</p>
          <span class="hint">Contact your teacher or admin for attendance corrections.</span>
        </div>
        <div class="table-wrap" *ngIf="editRequests.length > 0">
          <table class="edit-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Requested Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of paginatedRequests">
                <td>{{ r.date }}</td>
                <td>{{ r.currentStatus }}</td>
                <td>{{ r.requestedChange }}</td>
                <td>{{ r.requestStatus }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-bar" *ngIf="editRequests.length > 0 && totalPages > 1">
          <span class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ editRequests.length }}
          </span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .edit-container { padding: 1.5rem; max-width: 800px; margin: 0 auto; }
    .page-header h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      color: #0f2744;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .page-header h2 i { color: #1e3a5f; }
    .subtitle { margin: 0 0 1.5rem 0; color: #6a8cad; font-size: 0.9375rem; }
    .listing-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .listing-card h3 { margin: 0 0 1rem 0; font-size: 1.125rem; color: #0f2744; }
    .edit-table { width: 100%; border-collapse: collapse; }
    .edit-table th, .edit-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .edit-table th { background: #f7f9fc; font-size: 0.8125rem; color: #6a8cad; font-weight: 600; }
    .empty-state { text-align: center; padding: 2rem; color: #9ca3af; }
    .empty-state i { font-size: 2.5rem; margin-bottom: 0.5rem; display: block; }
    .empty-state p { font-size: 1rem; margin: 0 0 0.5rem 0; }
    .hint { font-size: 0.875rem; color: #6a8cad; display: block; }
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0 0;
      margin-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }
    .pagination-info { font-size: 0.875rem; color: #6a8cad; }
    .pagination-controls { display: flex; gap: 0.5rem; }
    .page-btn {
      padding: 0.4rem 0.75rem;
      border: 2px solid #e2e8f0;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9375rem;
      color: #374151;
    }
    .page-btn:hover:not(:disabled) { border-color: #1e3a5f; color: #1e3a5f; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AttendanceEditComponent {
  editRequests: { date: string; currentStatus: string; requestedChange: string; requestStatus: string }[] = [];
  pageSize = 10;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.editRequests.length / this.pageSize) || 1;
  }

  get paginatedRequests(): { date: string; currentStatus: string; requestedChange: string; requestStatus: string }[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.editRequests.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.editRequests.length);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }
}
