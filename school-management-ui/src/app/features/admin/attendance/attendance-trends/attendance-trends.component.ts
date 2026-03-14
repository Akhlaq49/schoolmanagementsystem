import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';

interface TrendDataPoint {
  label: string;
  present: number;
  absent: number;
  leave: number;
  total: number;
}

@Component({
  selector: 'app-admin-attendance-trends',
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
            <h2><i class="fa fa-line-chart"></i> Attendance Trends</h2>
            <p class="page-subtitle">Charts for daily, weekly, and monthly present/absent/leave trends</p>
          </div>
        </div>
      </div>

      <div class="controls-card">
        <h3>View By</h3>
        <div class="period-tabs">
          <button type="button" class="tab-btn" [class.active]="period === 'daily'" (click)="setPeriod('daily')">
            <i class="fa fa-calendar-o"></i> Daily
          </button>
          <button type="button" class="tab-btn" [class.active]="period === 'weekly'" (click)="setPeriod('weekly')">
            <i class="fa fa-calendar"></i> Weekly
          </button>
          <button type="button" class="tab-btn" [class.active]="period === 'monthly'" (click)="setPeriod('monthly')">
            <i class="fa fa-calendar-check-o"></i> Monthly
          </button>
        </div>
      </div>

      <div class="legend-row">
        <span class="leg"><span class="dot present"></span> Present</span>
        <span class="leg"><span class="dot absent"></span> Absent</span>
        <span class="leg"><span class="dot leave"></span> Leave</span>
      </div>

      <div class="chart-card">
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

      <div class="summary-cards">
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

      <div class="table-card">
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
  period: 'daily' | 'weekly' | 'monthly' = 'daily';
  chartData: TrendDataPoint[] = [];
  totals = { present: 0, absent: 0, leave: 0, percent: 0 };

  get periodLabel(): string {
    return this.period === 'daily' ? 'Daily' : this.period === 'weekly' ? 'Weekly' : 'Monthly';
  }

  constructor(private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadMockData();
  }

  setPeriod(p: 'daily' | 'weekly' | 'monthly'): void {
    this.period = p;
    this.loadMockData();
  }

  getPercent(value: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  private loadMockData(): void {
    if (this.period === 'daily') {
      this.chartData = [
        { label: 'Mar 10', present: 178, absent: 12, leave: 5, total: 195 },
        { label: 'Mar 11', present: 182, absent: 8, leave: 5, total: 195 },
        { label: 'Mar 12', present: 175, absent: 15, leave: 5, total: 195 },
        { label: 'Mar 13', present: 180, absent: 10, leave: 5, total: 195 },
        { label: 'Mar 14', present: 170, absent: 20, leave: 5, total: 195 }
      ];
    } else if (this.period === 'weekly') {
      this.chartData = [
        { label: 'Week 1', present: 890, absent: 58, leave: 27, total: 975 },
        { label: 'Week 2', present: 905, absent: 45, leave: 25, total: 975 },
        { label: 'Week 3', present: 878, absent: 72, leave: 25, total: 975 },
        { label: 'Week 4', present: 892, absent: 58, leave: 25, total: 975 },
        { label: 'Week 5', present: 450, absent: 35, leave: 15, total: 500 }
      ];
    } else {
      this.chartData = [
        { label: 'Jan 2025', present: 3850, absent: 245, leave: 130, total: 4225 },
        { label: 'Feb 2025', present: 3620, absent: 310, leave: 125, total: 4055 },
        { label: 'Mar 2025', present: 4015, absent: 198, leave: 142, total: 4355 },
        { label: 'Apr 2025', present: 3900, absent: 220, leave: 135, total: 4255 },
        { label: 'May 2025', present: 3780, absent: 265, leave: 140, total: 4185 }
      ];
    }
    const p = this.chartData.reduce((s, d) => s + d.present, 0);
    const a = this.chartData.reduce((s, d) => s + d.absent, 0);
    const l = this.chartData.reduce((s, d) => s + d.leave, 0);
    const t = p + a + l;
    this.totals = {
      present: p,
      absent: a,
      leave: l,
      percent: t > 0 ? Math.round((p / t) * 100) : 0
    };
  }
}
