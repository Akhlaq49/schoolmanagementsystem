import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { FeeService } from '../../../../core/services/fee.service';
import { StudentService } from '../../../../core/services/student.service';
import { FamilyService } from '../../../../core/services/family/family.service';
import { FeeDiscount, CreateFeeDiscount } from '../../../../core/models/fee.model';

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
            (changed)="loadData()">
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
            (changed)="loadData()">
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

      <!-- Assign modal -->
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
            <div class="assign-search-section">
              <label>Select student or family</label>
              <div class="assign-search-wrap">
                <i class="fa fa-search"></i>
                <input
                  class="academy-input assign-search-input"
                  type="text"
                  [(ngModel)]="assignSearch"
                  [placeholder]="getAssignSearchPlaceholder()"
                  (input)="onAssignSearchInput()"
                  (focus)="assignSearchFocused = true"
                  (blur)="onAssignSearchBlur()">
              </div>
              <div class="assign-results" *ngIf="assignSearchFocused && assignSearch.trim().length >= 2">
                <div class="assign-results-loading" *ngIf="assignSearching">
                  <i class="fa fa-spinner fa-spin"></i> Searching...
                </div>
                <div class="assign-results-list" *ngIf="!assignSearching && assignSearchResults.length > 0">
                  <div
                    class="assign-result-item"
                    *ngFor="let item of assignSearchResults"
                    (mousedown)="selectAssignTarget(item)">
                    <span class="assign-result-type">{{ item.type === 'student' ? 'Student' : 'Family' }}</span>
                    <span class="assign-result-label">{{ item.label }}</span>
                    <span class="assign-result-sub" *ngIf="item.sublabel">{{ item.sublabel }}</span>
                  </div>
                </div>
                <div class="assign-results-empty" *ngIf="!assignSearching && assignSearch.trim().length >= 2 && assignSearchResults.length === 0">
                  No results found. Type at least 2 characters to search.
                </div>
              </div>
            </div>
            <div class="assign-selected" *ngIf="assignSelected">
              <span class="assign-selected-label">Selected: <strong>{{ assignSelected.label }}</strong></span>
              <button type="button" class="assign-clear-btn" (click)="clearAssignSelection()">
                <i class="fa fa-times"></i> Clear
              </button>
            </div>
            <div class="assign-current" *ngIf="assignments.length > 0">
              <strong>Currently assigned ({{ assignments.length }})</strong>
              <ul class="assignments-list">
                <li *ngFor="let a of assignments" class="assignment-item">
                  <span>{{ a.studentName || a.familyDisplayName }}</span>
                  <button type="button" class="assign-remove-btn" (click)="unassign(a)" title="Remove">
                    <i class="fa fa-times"></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeAssignModal()">Close</button>
            <button class="btn btn-primary" [disabled]="!assignSelected || assignSaving" (click)="doAssign()">
              <i class="fa fa-spinner fa-spin" *ngIf="assignSaving"></i>
              <i class="fa fa-save" *ngIf="!assignSaving"></i> Assign
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
    .assign-search-section { margin-bottom: 1rem; position: relative; }
    .assign-search-section label { display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 600; color: #1e3a5f; }
    .assign-search-wrap { position: relative; }
    .assign-search-wrap i { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.85rem; }
    .assign-search-input { padding-left: 2.25rem; width: 100%; }
    .assign-results {
      position: absolute; left: 0; right: 0; top: 100%; margin-top: 0.25rem;
      background: #fff; border: 2px solid #1e3a5f; border-radius: 0.5rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12); max-height: 360px; overflow-y: auto;
      z-index: 10;
    }
    .assign-results-loading { padding: 1rem; text-align: center; color: #6b7280; font-size: 0.85rem; }
    .assign-results-list { padding: 0.35rem 0; }
    .assign-result-item {
      padding: 0.6rem 0.9rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.15rem;
      transition: background 0.15s; border-bottom: 1px solid #f3f4f6;
    }
    .assign-result-item:last-child { border-bottom: none; }
    .assign-result-item:hover { background: #eef2f7; }
    .assign-result-type { font-size: 0.7rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
    .assign-result-label { font-weight: 600; color: #111827; }
    .assign-result-sub { font-size: 0.8rem; color: #6b7280; }
    .assign-results-empty { padding: 1rem; color: #6b7280; font-size: 0.85rem; }
    .assign-selected {
      padding: 0.75rem 1rem; background: #eef2f7; border-radius: 0.5rem;
      display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 1rem;
    }
    .assign-clear-btn {
      padding: 0.25rem 0.5rem; font-size: 0.78rem; border-radius: 0.375rem;
      border: 1px solid #d1d5db; background: #fff; color: #6b7280; cursor: pointer;
    }
    .assign-clear-btn:hover { background: #f3f4f6; color: #111827; }
    .assign-current { margin-top: 0.75rem; }
    .assign-current strong { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; }
    .assignments-list { list-style: none; margin: 0; padding: 0; max-height: 140px; overflow-y: auto; }
    .assignment-item {
      display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.6rem;
      background: #f9fafb; border-radius: 0.375rem; margin-bottom: 0.25rem; font-size: 0.88rem;
    }
    .assign-remove-btn {
      padding: 0.15rem 0.35rem; border: none; background: #fecaca; color: #b91c1c; border-radius: 0.25rem;
      cursor: pointer; font-size: 0.75rem;
    }
    .assign-remove-btn:hover { background: #fca5a5; }

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

  discounts: FeeDiscount[] = [];
  filteredDiscounts: FeeDiscount[] = [];
  pagedDiscounts: FeeDiscount[] = [];

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
  form: Partial<FeeDiscount> & { name: string; type: 'percentage' | 'fixed'; value: number; scope: 'student' | 'family' | 'both'; isActive: boolean } = {
    feeDiscountId: 0,
    name: '',
    type: 'percentage',
    value: 0,
    scope: 'student',
    description: '',
    isActive: true,
    assignedCount: 0
  };

  showAssignModal = false;
  assigningDiscount: FeeDiscount | null = null;
  assignSearch = '';
  assignSearchFocused = false;
  assignSearching = false;
  assignSearchResults: { type: 'student' | 'family'; id: number; label: string; sublabel?: string }[] = [];
  assignSelected: { type: 'student' | 'family'; id: number; label: string; sublabel?: string } | null = null;
  assignments: { feeDiscountAssignmentId: number; studentId?: number; familyId?: number; studentName?: string; familyDisplayName?: string }[] = [];
  assignSaving = false;
  private assignSearchDebounce: ReturnType<typeof setTimeout> | null = null;

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

  private allFamilies: { familyId: number; fatherName: string; motherName?: string }[] = [];

  constructor(
    private notify: NotificationService,
    private feeService: FeeService,
    private studentService: StudentService,
    private familyService: FamilyService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const scope = this.filterScope || undefined;
    const status = this.filterStatus || undefined;
    this.feeService.getDiscounts(scope, status).subscribe({
      next: (list) => {
        this.discounts = list;
        this.applyFilters();
      },
      error: () => {
        this.notify.error('Failed to load discount types.');
      },
      complete: () => { this.loading = false; }
    });
  }

  getScopeLabel(scope: FeeDiscount['scope']): string {
    switch (scope) {
      case 'student': return 'Student';
      case 'family': return 'Family';
      case 'both': return 'Student & Family';
      default: return scope;
    }
  }

  openForm(discount?: FeeDiscount): void {
    this.submitted = false;
    if (discount) {
      this.editing = true;
      this.form = { ...discount };
    } else {
      this.editing = false;
      this.form = {
        feeDiscountId: 0,
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
    if (!this.form.name?.trim() || this.form.value == null) {
      return;
    }

    const dto: CreateFeeDiscount = {
      name: this.form.name.trim(),
      type: this.form.type ?? 'percentage',
      value: this.form.value,
      scope: this.form.scope ?? 'student',
      description: this.form.description?.trim() || undefined,
      isActive: this.form.isActive ?? true
    };

    if (this.editing && this.form.feeDiscountId) {
      this.feeService.updateDiscount(this.form.feeDiscountId, dto).subscribe({
        next: () => {
          this.notify.success('Discount type updated.');
          this.showForm = false;
          this.loadData();
        },
        error: () => this.notify.error('Failed to update discount.')
      });
    } else {
      this.feeService.createDiscount(dto).subscribe({
        next: () => {
          this.notify.success('Discount type created.');
          this.showForm = false;
          this.loadData();
        },
        error: () => this.notify.error('Failed to create discount.')
      });
    }
  }

  edit(d: FeeDiscount): void {
    this.openForm(d);
  }

  remove(d: FeeDiscount): void {
    if (!confirm('Delete this discount type? Assignments will be removed.')) return;
    this.feeService.deleteDiscount(d.feeDiscountId).subscribe({
      next: () => {
        this.notify.success('Discount type deleted.');
        this.loadData();
      },
      error: () => this.notify.error('Failed to delete discount.')
    });
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

  openAssignModal(d: FeeDiscount): void {
    this.assigningDiscount = d;
    this.assignSearch = '';
    this.assignSearchFocused = false;
    this.assignSearchResults = [];
    this.assignSelected = null;
    this.assignments = [];
    this.showAssignModal = true;
    this.loadAssignments();
    if (d.scope === 'family' || d.scope === 'both') {
      this.familyService.getAllFamilies().subscribe({
        next: (families) => {
          this.allFamilies = families.map(f => ({
            familyId: f.familyId!,
            fatherName: f.fatherName,
            motherName: f.motherName
          }));
        },
        error: () => {}
      });
    } else {
      this.allFamilies = [];
    }
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.assigningDiscount = null;
    if (this.assignSearchDebounce) clearTimeout(this.assignSearchDebounce);
  }

  getAssignSearchPlaceholder(): string {
    if (!this.assigningDiscount) return 'Search...';
    const s = this.assigningDiscount.scope;
    if (s === 'student') return 'Search students by name or roll...';
    if (s === 'family') return 'Search families by father/mother name...';
    return 'Search students or families...';
  }

  loadAssignments(): void {
    if (!this.assigningDiscount) return;
    this.feeService.getDiscountAssignments(this.assigningDiscount.feeDiscountId).subscribe({
      next: (list) => this.assignments = list,
      error: () => {}
    });
  }

  onAssignSearchInput(): void {
    if (this.assignSearchDebounce) clearTimeout(this.assignSearchDebounce);
    const term = this.assignSearch.trim();
    if (term.length < 2) {
      this.assignSearchResults = [];
      return;
    }
    this.assignSearchDebounce = setTimeout(() => this.runAssignSearch(term), 300);
  }

  onAssignSearchBlur(): void {
    setTimeout(() => { this.assignSearchFocused = false; }, 200);
  }

  private runAssignSearch(term: string): void {
    if (!this.assigningDiscount) return;
    const scope = this.assigningDiscount.scope;
    const results: { type: 'student' | 'family'; id: number; label: string; sublabel?: string }[] = [];
    const assignedStudentIds = new Set(
      this.assignments.filter(a => a.studentId != null).map(a => a.studentId!)
    );
    const assignedFamilyIds = new Set(
      this.assignments.filter(a => a.familyId != null).map(a => a.familyId!)
    );
    const t = term.toLowerCase();

    const addStudents = (students: { studentId: number; name: string; roll?: string }[]) => {
      students.forEach(s => {
        if (!assignedStudentIds.has(s.studentId)) {
          results.push({
            type: 'student',
            id: s.studentId,
            label: s.name,
            sublabel: s.roll ? `Roll: ${s.roll}` : undefined
          });
        }
      });
    };

    const addFamilies = (families: { familyId: number; fatherName: string; motherName?: string }[]) => {
      families.forEach(f => {
        if (!assignedFamilyIds.has(f.familyId)) {
          const label = f.fatherName + (f.motherName ? ` / ${f.motherName}` : '');
          results.push({ type: 'family', id: f.familyId, label, sublabel: 'Family' });
        }
      });
    };

    if (scope === 'student' || scope === 'both') {
      this.assignSearching = true;
      this.studentService.searchActiveStudents(term).subscribe({
        next: (students) => {
          addStudents(students);
          if (scope === 'both') {
            const fams = this.allFamilies.filter(f =>
              (f.fatherName || '').toLowerCase().includes(t) ||
              (f.motherName || '').toLowerCase().includes(t)
            );
            addFamilies(fams);
          }
          this.assignSearchResults = results.slice(0, 30);
          this.assignSearching = false;
        },
        error: () => { this.assignSearching = false; this.assignSearchResults = []; }
      });
    } else {
      const fams = this.allFamilies.filter(f =>
        (f.fatherName || '').toLowerCase().includes(t) ||
        (f.motherName || '').toLowerCase().includes(t)
      );
      addFamilies(fams);
      this.assignSearchResults = results.slice(0, 30);
    }
  }

  selectAssignTarget(item: { type: 'student' | 'family'; id: number; label: string; sublabel?: string }): void {
    this.assignSelected = item;
    this.assignSearch = '';
    this.assignSearchResults = [];
    this.assignSearchFocused = false;
  }

  clearAssignSelection(): void {
    this.assignSelected = null;
  }

  doAssign(): void {
    if (!this.assignSelected || !this.assigningDiscount) return;
    this.assignSaving = true;
    const discountId = this.assigningDiscount.feeDiscountId;
    const obs = this.assignSelected.type === 'student'
      ? this.feeService.assignDiscountToStudent(discountId, this.assignSelected.id)
      : this.feeService.assignDiscountToFamily(discountId, this.assignSelected.id);
    obs.subscribe({
      next: () => {
        this.notify.success('Discount assigned successfully.');
        this.assignSelected = null;
        this.loadAssignments();
        this.loadData();
      },
      error: (err) => {
        this.notify.error(err?.error?.message || 'Failed to assign discount.');
      },
      complete: () => { this.assignSaving = false; }
    });
  }

  unassign(a: { feeDiscountAssignmentId: number }): void {
    if (!confirm('Remove this assignment?')) return;
    this.feeService.unassignDiscount(a.feeDiscountAssignmentId).subscribe({
      next: () => {
        this.notify.success('Assignment removed.');
        this.loadAssignments();
        this.loadData();
      },
      error: () => this.notify.error('Failed to remove assignment.')
    });
  }
}

