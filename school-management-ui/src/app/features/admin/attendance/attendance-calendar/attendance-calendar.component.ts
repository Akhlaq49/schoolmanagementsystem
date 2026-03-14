import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';

type DayType = 'holiday' | 'event' | 'half-day' | 'special';

interface CalendarItem {
  id: number;
  date: string;
  title: string;
  type: DayType;
  description?: string;
}

@Component({
  selector: 'app-admin-attendance-calendar',
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
            <h2><i class="fa fa-calendar"></i> Calendar</h2>
            <p class="page-subtitle">Shared calendar with holidays, events, and configurable days</p>
          </div>
        </div>
      </div>

      <div class="calendar-card">
        <div class="calendar-header">
          <h3><i class="fa fa-calendar-check-o"></i> Shared Calendar</h3>
          <div class="calendar-controls">
            <select [(ngModel)]="selectedYear" (ngModelChange)="buildCalendar()" class="form-control year-select">
              <option *ngFor="let y of yearOptions" [value]="y">{{ y }}</option>
            </select>
            <div class="month-nav">
              <button type="button" class="btn-icon" (click)="prevMonth()" title="Previous month">
                <i class="fa fa-chevron-left"></i>
              </button>
              <span class="month-label">{{ getMonthName(displayMonth) }} {{ selectedYear }}</span>
              <button type="button" class="btn-icon" (click)="nextMonth()" title="Next month">
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="calendar-grid">
          <div class="weekday-headers">
            <span *ngFor="let d of weekdayLabels">{{ d }}</span>
          </div>
          <div class="days-grid">
            <div
              *ngFor="let d of calendarDays"
              class="day-cell"
              [class.empty]="!d"
              [class.holiday]="d && getItemForDate(d)?.type === 'holiday'"
              [class.event]="d && getItemForDate(d)?.type === 'event'"
              [class.halfday]="d && getItemForDate(d)?.type === 'half-day'"
              [class.special]="d && getItemForDate(d)?.type === 'special'"
              [class.today]="d && isToday(d)"
              (click)="openConfigureDay(d)"
            >
              <span class="day-num">{{ d ? d.getDate() : '' }}</span>
              <span *ngIf="d && getItemForDate(d)" class="day-badge">{{ getItemForDate(d)!.type === 'half-day' ? '½' : getItemForDate(d)!.type.charAt(0) }}</span>
            </div>
          </div>
        </div>
        <div class="calendar-legend">
          <span class="leg-item"><span class="dot holiday"></span> Holiday</span>
          <span class="leg-item"><span class="dot event"></span> Event</span>
          <span class="leg-item"><span class="dot halfday"></span> Half-day</span>
          <span class="leg-item"><span class="dot special"></span> Special</span>
          <span class="leg-item"><span class="dot today"></span> Today</span>
          <span class="leg-item"><i>Click a date to configure</i></span>
        </div>
      </div>

      <div class="add-card">
        <h3><i class="fa fa-plus-circle"></i> Add / Configure Day</h3>
        <div class="config-form">
          <div class="form-group">
            <label>Date</label>
            <input type="date" class="form-control" [(ngModel)]="configDate">
          </div>
          <div class="form-group">
            <label>Type</label>
            <select [(ngModel)]="configType" class="form-control">
              <option value="holiday">Holiday</option>
              <option value="event">Event</option>
              <option value="half-day">Half-day</option>
              <option value="special">Special</option>
            </select>
          </div>
          <div class="form-group flex-grow">
            <label>Title</label>
            <input type="text" class="form-control" [(ngModel)]="configTitle" placeholder="e.g., Sports Day">
          </div>
          <div class="form-group form-actions">
            <button type="button" class="btn btn-primary" (click)="saveConfig()" [disabled]="!configDate || !configTitle.trim()">
              <i class="fa fa-check"></i> Save
            </button>
            <button type="button" class="btn btn-danger-outline" (click)="clearConfig()" *ngIf="configDate && getItemForDateKey(configDate)">
              <i class="fa fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Calendar Items ({{ items.length }})</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Title</th>
              <th>Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of paginatedItems; let i = index">
              <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.title }}</td>
              <td><span class="badge" [ngClass]="'badge-' + item.type">{{ item.type }}</span></td>
              <td class="desc-cell">{{ item.description || '—' }}</td>
              <td>
                <button type="button" class="btn-icon" (click)="editItem(item)" title="Edit">
                  <i class="fa fa-pencil"></i>
                </button>
                <button type="button" class="btn-icon btn-remove" (click)="removeItem(item)" title="Remove">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ endIndex }} of {{ items.length }}</span>
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

    .calendar-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .calendar-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; }
    .calendar-header h3 { margin: 0; font-size: 1rem; color: #0f2744; }
    .calendar-header h3 i { color: #1e3a5f; margin-right: 0.5rem; }
    .calendar-controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .year-select { width: 100px; padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; font-size: 0.9375rem; }
    .month-nav { display: flex; align-items: center; gap: 0.5rem; }
    .month-label { font-weight: 600; color: #0f2744; min-width: 140px; text-align: center; }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; padding: 0; border: 2px solid #e2e8f0; background: #fff;
      border-radius: 8px; cursor: pointer; color: #1e3a5f;
    }
    .btn-icon:hover { border-color: #1e3a5f; background: #f7f9fc; }

    .weekday-headers { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 0.5rem; text-align: center; font-size: 0.75rem; font-weight: 600; color: #6a8cad; }
    .days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .day-cell {
      aspect-ratio: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
      font-size: 0.875rem; font-weight: 500; color: #0f2744;
      background: #f7f9fc; border-radius: 8px; cursor: pointer;
      transition: all 0.2s; min-height: 44px; position: relative;
    }
    .day-cell.empty { background: transparent; cursor: default; }
    .day-cell:not(.empty):hover { background: #e2e8f0; }
    .day-cell.holiday { background: #dc2626; color: #fff; }
    .day-cell.event { background: #2563eb; color: #fff; }
    .day-cell.halfday { background: #d97706; color: #fff; }
    .day-cell.special { background: #7c3aed; color: #fff; }
    .day-cell.today { border: 2px solid #1e3a5f; }
    .day-badge { font-size: 0.65rem; opacity: 0.9; }
    .day-num { font-weight: 600; }

    .calendar-legend { display: flex; gap: 1.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8125rem; color: #6a8cad; flex-wrap: wrap; }
    .leg-item { display: flex; align-items: center; gap: 0.35rem; }
    .dot { width: 12px; height: 12px; border-radius: 3px; }
    .dot.holiday { background: #dc2626; }
    .dot.event { background: #2563eb; }
    .dot.halfday { background: #d97706; }
    .dot.special { background: #7c3aed; }
    .dot.today { border: 2px solid #1e3a5f; background: transparent; }

    .add-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .add-card h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #0f2744; }
    .add-card h3 i { color: #1e3a5f; margin-right: 0.5rem; }
    .config-form { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end; }
    .form-group { display: flex; flex-direction: column; min-width: 120px; }
    .form-group.flex-grow { flex: 1; min-width: 180px; }
    .form-group label { font-size: 0.8125rem; margin-bottom: 0.35rem; color: #6a8cad; font-weight: 500; }
    .form-control { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; font-size: 0.9375rem; }

    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1.25rem; border: none; border-radius: 10px;
      font-size: 0.9375rem; font-weight: 600; cursor: pointer;
    }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; }
    .btn-danger-outline { background: transparent; border: 2px solid #dc2626; color: #dc2626; }
    .btn-danger-outline:hover { background: #fee2e2; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

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
    .badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .badge-holiday { background: #fee2e2; color: #dc2626; }
    .badge-event { background: #dbeafe; color: #2563eb; }
    .badge-half-day { background: #fef3c7; color: #d97706; }
    .badge-special { background: #ede9fe; color: #7c3aed; }
    .desc-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .btn-remove { color: #dc2626; border-color: transparent; background: transparent; margin-left: 0.25rem; }
    .btn-remove:hover { background: #fee2e2; }

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
export class AdminAttendanceCalendarComponent implements OnInit {
  selectedYear = new Date().getFullYear();
  displayMonth = new Date().getMonth();
  yearOptions: number[] = [];
  weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: (Date | null)[] = [];
  items: CalendarItem[] = [];
  configDate = '';
  configTitle = '';
  configType: DayType = 'holiday';
  configId: number | null = null;
  pageSize = 10;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.items.length / this.pageSize) || 1;
  }

  get paginatedItems(): CalendarItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.items.length);
  }

  constructor(private notify: NotificationService) {}

  ngOnInit(): void {
    const y = new Date().getFullYear();
    this.yearOptions = [y - 1, y, y + 1];
    this.selectedYear = y;
    this.displayMonth = new Date().getMonth();
    this.loadMockData();
    this.buildCalendar();
  }

  loadMockData(): void {
    const y = this.selectedYear;
    this.items = [
      { id: 1, date: `${y}-01-01`, title: 'New Year', type: 'holiday', description: 'Public holiday' },
      { id: 2, date: `${y}-03-23`, title: 'Pakistan Day', type: 'holiday', description: 'National holiday' },
      { id: 3, date: `${y}-04-15`, title: 'Sports Day', type: 'event', description: 'Annual sports event' },
      { id: 4, date: `${y}-06-20`, title: 'Parent-Teacher Meeting', type: 'event', description: 'Scheduled meetings' },
      { id: 5, date: `${y}-08-14`, title: 'Independence Day (Half-day)', type: 'half-day', description: 'Celebration till noon' }
    ];
  }

  buildCalendar(): void {
    const first = new Date(this.selectedYear, this.displayMonth, 1);
    const last = new Date(this.selectedYear, this.displayMonth + 1, 0);
    const startPad = first.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(this.selectedYear, this.displayMonth, d));
    }
    this.calendarDays = days;
  }

  prevMonth(): void {
    if (this.displayMonth === 0) {
      this.displayMonth = 11;
      this.selectedYear--;
      if (!this.yearOptions.includes(this.selectedYear)) this.yearOptions = [this.selectedYear, ...this.yearOptions].sort((a, b) => a - b);
    } else this.displayMonth--;
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.displayMonth === 11) {
      this.displayMonth = 0;
      this.selectedYear++;
      if (!this.yearOptions.includes(this.selectedYear)) this.yearOptions = [...this.yearOptions, this.selectedYear].sort((a, b) => a - b);
    } else this.displayMonth++;
    this.buildCalendar();
  }

  getMonthName(m: number): string {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m];
  }

  toDateKey(d: Date): string {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  getItemForDate(d: Date): CalendarItem | undefined {
    return this.items.find(i => i.date === this.toDateKey(d));
  }

  getItemForDateKey(key: string): CalendarItem | undefined {
    return this.items.find(i => i.date === key);
  }

  isToday(d: Date): boolean {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  }

  openConfigureDay(d: Date | null): void {
    if (!d) return;
    const key = this.toDateKey(d);
    const existing = this.getItemForDateKey(key);
    this.configDate = key;
    this.configTitle = existing?.title ?? '';
    this.configType = existing?.type ?? 'holiday';
    this.configId = existing?.id ?? null;
  }

  saveConfig(): void {
    if (!this.configDate || !this.configTitle.trim()) return;
    const existing = this.items.find(i => i.date === this.configDate && i.id !== this.configId);
    if (existing && !this.configId) {
      this.notify.warning('This date already has an item. Edit or remove it first.');
      return;
    }
    if (this.configId) {
      const idx = this.items.findIndex(i => i.id === this.configId);
      if (idx >= 0) {
        this.items[idx] = { ...this.items[idx], date: this.configDate, title: this.configTitle.trim(), type: this.configType };
      }
      this.notify.success('Item updated');
    } else {
      this.items.push({
        id: Date.now(),
        date: this.configDate,
        title: this.configTitle.trim(),
        type: this.configType
      });
      this.items.sort((a, b) => a.date.localeCompare(b.date));
      this.notify.success('Item added');
    }
    this.clearConfigForm();
    this.buildCalendar();
  }

  clearConfig(): void {
    if (!this.configDate) return;
    const item = this.getItemForDateKey(this.configDate);
    if (item) {
      this.items = this.items.filter(i => i.id !== item.id);
      this.notify.info('Item removed');
    }
    this.clearConfigForm();
    this.buildCalendar();
  }

  clearConfigForm(): void {
    this.configDate = '';
    this.configTitle = '';
    this.configType = 'holiday';
    this.configId = null;
    this.currentPage = 1;
  }

  editItem(item: CalendarItem): void {
    this.configDate = item.date;
    this.configTitle = item.title;
    this.configType = item.type;
    this.configId = item.id;
  }

  removeItem(item: CalendarItem): void {
    this.items = this.items.filter(i => i.id !== item.id);
    this.notify.info('Item removed');
    this.currentPage = 1;
    this.buildCalendar();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }
}
