import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { FeeService } from '../../../../core/services/fee.service';
import {
  MonthlySummaryReport,
  ClassSummaryReportRow,
  AgingReport,
  DiscountReport,
  IncomeExpenseReport
} from '../../../../core/models/fee.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-fee-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent, LoadingComponent],
  template: `
    <div class="reports-container">
      <app-loading [show]="loading" [message]="'Loading reports...'"></app-loading>

      <!-- Header -->
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-bar-chart"></i> Fee Reports</h2>
            <p class="page-subtitle">
              Central hub for monthly fee summaries, collections, aging, discounts, and income vs expenses.
            </p>
          </div>
          <button class="btn btn-primary" (click)="printCurrentTab()">
            <i class="fa fa-print"></i> Print {{ getCurrentTabLabel() }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tab-nav-card">
        <button
          type="button"
          class="tab-btn"
          *ngFor="let t of tabs"
          [class.active]="activeTab === t.key"
          (click)="activeTab = t.key">
          <i class="fa" [ngClass]="t.icon"></i>
          <span>{{ t.label }}</span>
        </button>
      </div>

      <!-- Monthly Summary Tab -->
      <div *ngIf="activeTab === 'monthly'" class="tab-panel">
        <div class="filters-card">
          <div class="filter-group wide">
            <label class="filter-label">Month</label>
            <app-dropdown
              [(ngModel)]="filters.month"
              [options]="monthOptions"
              placeholder="All Months"
              [placeholderValue]="0"
              (changed)="onFilterChange()">
            </app-dropdown>
          </div>
          <div class="filter-group wide">
            <label class="filter-label">Year</label>
            <app-dropdown
              [(ngModel)]="filters.year"
              [options]="yearOptions"
              [showPlaceholderOption]="false"
              [searchable]="false"
              (changed)="onFilterChange()">
            </app-dropdown>
          </div>
          <div class="filter-group wide">
            <label class="filter-label">Class</label>
            <app-dropdown
              [(ngModel)]="filters.classId"
              [options]="classOptions"
              placeholder="All Classes"
              [placeholderValue]="0"
              [searchable]="true"
              (changed)="onFilterChange()">
            </app-dropdown>
          </div>
        </div>

        <div class="summary-grid" *ngIf="monthlyReport">
          <div class="summary-card card-billed">
            <div class="card-icon"><i class="fa fa-file-text-o"></i></div>
            <div class="card-data">
              <span class="card-value">{{ monthlyReport.totalBilled | number:'1.0-0' }}</span>
              <span class="card-label">Total Billed</span>
            </div>
          </div>
          <div class="summary-card card-collected">
            <div class="card-icon"><i class="fa fa-money"></i></div>
            <div class="card-data">
              <span class="card-value">{{ monthlyReport.totalCollected | number:'1.0-0' }}</span>
              <span class="card-label">Total Collected</span>
            </div>
          </div>
          <div class="summary-card card-outstanding">
            <div class="card-icon"><i class="fa fa-hourglass-half"></i></div>
            <div class="card-data">
              <span class="card-value">{{ monthlyReport.totalOutstanding | number:'1.0-0' }}</span>
              <span class="card-label">Outstanding</span>
            </div>
          </div>
          <div class="summary-card card-rate">
            <div class="card-icon"><i class="fa fa-line-chart"></i></div>
            <div class="card-data">
              <span class="card-value">{{ monthlyReport.collectionRate }}%</span>
              <span class="card-label">Collection Rate</span>
            </div>
          </div>
        </div>

        <div class="academy-table-card">
          <div class="academy-table-header">
            <span class="academy-table-title">
              <i class="fa fa-table"></i> Class-wise Monthly Summary
            </span>
          </div>
          <div class="academy-table-responsive">
            <table class="academy-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Billed</th>
                  <th>Collected</th>
                  <th>Outstanding</th>
                  <th>Collection %</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of monthlyReport?.rows">
                  <td>{{ row.className }}</td>
                  <td>{{ row.billed | number:'1.0-0' }}</td>
                  <td>{{ row.collected | number:'1.0-0' }}</td>
                  <td>{{ row.outstanding | number:'1.0-0' }}</td>
                  <td>{{ row.collectionRate }}%</td>
                </tr>
                <tr *ngIf="!monthlyReport || monthlyReport.rows.length === 0">
                  <td colspan="5" class="empty-cell">No data for selected filters.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Class-wise Fee Summary Tab -->
      <div *ngIf="activeTab === 'class-summary'\" class=\"tab-panel\">
        <div class=\"filters-card\">
          <div class=\"filter-group wide\">
            <label class=\"filter-label\">Academic Session</label>
            <app-dropdown
              [(ngModel)]=\"filters.sessionId\"
              [options]=\"sessionOptions\"
              placeholder=\"All Sessions\"
              [placeholderValue]=\"0\"
              [searchable]=\"false\"
              (changed)=\"onFilterChange()\">
            </app-dropdown>
          </div>
        </div>

        <div class=\"academy-table-card\">
          <div class=\"academy-table-header\">
            <span class=\"academy-table-title\">
              <i class=\"fa fa-pie-chart\"></i> Class-wise Fee Summary
            </span>
          </div>
          <div class=\"academy-table-responsive\">
            <table class=\"academy-table\">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total Billed</th>
                  <th>Collected</th>
                  <th>Outstanding</th>
                  <th>Collection %</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor=\"let row of classSummaryRows\">
                  <td>{{ row.className }}</td>
                  <td>{{ row.billed | number:'1.0-0' }}</td>
                  <td>{{ row.collected | number:'1.0-0' }}</td>
                  <td>{{ row.outstanding | number:'1.0-0' }}</td>
                  <td>{{ row.collectionRate }}%</td>
                </tr>
                <tr *ngIf=\"classSummaryRows.length === 0\">
                  <td colspan=\"5\" class=\"empty-cell\">No data for selected filters.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Outstanding / Aging Tab -->
      <div *ngIf=\"activeTab === 'aging'\" class=\"tab-panel\">
        <div class=\"filters-card\">
          <div class=\"filter-group wide\">
            <label class=\"filter-label\">As of Date</label>
            <input
              type=\"date\"
              class=\"academy-input\"
              [(ngModel)]=\"filters.asOfDate\"
              (change)=\"onFilterChange()\">
          </div>
          <div class=\"filter-group wide\">
            <label class=\"filter-label\">Class</label>
            <app-dropdown
              [(ngModel)]=\"filters.classId\"
              [options]=\"classOptions\"
              placeholder=\"All Classes\"
              [placeholderValue]=\"0\"
              [searchable]=\"true\"
              (changed)=\"onFilterChange()\">
            </app-dropdown>
          </div>
        </div>

        <div class=\"aging-grid-card\">
          <h3><i class=\"fa fa-clock-o\"></i> Outstanding Aging Buckets</h3>
          <div class=\"aging-grid\" *ngIf=\"agingReport\">
            <div class=\"aging-item\" *ngFor=\"let bucket of agingReport.buckets\">
              <span class=\"label\">{{ bucket.label }}</span>
              <span class=\"value\">{{ bucket.amount | number:'1.0-0' }} PKR</span>
              <span class=\"count\">{{ bucket.count }} challan(s)</span>
            </div>
          </div>
        </div>

        <div class=\"academy-table-card\">
          <div class=\"academy-table-header\">
            <span class=\"academy-table-title\">
              <i class=\"fa fa-table\"></i> Outstanding Details (Sample Layout)
            </span>
          </div>
          <div class=\"academy-table-responsive\">
            <table class=\"academy-table\">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Challan #</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Outstanding</th>
                  <th>Bucket</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor=\"let row of agingReport?.details\">
                  <td>{{ row.studentName }}</td>
                  <td>{{ row.className }}</td>
                  <td>{{ row.challanNumber }}</td>
                  <td>{{ row.dueDate }}</td>
                  <td>{{ row.daysOverdue }}</td>
                  <td>{{ row.outstanding | number:'1.0-0' }}</td>
                  <td>{{ row.bucket }}</td>
                </tr>
                <tr *ngIf=\"!agingReport || agingReport.details.length === 0\">
                  <td colspan=\"7\" class=\"empty-cell\">No outstanding data.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Discount Report Tab -->
      <div *ngIf=\"activeTab === 'discounts'\" class=\"tab-panel\">
        <div class=\"filters-card\">
          <div class=\"filter-group wide\">
            <label class=\"filter-label\">Date Range</label>
            <div class=\"date-range\">
              <input
                type=\"date\"
                class=\"academy-input\"
                [(ngModel)]=\"filters.discountStart\"
                (change)=\"onFilterChange()\">
              <span class=\"date-separator\">to</span>
              <input
                type=\"date\"
                class=\"academy-input\"
                [(ngModel)]=\"filters.discountEnd\"
                (change)=\"onFilterChange()\">
            </div>
          </div>
          <div class=\"filter-group wide\">
            <label class=\"filter-label\">Discount Type</label>
            <app-dropdown
              [(ngModel)]=\"filters.discountId\"
              [options]=\"discountOptions\"
              placeholder=\"All Discounts\"
              [placeholderValue]=\"0\"
              [searchable]=\"true\"
              (changed)=\"onFilterChange()\">
            </app-dropdown>
          </div>
        </div>

        <div class=\"summary-grid\" *ngIf=\"discountReport\">
          <div class=\"summary-card card-discount\">
            <div class=\"card-icon\"><i class=\"fa fa-percent\"></i></div>
            <div class=\"card-data\">
              <span class=\"card-value\">{{ discountReport.totalAmount | number:'1.0-0' }}</span>
              <span class=\"card-label\">Total Discount Amount</span>
            </div>
          </div>
          <div class=\"summary-card card-discount\">
            <div class=\"card-icon\"><i class=\"fa fa-users\"></i></div>
            <div class=\"card-data\">
              <span class=\"card-value\">{{ discountReport.targetCount }}</span>
              <span class=\"card-label\">Students / Families</span>
            </div>
          </div>
        </div>

        <div class=\"academy-table-card\">
          <div class=\"academy-table-header\">
            <span class=\"academy-table-title\">
              <i class=\"fa fa-tags\"></i> Discount Report
            </span>
          </div>
          <div class=\"academy-table-responsive\">
            <table class=\"academy-table\">
              <thead>
                <tr>
                  <th>Discount Name</th>
                  <th>Scope</th>
                  <th>Student / Family</th>
                  <th>Challan #</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor=\"let row of discountReport?.rows\">
                  <td>{{ row.discountName }}</td>
                  <td>{{ row.scope }}</td>
                  <td>{{ row.targetName }}</td>
                  <td>{{ row.challanNumber }}</td>
                  <td>{{ row.amount | number:'1.0-0' }}</td>
                  <td>{{ row.appliedAt | date:'dd MMM yyyy' }}</td>
                </tr>
                <tr *ngIf=\"!discountReport || discountReport.rows.length === 0\">
                  <td colspan=\"6\" class=\"empty-cell\">No discounts applied in this period.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Income vs Expense Tab -->
      <div *ngIf=\"activeTab === 'income-expense'\" class=\"tab-panel\">
        <div class=\"filters-card\">
          <div class=\"filter-group wide\">
            <label class=\"filter-label\">Date Range</label>
            <div class=\"date-range\">
              <input
                type=\"date\"
                class=\"academy-input\"
                [(ngModel)]=\"filters.ieStart\"
                (change)=\"onFilterChange()\">
              <span class=\"date-separator\">to</span>
              <input
                type=\"date\"
                class=\"academy-input\"
                [(ngModel)]=\"filters.ieEnd\"
                (change)=\"onFilterChange()\">
            </div>
          </div>
        </div>

        <div class=\"summary-grid\" *ngIf=\"incomeExpenseReport\">
          <div class=\"summary-card card-income\">
            <div class=\"card-icon\"><i class=\"fa fa-arrow-circle-down\"></i></div>
            <div class=\"card-data\">
              <span class=\"card-value\">{{ incomeExpenseReport.income | number:'1.0-0' }}</span>
              <span class=\"card-label\">Fee Income</span>
            </div>
          </div>
          <div class=\"summary-card card-expense\">
            <div class=\"card-icon\"><i class=\"fa fa-arrow-circle-up\"></i></div>
            <div class=\"card-data\">
              <span class=\"card-value\">{{ incomeExpenseReport.expense | number:'1.0-0' }}</span>
              <span class=\"card-label\">Expenses</span>
            </div>
          </div>
          <div class=\"summary-card\" [ngClass]=\"incomeExpenseReport.net >= 0 ? 'card-surplus' : 'card-deficit'\">
            <div class=\"card-icon\"><i class=\"fa\" [ngClass]=\"incomeExpenseReport.net >= 0 ? 'fa-smile-o' : 'fa-frown-o'\"></i></div>
            <div class=\"card-data\">
              <span class=\"card-value\">{{ incomeExpenseReport.net | number:'1.0-0' }}</span>
              <span class=\"card-label\">Net (Income - Expense)</span>
            </div>
          </div>
        </div>

        <div class=\"academy-table-card\">
          <div class=\"academy-table-header\">
            <span class=\"academy-table-title\">
              <i class=\"fa fa-list\"></i> Income vs Expense (Sample Layout)
            </span>
          </div>
          <div class=\"academy-table-responsive\">
            <table class=\"academy-table\">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor=\"let row of incomeExpenseReport?.rows\">
                  <td>{{ row.type }}</td>
                  <td>{{ row.category }}</td>
                  <td>{{ row.amount | number:'1.0-0' }}</td>
                </tr>
                <tr *ngIf=\"!incomeExpenseReport || incomeExpenseReport.rows.length === 0\">
                  <td colspan=\"3\" class=\"empty-cell\">No income/expense data.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container { padding: 0; position: relative; }

    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content {
      display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;
    }
    .page-header-card h2 {
      margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.6rem;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0.25rem 0 0; font-size: 0.9rem; color: #6a8cad; }

    .btn {
      display: inline-flex; align-items: center; gap: 0.45rem;
      border-radius: 999px; border: none; cursor: pointer;
      padding: 0.55rem 1.25rem; font-size: 0.9rem; font-weight: 600;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff;
      box-shadow: 0 4px 14px rgba(30,58,95,0.35);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(30,58,95,0.4); }

    .tab-nav-card {
      background: #fff; border-radius: 12px; padding: 0.6rem;
      border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(15,23,42,0.04);
      display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;
    }
    .tab-btn {
      border-radius: 999px; border: 1px solid transparent; padding: 0.4rem 0.9rem;
      background: #f3f4f6; color: #374151; font-size: 0.85rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;
    }
    .tab-btn.active {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: #fff; border-color: transparent;
    }

    .tab-panel { margin-top: 1rem; }

    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.25rem; padding: 1rem 1.2rem;
      background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(15,23,42,0.04); flex-wrap: wrap; align-items: flex-end;
    }
    .filter-group {
      min-width: 200px; display: flex; flex-direction: column; gap: 0.3rem;
    }
    .filter-group.wide { min-width: 220px; }
    .filter-label {
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280;
      font-weight: 600;
    }
    .academy-input {
      padding: 0.6rem 0.9rem; border-radius: 0.75rem; border: 2px solid #d1d5db;
      font-size: 0.9rem; color: #111827;
    }
    .academy-input:focus {
      outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.12);
    }
    .date-range {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
    }
    .date-separator {
      font-size: 0.85rem; color: #6b7280;
    }

    .summary-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem; margin-bottom: 1.25rem;
    }
    .summary-card {
      background: #fff; border-radius: 12px; padding: 1.1rem 1.2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
      display: flex; align-items: center; gap: 0.85rem;
    }
    .summary-card .card-icon {
      width: 46px; height: 46px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; flex-shrink: 0; color: #fff;
    }
    .card-billed .card-icon { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); }
    .card-collected .card-icon { background: linear-gradient(135deg, #22c55e 0%, #15803d 100%); }
    .card-outstanding .card-icon { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
    .card-rate .card-icon { background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); }
    .card-discount .card-icon { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }
    .card-income .card-icon { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
    .card-expense .card-icon { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
    .card-surplus .card-icon { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
    .card-deficit .card-icon { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
    .summary-card .card-data {
      display: flex; flex-direction: column; gap: 0.15rem;
    }
    .summary-card .card-value {
      font-size: 1.3rem; font-weight: 700; color: #111827;
    }
    .summary-card .card-label {
      font-size: 0.85rem; color: #6b7280;
    }

    .academy-table-card {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
      margin-bottom: 1rem;
    }
    .academy-table-header {
      padding: 1rem 1.25rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;
    }
    .academy-table-title {
      font-size: 0.98rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.45rem;
    }
    .academy-table-responsive { overflow-x: auto; }
    .academy-table {
      width: 100%; border-collapse: collapse; font-size: 0.9rem;
    }
    .academy-table thead {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
    }
    .academy-table th,
    .academy-table td {
      padding: 0.8rem 1rem; border-bottom: 1px solid #e5e7eb; text-align: left;
    }
    .academy-table th {
      color: #fff; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .academy-table tbody tr:hover { background: #f7f9fc; }
    .empty-cell {
      text-align: center; padding: 1.5rem; color: #6b7280;
    }

    .aging-grid-card {
      background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
      padding: 1.2rem 1.25rem; margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(15,23,42,0.04);
    }
    .aging-grid-card h3 {
      margin: 0 0 0.75rem; font-size: 0.98rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .aging-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
    }
    .aging-item {
      border-radius: 10px; border: 1px dashed #d1d5db; padding: 0.75rem 0.9rem;
      background: #f9fafb; display: flex; flex-direction: column; gap: 0.15rem;
    }
    .aging-item .label {
      font-size: 0.85rem; font-weight: 600; color: #374151;
    }
    .aging-item .value {
      font-size: 0.9rem; font-weight: 700; color: #1e3a5f;
    }
    .aging-item .count {
      font-size: 0.78rem; color: #6b7280;
    }

    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: flex-start; }
      .filters-card { flex-direction: column; align-items: stretch; }
      .filter-group, .filter-group.wide { min-width: 100%; }
    }

    @media print {
      .page-header-card,
      .tab-nav-card,
      .filters-card,
      .btn { display: none !important; }
      .reports-container { padding: 0; }
      .academy-table-card { box-shadow: none; border: none; }
    }
  `]
})
export class FeeReportsComponent {
  loading = false;

  tabs = [
    { key: 'monthly', label: 'Monthly Summary', icon: 'fa-calendar' },
    { key: 'class-summary', label: 'Class-wise Summary', icon: 'fa-th-large' },
    { key: 'aging', label: 'Outstanding / Aging', icon: 'fa-clock-o' },
    { key: 'discounts', label: 'Discount Report', icon: 'fa-percent' },
    { key: 'income-expense', label: 'Income vs Expense', icon: 'fa-balance-scale' }
  ] as const;

  activeTab: (typeof this.tabs)[number]['key'] = 'monthly';

  // Filter options (dummy/static for now)
  monthOptions: DropdownOption[] = [
    { value: 0, label: 'All Months' },
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  yearOptions: DropdownOption[] = [];
  classOptions: DropdownOption[] = [];
  sessionOptions: DropdownOption[] = [];
  discountOptions: DropdownOption[] = [];

  filters: {
    month: number;
    year: number;
    classId: number;
    sessionId: number;
    asOfDate: string;
    discountStart: string;
    discountEnd: string;
    discountId: number;
    ieStart: string;
    ieEnd: string;
  } = {
    month: 0,
    year: new Date().getFullYear(),
    classId: 0,
    sessionId: 0,
    asOfDate: '',
    discountStart: '',
    discountEnd: '',
    discountId: 0,
    ieStart: '',
    ieEnd: ''
  };

  monthlyReport: MonthlySummaryReport | null = null;
  classSummaryRows: ClassSummaryReportRow[] = [];
  agingReport: AgingReport | null = null;
  discountReport: DiscountReport | null = null;
  incomeExpenseReport: IncomeExpenseReport | null = null;

  constructor(
    private feeService: FeeService,
    private notify: NotificationService
  ) {
    this.initYearOptions();
    this.initStaticDropdowns();
    this.initDefaultDates();
    this.loadCurrentTab();
  }

  private initYearOptions(): void {
    const currentYear = new Date().getFullYear();
    const years: DropdownOption[] = [];
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
      years.push({ value: y, label: y.toString() });
    }
    this.yearOptions = years;
  }

  private initStaticDropdowns(): void {
    this.classOptions = [
      { value: 0, label: 'All Classes' },
      { value: 1, label: 'Class 1' },
      { value: 2, label: 'Class 2' },
      { value: 3, label: 'Class 3' }
    ];

    this.sessionOptions = [
      { value: 0, label: 'All Sessions' },
      { value: 1, label: '2025-26' },
      { value: 2, label: '2024-25' }
    ];

    this.discountOptions = [
      { value: 0, label: 'All Discounts' },
      { value: 1, label: 'Sibling 10%' },
      { value: 2, label: 'Staff Child' }
    ];
  }

  private initDefaultDates(): void {
    const today = new Date();
    const iso = today.toISOString().substring(0, 10);
    this.filters.asOfDate = iso;
    this.filters.discountStart = iso;
    this.filters.discountEnd = iso;
    this.filters.ieStart = iso;
    this.filters.ieEnd = iso;
  }

  onFilterChange(): void {
    this.loadCurrentTab();
  }

  private loadCurrentTab(): void {
    switch (this.activeTab) {
      case 'monthly':
        this.loadMonthlySummary();
        break;
      case 'class-summary':
        this.loadClassSummary();
        break;
      case 'aging':
        this.loadAgingReport();
        break;
      case 'discounts':
        this.loadDiscountReport();
        break;
      case 'income-expense':
        this.loadIncomeExpenseReport();
        break;
    }
  }

  private loadMonthlySummary(): void {
    this.loading = true;
    const { month, year, classId } = this.filters;
    this.feeService.getMonthlySummaryReport(month || undefined, year || undefined, classId || undefined).subscribe({
      next: (report) => {
        this.monthlyReport = report;
      },
      error: () => {
        this.notify.error('Failed to load monthly summary report.');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private loadClassSummary(): void {
    this.loading = true;
    const { sessionId } = this.filters;
    this.feeService.getClassSummaryReport(sessionId || undefined).subscribe({
      next: (rows) => {
        this.classSummaryRows = rows;
      },
      error: () => {
        this.notify.error('Failed to load class-wise summary report.');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private loadAgingReport(): void {
    this.loading = true;
    const { asOfDate, classId } = this.filters;
    this.feeService.getAgingReport(asOfDate || undefined, classId || undefined).subscribe({
      next: (report) => {
        this.agingReport = report;
      },
      error: () => {
        this.notify.error('Failed to load aging report.');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private loadDiscountReport(): void {
    this.loading = true;
    const { discountStart, discountEnd, discountId } = this.filters;
    this.feeService.getDiscountReport(discountStart || undefined, discountEnd || undefined, discountId || undefined).subscribe({
      next: (report) => {
        this.discountReport = report;
      },
      error: () => {
        this.notify.error('Failed to load discount report.');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private loadIncomeExpenseReport(): void {
    this.loading = true;
    const { ieStart, ieEnd } = this.filters;
    this.feeService.getIncomeExpenseReport(ieStart || undefined, ieEnd || undefined).subscribe({
      next: (report) => {
        this.incomeExpenseReport = report;
      },
      error: () => {
        this.notify.error('Failed to load income vs expense report.');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getCurrentTabLabel(): string {
    const tab = this.tabs.find(t => t.key === this.activeTab);
    return tab ? tab.label : 'Report';
  }

  printCurrentTab(): void {
    window.print();
  }
}

