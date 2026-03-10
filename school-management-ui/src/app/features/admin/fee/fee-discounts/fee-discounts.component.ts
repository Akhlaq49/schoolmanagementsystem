import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { NotificationService } from '../../../../shared/services/notification.service';

interface Discount {
  id: number;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'student' | 'family' | 'both';
  description?: string;
  isActive: boolean;
  assignedCount: number;
}

@Component({
  selector: 'app-fee-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent, LoadingComponent],
  template: `
    <div class="discounts-container">
      <app-loading [show]="loading" [message]="'Loading discounts...'"></app-loading>

      <!-- Header -->
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-percent"></i> Fee Discounts</h2>
            <p class="page-subtitle">
              Manage discount types (sibling, scholarship, staff-child) and assign them to students or families.
            </p>
          </div>
          <button class="btn btn-primary" (click)="openForm()">
            <i class="fa fa-plus"></i> Add Discount Type
          </button>
        </div>
      </div>

      <!-- Add / Edit form -->
      <div *ngIf="showForm" class="academy-form-card">
        <h3>
          <i class="fa" [ngClass]="editing ? 'fa-edit' : 'fa-plus-circle'"></i>
          {{ editing ? 'Edit Discount Type' : 'New Discount Type' }}
        </h3>

        <form (ngSubmit)="save()">
          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Discount Name <span class="required">*</span></label>
              <input
                class="academy-input"
                type="text"
                name="name"
                [(ngModel)]="form.name"
                placeholder="e.g. Sibling 10%, Scholarship 50%, Staff-child 100%"
                [class.is-invalid]="submitted && !form.name?.trim()">
              <div *ngIf="submitted && !form.name?.trim()" class="academy-invalid">
                Name is required
              </div>
            </div>
            <div class="academy-form-group">
              <label>Applies To <span class="required">*</span></label>
              <app-dropdown
                [(ngModel)]="form.scope"
                [ngModelOptions]="{ standalone: true }"
                [options]="scopeOptions"
                placeholder="Select scope"
                [showPlaceholderOption]="false">
              </app-dropdown>
            </div>
          </div>

          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Discount Type <span class="required">*</span></label>
              <app-dropdown
                [(ngModel)]="form.type"
                [ngModelOptions]="{ standalone: true }"
                [options]="typeOptions"
                placeholder="Select type"
                [showPlaceholderOption]="false">
              </app-dropdown>
            </div>
            <div class="academy-form-group">
              <label>Value <span class="required">*</span></label>
              <div class="value-input">
                <input
                  class="academy-input"
                  type="number"
                  name="value"
                  [(ngModel)]="form.value"
                  min="0"
                  step="0.01"
                  [placeholder]="form.type === 'percentage' ? 'e.g. 10 for 10%' : 'e.g. 1000 for PKR 1,000'"
                  [class.is-invalid]="submitted && !form.value">
                <span class="suffix" *ngIf="form.type === 'percentage'">%</span>
                <span class="suffix" *ngIf="form.type === 'fixed'">PKR</span>
              </div>
              <div *ngIf="submitted && !form.value" class="academy-invalid">
                Value is required
              </div>
            </div>
          </div>

          <div class="academy-form-row single-col">
            <div class="academy-form-group">
              <label>Description</label>
              <textarea
                class="academy-input"
                rows="2"
                name="description"
                [(ngModel)]="form.description"
                placeholder="Optional notes, eligibility criteria, etc.">
              </textarea>
            </div>
          </div>

          <div class="academy-form-row single-col">
            <label class="switch-label">
              <input type="checkbox" [(ngModel)]="form.isActive" [ngModelOptions]="{ standalone: true }">
              <span>Active</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fa fa-save"></i> {{ editing ? 'Save Changes' : 'Create Discount' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Filters + stats row -->
      <div class="filters-card">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input
            class="modern-form-control search-input"
            placeholder="Search discount by name, type, scope..."
            [(ngModel)]="searchTerm"
            (input)="applyFilters()">
        </div>
        <div class="filter-group">
          <label class="filter-label">Scope</label>
          <app-dropdown
            [(ngModel)]="filterScope"
            [options]="scopeFilterOptions"
            placeholder="All"
            [placeholderValue]="''"
            [searchable]="false"
            (changed)="applyFilters()">
          </app-dropdown>
        </div>
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <app-dropdown
            [(ngModel)]="filterStatus"
            [options]="statusOptions"
            placeholder="All"
            [placeholderValue]="''"
            [searchable]="false"
            (changed)="applyFilters()">
          </app-dropdown>
        </div>
        <div class="filter-summary">
          <span><strong>{{ filteredDiscounts.length }}</strong> discount type(s)</span>
          <span>Assigned to <strong>{{ totalAssigned }}</strong> students / families</span>
        </div>
      </div>

      <!-- Discounts table -->
      <div class="academy-table-card">
        <div class="academy-table-header">
          <span class="academy-table-title">
            <i class="fa fa-table"></i> Discount Types
          </span>
          <span class="academy-table-count">
            <i class="fa fa-database"></i> {{ filteredDiscounts.length }} record{{ filteredDiscounts.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="academy-table-responsive">
          <table class="academy-table" *ngIf="pagedDiscounts.length > 0; else emptyState">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th>Applies To</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of pagedDiscounts; let i = index">
                <td><span class="id-badge">{{ (currentPage - 1) * pageSize + i + 1 }}</span></td>
                <td>
                  <div class="discount-name">{{ d.name }}</div>
                  <div class="discount-desc" *ngIf="d.description">{{ d.description }}</div>
                </td>
                <td>{{ d.type === 'percentage' ? 'Percentage' : 'Fixed amount' }}</td>
                <td>
                  <ng-container [ngSwitch]="d.type">
                    <span *ngSwitchCase="'percentage'">{{ d.value }}%</span>
                    <span *ngSwitchCase="'fixed'">{{ d.value | number:'1.0-0' }} PKR</span>
                  </ng-container>
                </td>
                <td>
                  <span class="scope-pill" [ngClass]="'scope-' + d.scope">
                    {{ getScopeLabel(d.scope) }}
                  </span>
                </td>
                <td>
                  <span class="status-pill" [ngClass]="d.isActive ? 'active' : 'inactive'">
                    {{ d.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <span class="assigned-pill">
                    <i class="fa fa-user"></i> {{ d.assignedCount }}
                  </span>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-assign" (click)="openAssignModal(d)" title="Assign to students/families">
                      <i class="fa fa-users"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-edit" (click)="edit(d)" title="Edit">
                      <i class="fa fa-edit"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-delete" (click)="remove(d)" title="Delete">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyState>
            <div class="academy-table-empty">
              <i class="fa fa-tags"></i>
              <p>No discount types defined yet. Click “Add Discount Type” to create one.</p>
            </div>
          </ng-template>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="totalPages > 1">
          <span class="pagination-info">
            Showing
            {{ (currentPage - 1) * pageSize + 1 }}
            –
            {{
              currentPage * pageSize > filteredDiscounts.length
                ? filteredDiscounts.length
                : currentPage * pageSize
            }}
            of {{ filteredDiscounts.length }}
          </span>
          <div class="pagination-controls">
            <button class="page-btn" (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fa fa-chevron-left"></i>
            </button>
            <button
              *ngFor="let p of pageNumbers"
              class="page-num"
              [class.active]="p === currentPage"
              (click)="changePage(p)">
              {{ p }}
            </button>
            <button class="page-btn" (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Assign modal (UI only, no backend yet) -->
      <div class="modal-backdrop" *ngIf="showAssignModal" (click)="closeAssignModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="fa fa-users"></i> Assign Discount</h3>
            <button class="modal-close" (click)="closeAssignModal()"><i class="fa fa-times"></i></button>
          </div>
          <div class="modal-body" *ngIf="assigningDiscount">
            <p class="assign-intro">
              Assign <strong>{{ assigningDiscount.name }}</strong> to students or families.
            </p>
            <div class="academy-form-row single-col">
              <div class="academy-form-group">
                <label>Search students / families</label>
                <input
                  class="academy-input"
                  [(ngModel)]="assignSearch"
                  placeholder="Search by name, roll, or family..."
                  (input)="onAssignSearchChange()">
              </div>
            </div>
            <div class="assign-placeholder">
              <i class="fa fa-info-circle"></i>
              <p>
                This is a UI-only placeholder. Once backend APIs are ready, this section will list students/families
                and allow you to assign/unassign this discount.
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeAssignModal()">Close</button>
            <button class="btn btn-primary" disabled>
              <i class="fa fa-save"></i> Save Assignments (coming soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .discounts-container { padding: 0; position: relative; }

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
    }
    .btn-primary {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff;
      box-shadow: 0 4px 14px rgba(30,58,95,0.35);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(30,58,95,0.4); }
    .btn-secondary {
      background: #6b7280; color: #fff;
    }
    .btn-secondary:hover { background: #4b5563; }

    .academy-form-card {
      background: #fff; border-radius: 16px; border: 1px solid #e5e7eb;
      padding: 1.5rem 1.75rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(15,23,42,0.06);
    }
    .academy-form-card h3 {
      margin: 0 0 1rem; font-size: 1.05rem; font-weight: 700; color: #0f172a;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .academy-form-row {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.4rem; margin-bottom: 1.2rem;
    }
    .academy-form-row.single-col { grid-template-columns: 1fr; }
    .academy-form-group { display: flex; flex-direction: column; }
    .academy-form-group label {
      margin-bottom: 0.4rem; font-size: 0.85rem; font-weight: 600; color: #1e3a5f;
    }
    .academy-input {
      padding: 0.7rem 0.9rem; border-radius: 0.75rem; border: 2px solid #d1d5db;
      font-size: 0.9rem; color: #111827;
    }
    .academy-input:focus {
      outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.12);
    }
    .academy-input.is-invalid { border-color: #dc2626; }
    .academy-invalid {
      margin-top: 0.3rem; font-size: 0.78rem; color: #b91c1c;
    }
    .required { color: #dc2626; }

    .value-input {
      position: relative; display: flex; align-items: center;
    }
    .value-input .suffix {
      position: absolute; right: 0.75rem; font-size: 0.8rem; color: #6b7280;
    }

    .switch-label {
      display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.9rem; color: #374151;
    }

    .form-actions {
      display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem;
    }

    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.25rem; padding: 1rem 1.2rem;
      background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(15,23,42,0.04); flex-wrap: wrap; align-items: center;
    }
    .search-box { position: relative; flex: 1; min-width: 220px; }
    .search-box i {
      position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
      color: #9ca3af; z-index: 1;
    }
    .modern-form-control {
      padding: 0.6rem 0.9rem 0.6rem 2.6rem; border-radius: 0.75rem; border: 2px solid #d1d5db;
      font-size: 0.9rem; width: 100%; color: #111827;
    }
    .filter-group {
      min-width: 160px; display: flex; flex-direction: column; gap: 0.2rem;
    }
    .filter-label {
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280;
    }
    .filter-summary {
      margin-left: auto; font-size: 0.85rem; color: #4b5563; display: flex; flex-direction: column; gap: 0.15rem;
      min-width: 190px;
    }

    .academy-table-card {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-table-header {
      padding: 1rem 1.25rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;
    }
    .academy-table-title {
      font-size: 0.98rem; font-weight: 700; color: #0f2744; display: flex; align-items: center; gap: 0.45rem;
    }
    .academy-table-count { font-size: 0.85rem; color: #6b7280; display: flex; align-items: center; gap: 0.35rem; }
    .academy-table-responsive { overflow-x: auto; }

    .academy-table {
      width: 100%; border-collapse: collapse; font-size: 0.9rem;
    }
    .academy-table thead { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); }
    .academy-table th,
    .academy-table td {
      padding: 0.8rem 1rem; border-bottom: 1px solid #e5e7eb; text-align: left;
    }
    .academy-table th {
      color: #fff; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .academy-table tbody tr:hover { background: #f7f9fc; }

    .id-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 28px; height: 24px; border-radius: 999px;
      background: #eef2f7; color: #4b5563; font-weight: 600; font-size: 0.8rem;
    }
    .discount-name { font-weight: 600; color: #111827; }
    .discount-desc { font-size: 0.8rem; color: #6b7280; margin-top: 0.15rem; }

    .scope-pill {
      padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600;
    }
    .scope-student { background: #eef2f7; color: #1e3a5f; }
    .scope-family { background: #fef3c7; color: #92400e; }
    .scope-both { background: #eef2f7; color: #2c5282; }

    .status-pill {
      padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600;
    }
    .status-pill.active { background: #dcfce7; color: #166534; }
    .status-pill.inactive { background: #e5e7eb; color: #4b5563; }

    .assigned-pill {
      display: inline-flex; align-items: center; gap: 0.25rem;
      padding: 0.15rem 0.55rem; border-radius: 999px; background: rgba(30,58,95,0.08); color: #1e3a5f;
      font-size: 0.78rem;
    }

    .modern-table-actions { display: flex; gap: 0.35rem; }
    .modern-btn-icon {
      width: 30px; height: 30px; border-radius: 8px; border: none;
      display: inline-flex; align-items: center; justify-content: center;
      color: #fff; font-size: 0.8rem; cursor: pointer;
    }
    .modern-btn-assign { background: #059669; }
    .modern-btn-assign:hover { background: #047857; }
    .modern-btn-edit { background: #1e3a5f; }
    .modern-btn-edit:hover { background: #2c5282; }
    .modern-btn-delete { background: #ef4444; }
    .modern-btn-delete:hover { background: #dc2626; }

    .academy-table-empty {
      padding: 2.5rem 1.5rem; text-align: center; color: #6b7280;
    }
    .academy-table-empty i { font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5f5; display: block; }

    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.25rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 0.6rem;
    }
    .pagination-info { font-size: 0.8rem; color: #6b7280; }
    .pagination-controls { display: flex; gap: 0.25rem; }
    .page-btn, .page-num {
      border-radius: 999px; border: 1px solid #e5e7eb; background: #fff;
      padding: 0.25rem 0.6rem; font-size: 0.78rem; cursor: pointer; min-width: 26px;
    }
    .page-num.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-card {
      background: #fff; border-radius: 16px; max-width: 560px; width: 100%;
      box-shadow: 0 25px 60px rgba(0,0,0,0.25); display: flex; flex-direction: column; max-height: 90vh;
    }
    .modal-header {
      padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid #e5e7eb;
    }
    .modal-header h3 {
      margin: 0; font-size: 1rem; font-weight: 700; color: #111827;
      display: flex; align-items: center; gap: 0.45rem;
    }
    .modal-close {
      width: 32px; height: 32px; border-radius: 999px; border: none; background: #f3f4f6; color: #4b5563;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .modal-body { padding: 1.25rem 1.5rem; overflow-y: auto; }
    .modal-footer {
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 0.75rem;
    }
    .assign-intro { font-size: 0.9rem; color: #374151; margin-bottom: 0.9rem; }
    .assign-placeholder {
      margin-top: 0.75rem; padding: 0.85rem 1rem; border-radius: 10px;
      background: #eef2f7; color: #435d7a; font-size: 0.85rem;
      display: flex; gap: 0.5rem; align-items: flex-start;
    }
    .assign-placeholder i { margin-top: 0.1rem; }

    @media (max-width: 768px) {
      .academy-form-row { grid-template-columns: 1fr; }
      .filters-card { flex-direction: column; align-items: stretch; }
      .filter-summary { margin-left: 0; }
      .page-header-card { padding: 1.25rem 1.25rem; }
    }
  `]
})
export class FeeDiscountsComponent implements OnInit {
  loading = false;

  discounts: Discount[] = [];
  filteredDiscounts: Discount[] = [];
  pagedDiscounts: Discount[] = [];

  searchTerm = '';
  filterScope = '';
  filterStatus = '';

  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];

  totalAssigned = 0;

  showForm = false;
  editing = false;
  submitted = false;
  form: Discount = {
    id: 0,
    name: '',
    type: 'percentage',
    value: 0,
    scope: 'student',
    description: '',
    isActive: true,
    assignedCount: 0
  };

  showAssignModal = false;
  assigningDiscount: Discount | null = null;
  assignSearch = '';

  scopeOptions: DropdownOption[] = [
    { value: 'student', label: 'Student' },
    { value: 'family', label: 'Family' },
    { value: 'both', label: 'Student & Family' }
  ];

  typeOptions: DropdownOption[] = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed amount (PKR)' }
  ];

  scopeFilterOptions: DropdownOption[] = [
    { value: 'student', label: 'Student' },
    { value: 'family', label: 'Family' },
    { value: 'both', label: 'Student & Family' }
  ];

  statusOptions: DropdownOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  constructor(private notify: NotificationService) {}

  ngOnInit(): void {
    this.seedSampleData();
    this.applyFilters();
  }

  seedSampleData(): void {
    this.discounts = [
      {
        id: 1,
        name: 'Sibling Discount 10%',
        type: 'percentage',
        value: 10,
        scope: 'family',
        description: 'Automatically applies when two or more siblings are enrolled.',
        isActive: true,
        assignedCount: 24
      },
      {
        id: 2,
        name: 'Scholarship 50%',
        type: 'percentage',
        value: 50,
        scope: 'student',
        description: 'Merit-based scholarship for top-performing students.',
        isActive: true,
        assignedCount: 8
      },
      {
        id: 3,
        name: 'Staff-child 100%',
        type: 'percentage',
        value: 100,
        scope: 'both',
        description: 'Full fee waiver for children of full-time staff.',
        isActive: true,
        assignedCount: 5
      },
      {
        id: 4,
        name: 'Need-based Aid 25%',
        type: 'percentage',
        value: 25,
        scope: 'family',
        description: 'Approved by principal on documented financial need.',
        isActive: false,
        assignedCount: 3
      }
    ];
  }

  getScopeLabel(scope: Discount['scope']): string {
    switch (scope) {
      case 'student': return 'Student';
      case 'family': return 'Family';
      case 'both': return 'Student & Family';
      default: return scope;
    }
  }

  openForm(discount?: Discount): void {
    this.submitted = false;
    if (discount) {
      this.editing = true;
      this.form = { ...discount };
    } else {
      this.editing = false;
      this.form = {
        id: 0,
        name: '',
        type: 'percentage',
        value: 0,
        scope: 'student',
        description: '',
        isActive: true,
        assignedCount: 0
      };
    }
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  save(): void {
    this.submitted = true;
    if (!this.form.name?.trim() || !this.form.value) {
      return;
    }

    if (this.editing) {
      const idx = this.discounts.findIndex(d => d.id === this.form.id);
      if (idx >= 0) {
        this.discounts[idx] = { ...this.form };
      }
      this.notify.success('Discount type updated.');
    } else {
      const nextId = this.discounts.length ? Math.max(...this.discounts.map(d => d.id)) + 1 : 1;
      this.discounts.push({ ...this.form, id: nextId });
      this.notify.success('Discount type created.');
    }

    this.showForm = false;
    this.applyFilters();
  }

  edit(d: Discount): void {
    this.openForm(d);
  }

  remove(d: Discount): void {
    this.discounts = this.discounts.filter(x => x.id !== d.id);
    this.notify.success('Discount type deleted.');
    this.applyFilters();
  }

  applyFilters(): void {
    let list = [...this.discounts];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(term) ||
        (d.description || '').toLowerCase().includes(term)
      );
    }

    if (this.filterScope) {
      list = list.filter(d => d.scope === this.filterScope);
    }

    if (this.filterStatus) {
      const active = this.filterStatus === 'active';
      list = list.filter(d => d.isActive === active);
    }

    this.filteredDiscounts = list;
    this.totalAssigned = list.reduce((sum, d) => sum + d.assignedCount, 0);
    this.currentPage = 1;
    this.paginate();
  }

  paginate(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredDiscounts.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedDiscounts = this.filteredDiscounts.slice(start, start + this.pageSize);
    this.buildPageNumbers();
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.paginate();
  }

  buildPageNumbers(): void {
    const maxVisible = 5;
    const pages: number[] = [];
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    this.pageNumbers = pages;
  }

  openAssignModal(d: Discount): void {
    this.assigningDiscount = d;
    this.assignSearch = '';
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.assigningDiscount = null;
  }

  onAssignSearchChange(): void {
    // UI-only placeholder; no actual search yet
  }
}

