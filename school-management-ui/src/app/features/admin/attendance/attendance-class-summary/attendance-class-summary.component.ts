import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ClassSummary {
  classId: number;
  className: string;
  section: string;
  total: number;
  present: number;
  absent: number;
  leave: number;
  percent: number;
}

@Component({
  selector: 'app-admin-attendance-class-summary',
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
            <h2><i class="fa fa-graduation-cap"></i> Class-level Summary</h2>
            <p class="page-subtitle">Attendance by class, comparison, and best/worst performers</p>
          </div>
          <div class="filter-group">
            <label>Period</label>
            <select [(ngModel)]="selectedPeriod" (ngModelChange)="loadData()" class="form-control">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      <div class="best-worst-row">
        <div class="best-card">
          <h3><i class="fa fa-trophy"></i> Best Classes</h3>
          <div class="rank-list">
            <div *ngFor="let c of bestClasses; let i = index" class="rank-item">
              <span class="rank-num">{{ i + 1 }}</span>
              <span class="rank-name">{{ c.className }} {{ c.section }}</span>
              <span class="rank-pct">{{ c.percent }}%</span>
            </div>
          </div>
        </div>
        <div class="worst-card">
          <h3><i class="fa fa-exclamation-circle"></i> Needs Attention</h3>
          <div class="rank-list">
            <div *ngFor="let c of worstClasses; let i = index" class="rank-item">
              <span class="rank-num">{{ classData.length - worstClasses.length + i + 1 }}</span>
              <span class="rank-name">{{ c.className }} {{ c.section }}</span>
              <span class="rank-pct low">{{ c.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="comparison-card">
        <h3><i class="fa fa-bar-chart"></i> Class Comparison</h3>
        <div class="comparison-bars">
          <div *ngFor="let c of classData" class="comp-row">
            <span class="comp-label">{{ c.className }} {{ c.section }}</span>
            <div class="comp-track">
              <div class="comp-bar" [style.width.%]="c.percent"></div>
            </div>
            <span class="comp-val">{{ c.percent }}%</span>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Attendance by Class ({{ classData.length }})</h3>
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
              <th>Leave</th>
              <th>Attendance %</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of classData; let i = index" [class.best]="isBest(c)" [class.worst]="isWorst(c)">
              <td>{{ i + 1 }}</td>
              <td>{{ c.className }}</td>
              <td>{{ c.section }}</td>
              <td>{{ c.total }}</td>
              <td class="col-present">{{ c.present }}</td>
              <td class="col-absent">{{ c.absent }}</td>
              <td class="col-leave">{{ c.leave }}</td>
              <td><strong [class.high]="c.percent >= 90" [class.low]="c.percent < 85">{{ c.percent }}%</strong></td>
              <td>
                <span class="badge" [class.badge-best]="isBest(c)" [class.badge-worst]="isWorst(c)">
                  {{ getRank(c) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 950px; }
    .page-header-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.35rem;
      color: #6a8cad; font-size: 0.875rem; margin-bottom: 0.5rem; text-decoration: none;
    }
    .back-link:hover { color: #1e3a5f; }
    .page-header-card h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0; color: #6a8cad; font-size: 0.9375rem; }
    .filter-group label { display: block; font-size: 0.75rem; color: #6a8cad; margin-bottom: 0.25rem; }
    .form-control { padding: 0.5rem 0.75rem; border: 2px solid #d9e2ec; border-radius: 8px; font-size: 0.9rem; min-width: 120px; }

    .best-worst-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .best-card, .worst-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .best-card { border-left: 4px solid #059669; }
    .worst-card { border-left: 4px solid #dc2626; }
    .best-card h3, .worst-card h3 { margin: 0 0 1rem 0; font-size: 0.9375rem; color: #0f2744; }
    .best-card h3 i { color: #059669; margin-right: 0.5rem; }
    .worst-card h3 i { color: #dc2626; margin-right: 0.5rem; }
    .rank-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .rank-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; }
    .rank-num { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #e2e8f0; border-radius: 6px; font-weight: 600; color: #374151; font-size: 0.75rem; }
    .best-card .rank-item:first-child .rank-num { background: #059669; color: #fff; }
    .rank-name { flex: 1; font-weight: 500; color: #0f2744; }
    .rank-pct { font-weight: 600; color: #059669; }
    .rank-pct.low { color: #dc2626; }

    .comparison-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .comparison-card h3 { margin: 0 0 1.25rem 0; font-size: 1rem; color: #0f2744; }
    .comparison-card h3 i { color: #1e3a5f; margin-right: 0.5rem; }
    .comparison-bars { display: flex; flex-direction: column; gap: 1rem; }
    .comp-row { display: grid; grid-template-columns: 100px 1fr 50px; gap: 1rem; align-items: center; font-size: 0.875rem; }
    .comp-label { font-weight: 500; color: #0f2744; }
    .comp-track { height: 20px; background: #f3f4f6; border-radius: 6px; overflow: hidden; }
    .comp-bar { height: 100%; background: linear-gradient(90deg, #059669 0%, #10b981 100%); border-radius: 6px; transition: width 0.3s; }
    .comp-val { font-weight: 600; color: #0f2744; text-align: right; }

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
    .data-table tr.best { background: #f0fdf4; }
    .data-table tr.worst { background: #fef2f2; }
    .col-present { color: #059669; }
    .col-absent { color: #dc2626; }
    .col-leave { color: #2563eb; }
    .high { color: #059669 !important; }
    .low { color: #dc2626 !important; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .badge-best { background: #d1fae5; color: #059669; }
    .badge-worst { background: #fee2e2; color: #dc2626; }

    @media (max-width: 640px) {
      .best-worst-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminAttendanceClassSummaryComponent implements OnInit {
  selectedPeriod = 'today';
  classData: ClassSummary[] = [];

  get bestClasses(): ClassSummary[] {
    const sorted = [...this.classData].sort((a, b) => b.percent - a.percent);
    return sorted.slice(0, 3);
  }

  get worstClasses(): ClassSummary[] {
    const sorted = [...this.classData].sort((a, b) => a.percent - b.percent);
    return sorted.slice(0, 2);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.classData = [
      { classId: 1, className: 'Grade 10', section: 'A', total: 35, present: 33, absent: 1, leave: 1, percent: 94 },
      { classId: 2, className: 'Grade 10', section: 'B', total: 38, present: 36, absent: 2, leave: 0, percent: 95 },
      { classId: 3, className: 'Grade 9', section: 'A', total: 40, present: 34, absent: 4, leave: 2, percent: 85 },
      { classId: 4, className: 'Grade 9', section: 'B', total: 42, present: 36, absent: 5, leave: 1, percent: 86 },
      { classId: 5, className: 'Grade 8', section: 'A', total: 36, present: 30, absent: 4, leave: 2, percent: 83 }
    ];
  }

  isBest(c: ClassSummary): boolean {
    return this.bestClasses.some(x => x.classId === c.classId && x.section === c.section);
  }

  isWorst(c: ClassSummary): boolean {
    return this.worstClasses.some(x => x.classId === c.classId && x.section === c.section);
  }

  getRank(c: ClassSummary): string {
    const sorted = [...this.classData].sort((a, b) => b.percent - a.percent);
    const idx = sorted.findIndex(x => x.classId === c.classId && x.section === c.section);
    if (idx === 0) return '1st';
    if (idx === 1) return '2nd';
    if (idx === 2) return '3rd';
    return (idx + 1) + 'th';
  }
}
