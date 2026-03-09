import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeeService } from '../../../../core/services/fee.service';
import { ClassService } from '../../../../core/services/class.service';
import { AcademicSessionService } from '../../../../core/services/academic-session.service';
import { FeeAddonService } from '../../../../core/services/family/fee-addon.service';
import { FeeStructure, FeeStructureAddon, CreateFeeStructure, UpdateFeeStructure } from '../../../../core/models/fee.model';
import { Class } from '../../../../core/models/student.model';
import { AcademicSession } from '../../../../core/models/academic-session.model';
import { FeeAddon } from '../../../../core/models/fee-addon.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-fee-structures',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ConfirmDialogComponent],
  template: `
    <div class="fee-structures-container">
      <app-loading [show]="loading" [message]="'Loading fee structures...'"></app-loading>

      <!-- ─── Page Header ─────────────────────────────────────── -->
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-list-alt"></i> Fee Structures</h2>
            <p class="page-subtitle">Define monthly fee plans per class and session with add-on charges</p>
          </div>
          <button class="btn btn-primary" (click)="openAddForm()" [disabled]="loading">
            <i class="fa fa-plus"></i> Add Fee Structure
          </button>
        </div>
      </div>

      <!-- ─── Add / Edit Form ─────────────────────────────────── -->
      <div *ngIf="showForm" class="academy-form-card">
        <h3><i class="fa" [ngClass]="editing ? 'fa-edit' : 'fa-plus-circle'"></i> {{ editing ? 'Edit Fee Structure' : 'New Fee Structure' }}</h3>

        <form (ngSubmit)="save()">
          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Structure Name <span class="required">*</span></label>
              <input type="text" class="academy-input" [(ngModel)]="form.name" name="name"
                placeholder="e.g. Grade 5 — Monthly Fee" [class.is-invalid]="submitted && !form.name?.trim()">
              <div *ngIf="submitted && !form.name?.trim()" class="academy-invalid">Name is required</div>
            </div>
            <div class="academy-form-group">
              <label>Academic Session <span class="required">*</span></label>
              <select class="academy-input" [(ngModel)]="form.academicSessionId" name="sessionId"
                [class.is-invalid]="submitted && !form.academicSessionId">
                <option [ngValue]="null" disabled>Select Session</option>
                <option *ngFor="let s of sessions" [ngValue]="s.academicSessionId">
                  {{ s.name }}{{ s.isCurrent ? ' (Current)' : '' }}
                </option>
              </select>
              <div *ngIf="submitted && !form.academicSessionId" class="academy-invalid">Session is required</div>
            </div>
          </div>

          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Class <span class="required">*</span></label>
              <select class="academy-input" [(ngModel)]="form.classId" name="classId"
                (ngModelChange)="onClassChange($event)"
                [class.is-invalid]="submitted && !form.classId">
                <option [ngValue]="null" disabled>Select Class</option>
                <option *ngFor="let c of classes" [ngValue]="c.classId">{{ c.name }}</option>
              </select>
              <div *ngIf="submitted && !form.classId" class="academy-invalid">Class is required</div>
            </div>
            <div class="academy-form-group">
              <label>Monthly Amount (PKR) <span class="required">*</span></label>
              <input type="number" class="academy-input" [(ngModel)]="form.monthlyAmount" name="monthlyAmount"
                min="0" step="1" placeholder="e.g. 5000"
                [class.is-invalid]="submitted && (!form.monthlyAmount || form.monthlyAmount <= 0)">
              <div *ngIf="submitted && (!form.monthlyAmount || form.monthlyAmount <= 0)" class="academy-invalid">Amount must be greater than 0</div>
            </div>
          </div>

          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Due Day of Month <span class="required">*</span></label>
              <input type="number" class="academy-input" [(ngModel)]="form.dueDayOfMonth" name="dueDay"
                min="1" max="28" placeholder="e.g. 10">
              <div class="form-hint">1–28 · Fee will be due on this day every month</div>
            </div>
            <div class="academy-form-group">
              <label>Late Fine Per Day (PKR)</label>
              <input type="number" class="academy-input" [(ngModel)]="form.lateFinePerDay" name="lateFine"
                min="0" step="1" placeholder="0 = no fine">
            </div>
          </div>

          <div class="academy-form-row single-col">
            <div class="academy-form-group">
              <label>Description</label>
              <textarea class="academy-input" [(ngModel)]="form.description" name="description" rows="2"
                placeholder="Optional notes about this fee plan"></textarea>
            </div>
          </div>

          <div class="academy-form-row single-col">
            <div class="academy-form-group">
              <label class="toggle-label">
                <input type="checkbox" [(ngModel)]="form.isActive" name="isActive">
                <span class="toggle-text">Active</span>
              </label>
            </div>
          </div>

          <!-- ─── Add-on Charges Sub-table ─────────────────────── -->
          <div class="addons-section">
            <div class="addons-header">
              <h4><i class="fa fa-puzzle-piece"></i> Add-on Charges</h4>
              <button type="button" class="btn btn-sm btn-outline" (click)="addAddonRow()">
                <i class="fa fa-plus"></i> Add Charge
              </button>
            </div>
            <div *ngIf="form.addons && form.addons.length > 0" class="addons-table-wrap">
              <table class="addons-table">
                <thead>
                  <tr>
                    <th>Add-on Type</th>
                    <th>Amount (PKR)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let addon of form.addons; let i = index">
                    <td>
                      <select class="academy-input addon-select" [(ngModel)]="addon.feeAddonId" [name]="'addonId_' + i">
                        <option [ngValue]="null" disabled>Select Add-on</option>
                        <option *ngFor="let a of feeAddons" [ngValue]="a.feeAddonId">{{ a.name }}</option>
                      </select>
                    </td>
                    <td>
                      <input type="number" class="academy-input addon-amount" [(ngModel)]="addon.amount"
                        [name]="'addonAmt_' + i" min="0" step="1" placeholder="0">
                    </td>
                    <td>
                      <button type="button" class="btn-icon btn-icon-delete" (click)="removeAddonRow(i)" title="Remove">
                        <i class="fa fa-times"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="!form.addons || form.addons.length === 0" class="addons-empty">
              No add-on charges — click "Add Charge" to attach transport, lab, hostel fees etc.
            </div>
          </div>

          <div class="academy-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa fa-spinner fa-spin" *ngIf="saving"></i>
              <i class="fa fa-save" *ngIf="!saving"></i>
              {{ saving ? 'Saving...' : 'Save Structure' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()" [disabled]="saving">Cancel</button>
          </div>
        </form>
      </div>

      <!-- ─── Filters ─────────────────────────────────────────── -->
      <div class="filters-card" *ngIf="!loading && !showForm">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input type="text" [(ngModel)]="searchTerm" (input)="applyFilters()"
            placeholder="Search by name, class or session..."
            class="modern-form-control search-input">
        </div>
        <div class="filter-group">
          <select class="modern-form-control filter-select" [(ngModel)]="filterSessionId" (change)="applyFilters()">
            <option [ngValue]="null">All Sessions</option>
            <option *ngFor="let s of sessions" [ngValue]="s.academicSessionId">{{ s.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="modern-form-control filter-select" [(ngModel)]="filterStatus" (change)="applyFilters()">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- ─── Data Table ──────────────────────────────────────── -->
      <div class="academy-table-card" *ngIf="!loading && !showForm">
        <div class="academy-table-header">
          <div class="academy-table-title"><i class="fa fa-table"></i> Fee Structures</div>
          <div class="academy-table-toolbar">
            <div class="show-entries">
              <span>Show</span>
              <select class="entries-select" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
                <option *ngFor="let opt of pageSizeOptions" [ngValue]="opt">{{ opt }}</option>
              </select>
              <span>entries</span>
            </div>
            <div class="academy-table-count">
              <i class="fa fa-list"></i> Total: {{ filteredList.length }} structure(s)
            </div>
          </div>
        </div>

        <div class="academy-table-responsive">
          <table class="academy-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Class</th>
                <th>Session</th>
                <th>Monthly Fee</th>
                <th>Add-ons</th>
                <th>Due Day</th>
                <th>Late Fine</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let fs of paginatedList; let i = index">
                <td><span class="id-badge">{{ startEntry + i }}</span></td>
                <td>
                  <strong>{{ fs.name }}</strong>
                  <div class="sub-text" *ngIf="fs.description">{{ fs.description }}</div>
                </td>
                <td>
                  <span class="class-badge">{{ fs.className || getClassName(fs.classId) }}</span>
                </td>
                <td>{{ fs.academicSessionName || getSessionName(fs.academicSessionId) }}</td>
                <td class="amount-cell">PKR {{ fs.monthlyAmount | number:'1.0-0' }}</td>
                <td>
                  <ng-container *ngIf="fs.addons && fs.addons.length > 0; else noAddons">
                    <div class="addon-pills">
                      <span class="addon-pill" *ngFor="let a of fs.addons">
                        {{ a.feeAddonName || getAddonName(a.feeAddonId) }}
                        <strong>{{ a.amount | number:'1.0-0' }}</strong>
                      </span>
                    </div>
                  </ng-container>
                  <ng-template #noAddons><span class="text-muted">—</span></ng-template>
                </td>
                <td>{{ fs.dueDayOfMonth }}{{ getOrdinal(fs.dueDayOfMonth) }}</td>
                <td>
                  <span *ngIf="fs.lateFinePerDay">PKR {{ fs.lateFinePerDay }}/day</span>
                  <span *ngIf="!fs.lateFinePerDay" class="text-muted">—</span>
                </td>
                <td>
                  <span [class]="'status-badge ' + (fs.isActive ? 'badge-active' : 'badge-inactive')">
                    {{ fs.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-edit" (click)="edit(fs)" title="Edit">
                      <i class="fa fa-pencil"></i>
                    </button>
                    <button class="modern-btn-icon modern-btn-delete" (click)="confirmDelete(fs)" title="Delete">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="paginatedList.length === 0">
                <td colspan="10" class="academy-table-empty">
                  <i class="fa fa-inbox"></i>
                  <p>No fee structures found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="filteredList.length > 0">
          <div class="pagination-info">
            Showing {{ startEntry }} to {{ endEntry }} of {{ filteredList.length }} entries
          </div>
          <div class="pagination-controls">
            <button type="button" class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(1)"><i class="fa fa-angle-double-left"></i></button>
            <button type="button" class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)"><i class="fa fa-angle-left"></i></button>
            <span class="page-numbers">
              <button *ngFor="let p of getPageNumbers()" type="button" class="page-num"
                [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            </span>
            <button type="button" class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)"><i class="fa fa-angle-right"></i></button>
            <button type="button" class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(totalPages)"><i class="fa fa-angle-double-right"></i></button>
          </div>
        </div>
      </div>

      <!-- Delete dialog -->
      <app-confirm-dialog
        [show]="showDeleteConfirm"
        title="Delete Fee Structure"
        [message]="'Delete \\'' + (structureToDelete?.name || '') + '\\'? Any challans already generated from this structure will not be affected.'"
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="deleteStructure()"
        (cancelled)="showDeleteConfirm = false; structureToDelete = null">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    /* ─── Container ──────────────────────────────────────── */
    .fee-structures-container { padding: 0; position: relative; }

    /* ─── Page Header ────────────────────────────────────── */
    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 {
      margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0.25rem 0 0 0; font-size: 0.9375rem; color: #6a8cad; padding-left: 2.1rem; }

    /* ─── Buttons ─────────────────────────────────────────── */
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem;
      border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
    .btn-primary {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff;
      box-shadow: 0 4px 14px rgba(30,58,95,0.35);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
    .btn-secondary { background: #6b7280; color: #fff; }
    .btn-secondary:hover:not(:disabled) { background: #4b5563; }
    .btn-sm { padding: 0.45rem 0.9rem; font-size: 0.8125rem; border-radius: 0.5rem; }
    .btn-outline {
      background: transparent; color: #1e3a5f; border: 1.5px solid #1e3a5f;
      box-shadow: none;
    }
    .btn-outline:hover:not(:disabled) { background: rgba(30,58,95,0.06); }

    /* ─── Form Card ──────────────────────────────────────── */
    .academy-form-card {
      background: #fff; border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-form-card h3 {
      margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .academy-form-card h3 i { color: #1e3a5f; }
    .academy-form-row {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.25rem;
    }
    .academy-form-row.single-col { grid-template-columns: 1fr; }
    .academy-form-group { display: flex; flex-direction: column; }
    .academy-form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #1e3a5f; }
    .academy-form-group .required { color: #dc2626; }
    .academy-input {
      padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box;
    }
    .academy-input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .academy-input.is-invalid { border-color: #dc2626; }
    .academy-invalid { margin-top: 0.35rem; font-size: 0.8125rem; color: #dc2626; font-weight: 500; }
    .form-hint { margin-top: 0.35rem; font-size: 0.78rem; color: #8aa8c4; }
    .toggle-label {
      display: flex; align-items: center; gap: 0.6rem; cursor: pointer;
      font-size: 0.9375rem; font-weight: 500; color: #435d7a;
    }
    .toggle-text { user-select: none; }
    .academy-form-actions {
      display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem;
      border-top: 1px solid #eef2f7;
    }

    /* ─── Add-ons Section ────────────────────────────────── */
    .addons-section {
      margin-top: 1.5rem; padding: 1.25rem 1.5rem; background: #f7f9fc; border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .addons-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
    }
    .addons-header h4 {
      margin: 0; font-size: 0.9375rem; font-weight: 700; color: #1e3a5f;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .addons-header h4 i { color: #2c5282; font-size: 0.875rem; }
    .addons-table-wrap { overflow-x: auto; }
    .addons-table { width: 100%; border-collapse: collapse; }
    .addons-table th {
      padding: 0.6rem 0.75rem; font-size: 0.75rem; font-weight: 600; color: #6a8cad;
      text-transform: uppercase; letter-spacing: 0.04em; text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }
    .addons-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #eef2f7; }
    .addons-table th:last-child, .addons-table td:last-child { width: 44px; text-align: center; }
    .addon-select { min-width: 180px; }
    .addon-amount { max-width: 140px; }
    .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon-delete { background: #fee2e2; color: #dc2626; }
    .btn-icon-delete:hover { background: #fecaca; }
    .addons-empty { text-align: center; padding: 1.25rem; font-size: 0.875rem; color: #8aa8c4; font-style: italic; }

    /* ─── Filters ─────────────────────────────────────────── */
    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex-wrap: wrap; align-items: center;
    }
    .search-box { position: relative; flex: 1; min-width: 260px; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8aa8c4; z-index: 1; }
    .search-input { padding-left: 2.75rem !important; }
    .modern-form-control {
      padding: 0.65rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box;
    }
    .modern-form-control:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .filter-group { min-width: 170px; }
    .filter-select { min-width: 170px; cursor: pointer; }

    /* ─── Table Card ──────────────────────────────────────── */
    .academy-table-card {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-table-header {
      padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
    }
    .academy-table-title {
      font-size: 1.0625rem; font-weight: 700; color: #0f2744;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .academy-table-title i { color: #2c5282; }
    .academy-table-toolbar { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
    .show-entries { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad; }
    .entries-select {
      padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid #e2e8f0;
      font-size: 0.9rem; background: white; min-width: 60px; cursor: pointer;
    }
    .academy-table-count {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad;
    }

    /* ─── Table ───────────────────────────────────────────── */
    .academy-table-responsive { overflow-x: auto; }
    .academy-table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
    .academy-table thead { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); }
    .academy-table th {
      padding: 0.875rem 1rem; text-align: left; font-size: 0.8125rem;
      font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .academy-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #eef2f7; color: #435d7a; }
    .academy-table tbody tr:hover { background: #f7f9fc; }
    .id-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 32px; height: 28px; padding: 0 0.5rem; background: #eef2f7;
      border-radius: 8px; font-weight: 600; color: #435d7a; font-size: 0.875rem;
    }
    .sub-text { font-size: 0.78rem; color: #8aa8c4; margin-top: 0.2rem; }
    .class-badge {
      display: inline-flex; padding: 0.25rem 0.65rem; background: rgba(30,58,95,0.1);
      border-radius: 8px; font-weight: 600; color: #1e3a5f; font-size: 0.875rem;
    }
    .amount-cell { font-weight: 700; color: #0f2744; }
    .addon-pills { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .addon-pill {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.2rem 0.6rem; background: #eef2f7; border-radius: 6px;
      font-size: 0.78rem; color: #435d7a;
    }
    .addon-pill strong { color: #1e3a5f; }
    .text-muted { color: #8aa8c4; font-style: italic; }
    .status-badge {
      display: inline-flex; padding: 0.25rem 0.7rem; border-radius: 20px;
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em;
    }
    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-inactive { background: #e5e7eb; color: #4b5563; }

    /* ─── Table Actions ──────────────────────────────────── */
    .modern-table-actions { display: flex; gap: 0.5rem; }
    .modern-btn-icon {
      width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;
      color: #fff;
    }
    .modern-btn-edit { background: #2563eb; }
    .modern-btn-edit:hover { background: #1d4ed8; }
    .modern-btn-delete { background: #dc2626; }
    .modern-btn-delete:hover { background: #b91c1c; }

    /* ─── Table Empty ─────────────────────────────────────── */
    .academy-table-empty {
      text-align: center; padding: 3rem; color: #6a8cad;
    }
    .academy-table-empty i { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; color: #c5d5e4; }
    .academy-table-empty p { margin: 0; font-size: 1rem; }

    /* ─── Pagination ──────────────────────────────────────── */
    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem;
    }
    .pagination-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-num {
      padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; background: #fff;
      border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500;
      min-width: 38px; color: #334155; transition: all 0.2s ease;
    }
    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) {
      background: #f1f5f9; border-color: #cbd5e1; color: #0f172a;
    }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
    .page-num.active {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: white; border-color: transparent;
    }
    .page-numbers { display: flex; gap: 0.35rem; }

    /* ─── Responsive ──────────────────────────────────────── */
    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: flex-start; }
      .academy-form-row { grid-template-columns: 1fr; }
      .filters-card { flex-direction: column; }
      .search-box { min-width: 100%; }
      .filter-group { min-width: 100%; }
    }
  `]
})
export class FeeStructuresComponent implements OnInit {
  structures: FeeStructure[] = [];
  filteredList: FeeStructure[] = [];
  paginatedList: FeeStructure[] = [];

  classes: Class[] = [];
  sessions: AcademicSession[] = [];
  feeAddons: FeeAddon[] = [];

  loading = false;
  saving = false;
  submitted = false;
  showForm = false;
  editing: FeeStructure | null = null;

  showDeleteConfirm = false;
  structureToDelete: FeeStructure | null = null;

  searchTerm = '';
  filterSessionId: number | null = null;
  filterStatus = '';
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  currentPage = 1;

  form: Partial<FeeStructure> & { addons: Partial<FeeStructureAddon>[] } = this.emptyForm();

  constructor(
    private feeService: FeeService,
    private classService: ClassService,
    private sessionService: AcademicSessionService,
    private feeAddonService: FeeAddonService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;

    forkJoin({
      structures: this.feeService.getFeeStructures().pipe(catchError(() => of([] as FeeStructure[]))),
      classes: this.classService.getAllClasses().pipe(catchError(() => of([] as Class[]))),
      sessions: this.sessionService.getAll().pipe(catchError(() => of([] as AcademicSession[]))),
      feeAddons: this.feeAddonService.getAll().pipe(catchError(() => of([] as FeeAddon[])))
    }).subscribe({
      next: (result) => {
        this.structures = result.structures;
        this.classes = result.classes;
        this.sessions = result.sessions;
        this.feeAddons = result.feeAddons;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.notify.error('Failed to load data');
        this.loading = false;
      }
    });
  }

  // ─── Filtering & Pagination ──────────────────────────────

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredList = this.structures.filter(fs => {
      if (term) {
        const nameMatch = (fs.name || '').toLowerCase().includes(term);
        const classMatch = (fs.className || this.getClassName(fs.classId)).toLowerCase().includes(term);
        const sessionMatch = (fs.academicSessionName || this.getSessionName(fs.academicSessionId)).toLowerCase().includes(term);
        if (!nameMatch && !classMatch && !sessionMatch) return false;
      }
      if (this.filterSessionId && fs.academicSessionId !== this.filterSessionId) return false;
      if (this.filterStatus === 'active' && !fs.isActive) return false;
      if (this.filterStatus === 'inactive' && fs.isActive) return false;
      return true;
    });
    this.currentPage = 1;
    this.updatePaginated();
  }

  updatePaginated() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedList = this.filteredList.slice(start, start + this.pageSize);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize)); }
  get startEntry(): number { return this.filteredList.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get endEntry(): number { return Math.min(this.currentPage * this.pageSize, this.filteredList.length); }

  onPageSizeChange() { this.currentPage = 1; this.updatePaginated(); }
  goToPage(page: number) { this.currentPage = Math.max(1, Math.min(page, this.totalPages)); this.updatePaginated(); }

  getPageNumbers(): number[] {
    const total = this.totalPages;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(total, this.currentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, 5);
      else if (end === total) start = Math.max(1, total - 4);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ─── Form ────────────────────────────────────────────────

  openAddForm() {
    this.editing = null;
    this.form = this.emptyForm();
    this.submitted = false;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  edit(fs: FeeStructure) {
    this.editing = fs;
    this.form = {
      name: fs.name,
      classId: fs.classId,
      academicSessionId: fs.academicSessionId,
      monthlyAmount: fs.monthlyAmount,
      dueDayOfMonth: fs.dueDayOfMonth,
      lateFinePerDay: fs.lateFinePerDay || 0,
      description: fs.description || '',
      isActive: fs.isActive,
      addons: (fs.addons || []).map(a => ({
        feeStructureAddonId: a.feeStructureAddonId,
        feeAddonId: a.feeAddonId,
        amount: a.amount
      }))
    };
    this.submitted = false;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() {
    this.showForm = false;
    this.editing = null;
    this.submitted = false;
    this.form = this.emptyForm();
  }

  save() {
    this.submitted = true;
    if (!this.form.name?.trim() || !this.form.classId || !this.form.academicSessionId
        || !this.form.monthlyAmount || this.form.monthlyAmount <= 0) {
      this.notify.warning('Please fill all required fields');
      return;
    }

    this.saving = true;
    const addons = (this.form.addons || [])
      .filter(a => a.feeAddonId && a.amount && a.amount > 0)
      .map(a => ({ feeAddonId: a.feeAddonId!, amount: a.amount! }));

    const dto = {
      name: this.form.name!,
      classId: this.form.classId!,
      academicSessionId: this.form.academicSessionId!,
      monthlyAmount: this.form.monthlyAmount!,
      dueDayOfMonth: this.form.dueDayOfMonth!,
      lateFinePerDay: this.form.lateFinePerDay || 0,
      description: this.form.description || undefined,
      isActive: this.form.isActive!,
      addons
    };

    const obs = this.editing
      ? this.feeService.updateFeeStructure(this.editing.feeStructureId!, dto as UpdateFeeStructure)
      : this.feeService.createFeeStructure(dto as CreateFeeStructure);

    obs.subscribe({
      next: () => {
        this.notify.success(this.editing ? 'Fee structure updated' : 'Fee structure created');
        this.cancelForm();
        this.loadStructures();
        this.saving = false;
      },
      error: (err) => {
        this.notify.error(err?.error?.message || 'Failed to save');
        this.saving = false;
      }
    });
  }

  // ─── Delete ──────────────────────────────────────────────

  confirmDelete(fs: FeeStructure) {
    this.structureToDelete = fs;
    this.showDeleteConfirm = true;
  }

  deleteStructure() {
    if (!this.structureToDelete?.feeStructureId) return;
    this.feeService.deleteFeeStructure(this.structureToDelete.feeStructureId).subscribe({
      next: () => {
        this.notify.success('Fee structure deleted');
        this.showDeleteConfirm = false;
        this.structureToDelete = null;
        this.loadStructures();
      },
      error: () => {
        this.notify.error('Failed to delete');
        this.showDeleteConfirm = false;
        this.structureToDelete = null;
      }
    });
  }

  // ─── Add-on rows ─────────────────────────────────────────

  addAddonRow() {
    if (!this.form.addons) this.form.addons = [];
    this.form.addons.push({ feeAddonId: null as any, amount: 0 });
  }

  removeAddonRow(index: number) {
    this.form.addons.splice(index, 1);
  }

  onClassChange(classId: number) {
    const selected = this.classes.find(c => c.classId === classId);
    if (selected?.fee != null) {
      this.form.monthlyAmount = selected.fee;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────

  getClassName(classId: number): string {
    return this.classes.find(c => c.classId === classId)?.name || '';
  }

  getSessionName(sessionId: number): string {
    return this.sessions.find(s => s.academicSessionId === sessionId)?.name || '';
  }

  getAddonName(addonId: number): string {
    return this.feeAddons.find(a => a.feeAddonId === addonId)?.name || '';
  }

  getOrdinal(n: number): string {
    if (!n) return '';
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  private loadStructures() {
    this.feeService.getFeeStructures().subscribe({
      next: data => { this.structures = data; this.applyFilters(); },
      error: () => { this.structures = []; this.applyFilters(); }
    });
  }

  private emptyForm(): Partial<FeeStructure> & { addons: Partial<FeeStructureAddon>[] } {
    return {
      name: '',
      classId: null as any,
      academicSessionId: null as any,
      monthlyAmount: 0,
      dueDayOfMonth: 10,
      lateFinePerDay: 0,
      description: '',
      isActive: true,
      addons: []
    };
  }
}
