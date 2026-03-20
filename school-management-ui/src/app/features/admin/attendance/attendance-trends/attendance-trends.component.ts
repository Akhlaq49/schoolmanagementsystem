import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AttendanceTrendDataPoint, AttendanceTrendPeriod } from '../../../../core/models/attendance.model';

@Component({
  selector: 'app-admin-attendance-trends',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div *ngIf="loading" class="loading-overlay">
      <i class="fa fa-spinner fa-spin fa-2x"></i>
    </div>
    <div class="page-container">
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <a routerLink="/admin/dashboard" class="back-link">
              <i class="fa fa-arrow-left"></i> Back to Dashboard
            </a>
            <h2><i class="fa fa-line-chart"></i> Attendance Trends</h2>
            <p class="page-subtitle">Charts for daily, weekly, and monthly present/absent/leave trends</p>
          </div>
        </div>
      </div>

      <div class="controls-card">
        <h3>View By</h3>
        <div class="period-tabs">
          <button type="button" class="tab-btn" [class.active]="period === 'daily'" (click)="setPeriod('daily')" [disabled]="loading">
            <i class="fa fa-calendar-o"></i> Daily
          </button>
          <button type="button" class="tab-btn" [class.active]="period === 'weekly'" (click)="setPeriod('weekly')" [disabled]="loading">
            <i class="fa fa-calendar"></i> Weekly
          </button>
          <button type="button" class="tab-btn" [class.active]="period === 'monthly'" (click)="setPeriod('monthly')" [disabled]="loading">
            <i class="fa fa-calendar-check-o"></i> Monthly
          </button>
        </div>
      </div>

      <div class="legend-row">
        <span class="leg"><span class="dot present"></span> Present</span>
        <span class="leg"><span class="dot absent"></span> Absent</span>
        <span class="leg"><span class="dot leave"></span> Leave</span>
      </div>

      <div class="empty-state" *ngIf="!loading && chartData.length === 0">
        <i class="fa fa-line-chart"></i>
        <p>No attendance data found for the selected period.</p>
      </div>

      <div class="chart-card" *ngIf="chartData.length > 0">
        <h3>Attendance Trends — {{ periodLabel }}</h3>
        <div class="chart-bars">
          <div *ngFor="let d of chartData" class="bar-row">
            <span class="bar-label">{{ d.label }}</span>
            <div class="bar-track">
              <div class="bar present" [style.width.%]="getPercent(d.present, d.total)"></div>
              <div class="bar absent" [style.width.%]="getPercent(d.absent, d.total)"></div>
              <div class="bar leave" [style.width.%]="getPercent(d.leave, d.total)"></div>
            </div>
            <span class="bar-total">{{ d.present }}/{{ d.absent }}/{{ d.leave }}</span>
          </div>
        </div>
      </div>

      <div class="summary-cards" *ngIf="chartData.length > 0">
        <div class="summary-card">
          <span class="val present">{{ totals.present }}</span>
          <span class="lbl">Total Present</span>
        </div>
        <div class="summary-card">
          <span class="val absent">{{ totals.absent }}</span>
          <span class="lbl">Total Absent</span>
        </div>
        <div class="summary-card">
          <span class="val leave">{{ totals.leave }}</span>
          <span class="lbl">Total Leave</span>
        </div>
        <div class="summary-card highlight">
          <span class="val">{{ totals.percent }}%</span>
          <span class="lbl">Avg Attendance</span>
        </div>
      </div>

      <div class="table-card" *ngIf="chartData.length > 0">
        <div class="table-header">
          <h3>Trend Data ({{ chartData.length }} records)</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ period === 'daily' ? 'Date' : period === 'weekly' ? 'Week' : 'Month' }}</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Leave</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of chartData; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ d.label }}</td>
              <td class="col-present">{{ d.present }}</td>
              <td class="col-absent">{{ d.absent }}</td>
              <td class="col-leave">{{ d.leave }}</td>
              <td>{{ d.total }}</td>
              <td><strong>{{ getPercent(d.present, d.total) }}%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .tab-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
    .empty-state i { font-size: 3rem; margin-bottom: 0.5rem; display: block; }
    .loading-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 9000; color: #1e3a5f;
    }
    .page-container { max-width: 900px; }
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

    .controls-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .controls-card h3 { margin: 0 0 0.75rem 0; font-size: 0.9375rem; color: #0f2744; }
    .period-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .tab-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.25rem; border: 2px solid #e2e8f0;
      background: #fff; border-radius: 10px;
      font-size: 0.9rem; font-weight: 500; color: #6a8cad;
      cursor: pointer; transition: all 0.2s;
    }
    .tab-btn:hover { border-color: #1e3a5f; color: #1e3a5f; }
    .tab-btn.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }

    .legend-row { display: flex; gap: 1.5rem; margin-bottom: 1rem; font-size: 0.8125rem; color: #6a8cad; }
    .leg { display: flex; align-items: center; gap: 0.35rem; }
    .dot { width: 12px; height: 12px; border-radius: 3px; }
    .dot.present { background: #059669; }
    .dot.absent { background: #dc2626; }
    .dot.leave { background: #2563eb; }

    .chart-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .chart-card h3 { margin: 0 0 1.25rem 0; font-size: 1rem; color: #0f2744; }
    .chart-bars { display: flex; flex-direction: column; gap: 1rem; }
    .bar-row {
      display: grid; grid-template-columns: 100px 1fr 90px; gap: 1rem;
      align-items: center; font-size: 0.875rem;
    }
    .bar-label { font-weight: 500; color: #0f2744; }
    .bar-track {
      display: flex; height: 24px; border-radius: 6px; overflow: hidden;
      background: #f3f4f6;
    }
    .bar { height: 100%; transition: width 0.3s; }
    .bar.present { background: #059669; }
    .bar.absent { background: #dc2626; }
    .bar.leave { background: #2563eb; }
    .bar-total { font-size: 0.75rem; color: #6a8cad; white-space: nowrap; }

    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .summary-card .val { display: block; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .summary-card .val.present { color: #059669; }
    .summary-card .val.absent { color: #dc2626; }
    .summary-card .val.leave { color: #2563eb; }
    .summary-card.highlight { border-color: #1e3a5f; }
    .summary-card.highlight .val { color: #1e3a5f; }
    .summary-card .lbl { font-size: 0.75rem; color: #6a8cad; }

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
    .col-present { color: #059669; }
    .col-absent { color: #dc2626; }
    .col-leave { color: #2563eb; }

    @media (max-width: 640px) {
      .bar-row { grid-template-columns: 80px 1fr; }
      .bar-total { grid-column: 2; }
    }
  `]
})
export class AdminAttendanceTrendsComponent implements OnInit {
  period: AttendanceTrendPeriod = 'daily';
  chartData: AttendanceTrendDataPoint[] = [];
  totals = { present: 0, absent: 0, leave: 0, percent: 0 };
  loading = false;

  get periodLabel(): string {
    return this.period === 'daily' ? 'Daily' : this.period === 'weekly' ? 'Weekly' : 'Monthly';
  }

  constructor(
    private notify: NotificationService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.fetchTrends();
  }

  setPeriod(p: AttendanceTrendPeriod): void {
    this.period = p;
    this.fetchTrends();
  }

  getPercent(value: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  private getDateRange(): { dateFrom: string; dateTo: string } {
    const t = new Date();
    const dateTo = t.toISOString().split('T')[0];
    const from = new Date(t);
    if (this.period === 'monthly') from.setMonth(from.getMonth() - 5);
    else if (this.period === 'weekly') from.setDate(from.getDate() - 56);
    else from.setDate(from.getDate() - 13);
    const dateFrom = from.toISOString().split('T')[0];
    return { dateFrom, dateTo };
  }

  private fetchTrends(): void {
    const { dateFrom, dateTo } = this.getDateRange();
    this.loading = true;
    this.attendanceService.getAdminAttendanceTrends(this.period, dateFrom, dateTo).subscribe({
      next: (res) => {
        this.chartData = res.dataPoints;
        this.totals = res.totals;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.notify.error(err?.error?.message ?? 'Failed to load attendance trends');
      }
    });
  }
}
