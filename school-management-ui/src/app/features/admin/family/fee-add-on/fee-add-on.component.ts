import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FeeAddonService } from '../../../../core/services/family/fee-addon.service';
import { FeeAddon } from '../../../../core/models/fee-addon.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-fee-add-on',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  template: `
    <div class="fee-addon-container">
      <app-loading [show]="loading" [message]="'Loading fee add-ons...'"></app-loading>

      <!-- List view -->
      <ng-container *ngIf="!showForm">
        <div class="page-header-card">
          <div class="header-content">
            <div>
              <h2><i class="fa fa-plus-circle"></i> Fee Add-ons</h2>
              <p class="page-subtitle">Manage additional fee types (e.g., transport, laboratory, registration)</p>
            </div>
            <button type="button" class="btn btn-primary" (click)="openAddForm()" [disabled]="loading">
              <i class="fa fa-plus"></i> Add New Add-on
            </button>
          </div>
        </div>

        <div class="filters-card" *ngIf="!loading">
          <div class="search-box">
            <i class="fa fa-search"></i>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
              placeholder="Search by add-on name..."
              class="modern-form-control search-input"
            />
          </div>
        </div>

        <div class="academy-table-card" *ngIf="!loading">
          <div class="academy-table-header">
            <div class="academy-table-title">Fee Add-ons List</div>
            <div class="academy-table-toolbar">
              <div class="show-entries">
                <span>Show</span>
                <select class="entries-select" [ngModel]="pageSize" (ngModelChange)="onPageSizeChange($event)">
                  <option *ngFor="let opt of pageSizeOptions" [ngValue]="opt">{{ opt }}</option>
                </select>
                <span>entries</span>
              </div>
              <div class="academy-table-count">
                <i class="fa fa-list"></i>
                <span>Total: {{ filteredList.length }} add-on(s)</span>
              </div>
            </div>
          </div>
          <div class="academy-table-responsive">
            <table class="academy-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th class="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="!loading && paginatedList.length === 0" class="empty-row">
                  <td colspan="2">No fee add-ons found</td>
                </tr>
                <tr *ngFor="let item of paginatedList">
                  <td><strong>{{ item.name }}</strong></td>
                  <td class="col-action">
                    <button type="button" class="btn-edit" (click)="openEditForm(item)" title="Edit">
                      <i class="fa fa-pencil"></i>
                    </button>
                    <button type="button" class="btn-delete" (click)="confirmDelete(item)" title="Delete">
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-bar" *ngIf="filteredList.length > 0">
            <div class="pagination-info">
              Showing {{ startEntry }} to {{ endEntry }} of {{ filteredList.length }} entries
            </div>
            <div class="pagination-controls">
              <button type="button" class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(1)" title="First">
                <i class="fa fa-angle-double-left"></i>
              </button>
              <button type="button" class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" title="Previous">
                <i class="fa fa-angle-left"></i>
              </button>
              <span class="page-numbers">
                <button *ngFor="let p of getPageNumbers()" type="button" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
              </span>
              <button type="button" class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" title="Next">
                <i class="fa fa-angle-right"></i>
              </button>
              <button type="button" class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(totalPages)" title="Last">
                <i class="fa fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Add / Edit form -->
      <div *ngIf="showForm" class="academy-form-card">
        <h3><i class="fa" [ngClass]="editingItem ? 'fa-edit' : 'fa-plus-circle'"></i> {{ editingItem ? 'Edit Fee Add-on' : 'New Fee Add-on' }}</h3>
        <form (ngSubmit)="save()">
          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Name <span class="required">*</span></label>
              <input
                type="text"
                class="academy-input"
                [(ngModel)]="formName"
                name="name"
                placeholder="e.g., Transport, Laboratory, Registration"
                [class.is-invalid]="submitted && !formName.trim()"
              />
              <div *ngIf="submitted && !formName.trim()" class="academy-invalid">Name is required</div>
            </div>
          </div>
          <div class="academy-form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fa fa-save"></i> Save
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Delete confirm -->
      <div *ngIf="showDeleteConfirm" class="confirm-overlay" (click)="showDeleteConfirm = false">
        <div class="confirm-box" (click)="$event.stopPropagation()">
          <p>Are you sure you want to delete "{{ itemToDelete?.name }}"?</p>
          <div class="confirm-actions">
            <button type="button" class="btn btn-primary" (click)="deleteItem()">Yes, delete</button>
            <button type="button" class="btn btn-secondary" (click)="showDeleteConfirm = false; itemToDelete = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fee-addon-container { padding: 0; position: relative; }
    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; display: flex; align-items: center; gap: 0.75rem; }
    .page-header-card h2 i { color: #1e3a5f; }
    .page-subtitle { margin: 0.25rem 0 0 0; font-size: 0.9375rem; color: #6a8cad; padding-left: 2.1rem; }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; border: none; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; box-shadow: 0 4px 14px rgba(30,58,95,0.35);
    }
    .btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
    .btn-secondary { background: #6b7280 !important; box-shadow: none; }
    .btn-secondary:hover:not(:disabled) { background: #4b5563 !important; }
    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .search-box { position: relative; flex: 1; min-width: 300px; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8aa8c4; z-index: 1; }
    .search-input { padding-left: 3rem; }
    .academy-table-card {
      background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-table-header {
      padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
    }
    .academy-table-title { font-size: 1.0625rem; font-weight: 700; color: #0f2744; }
    .academy-table-toolbar { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
    .show-entries { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad; }
    .entries-select {
      padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9rem;
      background: white; min-width: 60px; cursor: pointer;
    }
    .academy-table-count { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad; }
    .academy-table-responsive { overflow-x: auto; }
    .academy-table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
    .academy-table thead { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); }
    .academy-table th {
      padding: 0.875rem 1rem; text-align: left; font-size: 0.8125rem; font-weight: 600; color: #fff;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .academy-table td { padding: 1rem; border-bottom: 1px solid #eef2f7; color: #435d7a; }
    .academy-table tbody tr:hover { background: #f7f9fc; }
    .col-action { width: 120px; }
    .btn-edit, .btn-delete {
      padding: 0.4rem 0.75rem; border: none; border-radius: 8px; cursor: pointer; margin-right: 0.35rem;
      font-size: 0.875rem; color: #fff; transition: all 0.2s;
    }
    .btn-edit { background: #2563eb; }
    .btn-edit:hover { background: #1d4ed8; }
    .btn-delete { background: #dc2626; }
    .btn-delete:hover { background: #b91c1c; }
    .empty-row td { text-align: center; padding: 2rem; color: #6a8cad; }
    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem;
    }
    .pagination-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-num {
      padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; background: #fff; border-radius: 8px;
      cursor: pointer; font-size: 0.9rem; font-weight: 500; min-width: 38px; color: #334155; transition: all 0.2s ease;
    }
    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) {
      background: #f1f5f9; border-color: #cbd5e1; color: #0f172a;
    }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
    .page-num.active {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; border-color: transparent;
    }
    .page-numbers { display: flex; gap: 0.35rem; }
    .academy-form-card {
      background: #fff; border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-form-card h3 { margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 700; color: #0f2744; display: flex; align-items: center; gap: 0.5rem; }
    .academy-form-card h3 i { color: #1e3a5f; }
    .academy-form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .academy-form-group { display: flex; flex-direction: column; }
    .academy-form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #1e3a5f; }
    .academy-form-group .required { color: #dc2626; }
    .academy-input {
      padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .academy-input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .academy-input.is-invalid { border-color: #dc2626; }
    .academy-invalid { margin-top: 0.5rem; font-size: 0.8125rem; color: #dc2626; font-weight: 500; }
    .academy-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eef2f7; }
    .confirm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .confirm-box { background: #fff; padding: 1.5rem; border-radius: 12px; min-width: 320px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
    .confirm-box p { margin: 0 0 1rem; color: #334155; }
    .confirm-actions { display: flex; gap: 0.75rem; }
    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: flex-start; }
      .filters-card, .academy-table-header { padding: 1rem; }
      .search-box { min-width: 100%; }
    }
  `]
})
export class FeeAddOnComponent implements OnInit {
  list: FeeAddon[] = [];
  filteredList: FeeAddon[] = [];
  paginatedList: FeeAddon[] = [];
  searchTerm = '';
  loading = false;
  showForm = false;
  formName = '';
  submitted = false;
  editingItem: FeeAddon | null = null;
  pageSize = 25;
  pageSizeOptions = [10, 25, 50, 100];
  currentPage = 1;
  showDeleteConfirm = false;
  itemToDelete: FeeAddon | null = null;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
  }

  get startEntry(): number {
    if (this.filteredList.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endEntry(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredList.length);
  }

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

  constructor(
    private feeAddonService: FeeAddonService,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.loadList();
  }

  loadList() {
    this.loading = true;
    this.feeAddonService.getAll().subscribe({
      next: (data) => {
        this.list = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.list = [];
        this.filteredList = [];
        this.updatePaginated();
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredList = term
      ? this.list.filter(f => (f.name || '').toLowerCase().includes(term))
      : [...this.list];
    this.currentPage = 1;
    this.updatePaginated();
  }

  updatePaginated() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedList = this.filteredList.slice(start, start + this.pageSize);
  }

  onPageSizeChange(value: number | string) {
    const n = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(n) && n >= 1) {
      this.pageSize = n;
      this.currentPage = 1;
      this.updatePaginated();
    }
  }

  goToPage(page: number) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.updatePaginated();
  }

  openAddForm() {
    this.editingItem = null;
    this.formName = '';
    this.submitted = false;
    this.showForm = true;
  }

  openEditForm(item: FeeAddon) {
    this.editingItem = item;
    this.formName = item.name || '';
    this.submitted = false;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingItem = null;
    this.formName = '';
    this.submitted = false;
  }

  save() {
    this.submitted = true;
    const name = this.formName?.trim();
    if (!name) {
      this.notification.warning('Name is required');
      return;
    }
    if (this.editingItem?.feeAddonId) {
      this.feeAddonService.update(this.editingItem.feeAddonId, { name }).subscribe({
        next: () => {
          this.notification.success('Fee addon updated');
          this.cancelForm();
          this.loadList();
        },
        error: (err) => this.notification.error(err?.error?.message || 'Update failed')
      });
    } else {
      this.feeAddonService.create({ name }).subscribe({
        next: () => {
          this.notification.success('Fee addon created');
          this.cancelForm();
          this.loadList();
        },
        error: (err) => this.notification.error(err?.error?.message || 'Create failed')
      });
    }
  }

  confirmDelete(item: FeeAddon) {
    this.itemToDelete = item;
    this.showDeleteConfirm = true;
  }

  deleteItem() {
    if (!this.itemToDelete?.feeAddonId) return;
    this.feeAddonService.delete(this.itemToDelete.feeAddonId).subscribe({
      next: () => {
        this.notification.success('Fee addon deleted');
        this.showDeleteConfirm = false;
        this.itemToDelete = null;
        this.loadList();
      },
      error: () => {
        this.notification.error('Delete failed');
        this.showDeleteConfirm = false;
        this.itemToDelete = null;
      }
    });
  }
}
