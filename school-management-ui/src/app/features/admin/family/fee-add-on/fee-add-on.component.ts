import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FeeAddonService } from '../../../../core/services/family/fee-addon.service';
import { FeeAddon } from '../../../../core/models/fee-addon.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-fee-add-on',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fee-addon-container">
      <!-- List view -->
      <ng-container *ngIf="!showForm">
        <div class="list-header">
          <h1 class="list-title">FEE ADDONS</h1>
          <button type="button" class="btn-add-new" (click)="openAddForm()">
            <i class="fa fa-plus"></i> Add New
          </button>
        </div>

        <div class="toolbar">
          <span class="show-entries">
            Show
            <select class="entries-select" [ngModel]="pageSize" (ngModelChange)="onPageSizeChange($event)">
              <option *ngFor="let opt of pageSizeOptions" [ngValue]="opt">{{ opt }}</option>
            </select>
            entries
          </span>
          <div class="search-box">
            <label for="search">Search:</label>
            <input
              id="search"
              type="text"
              class="search-input"
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              (input)="applyFilters()"
              placeholder="Search..."
            />
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th class="col-action">
                  Action <i class="fa fa-sort"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading"><td colspan="3">Loading...</td></tr>
              <tr *ngIf="!loading && paginatedList.length === 0"><td colspan="3">No entries found</td></tr>
              <tr *ngFor="let item of paginatedList; let i = index">
                <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td>{{ item.name }}</td>
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

        <div class="pagination-bar">
          <span class="pagination-info">
            Showing {{ startEntry }} to {{ endEntry }} of {{ filteredList.length }} entries
          </span>
          <div class="pagination-buttons">
            <button type="button" class="btn-pagination" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)">
              Previous
            </button>
            <span class="page-numbers">
              <button
                *ngFor="let p of pageNumbers"
                type="button"
                class="btn-page-num"
                [class.active]="p === currentPage"
                [class.ellipsis]="p === -1"
                [disabled]="p === -1"
                (click)="p !== -1 && goToPage(p)"
              >
                {{ p === -1 ? '...' : p }}
              </button>
            </span>
            <button type="button" class="btn-pagination" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)">
              Next
            </button>
          </div>
        </div>
      </ng-container>

      <!-- Add / Edit form -->
      <div *ngIf="showForm" class="form-container">
        <h2 class="form-title">{{ editingItem ? 'EDIT FEE ADDON' : 'NEW FEE ADDON' }}</h2>
        <form (ngSubmit)="save()">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              id="name"
              type="text"
              class="form-input"
              [(ngModel)]="formName"
              name="name"
              required
              [class.is-invalid]="submitted && !formName.trim()"
            />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-save">Save</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Delete confirm (simple inline) -->
      <div *ngIf="showDeleteConfirm" class="confirm-overlay" (click)="showDeleteConfirm = false">
        <div class="confirm-box" (click)="$event.stopPropagation()">
          <p>Are you sure you want to delete "{{ itemToDelete?.name }}"?</p>
          <div class="confirm-actions">
            <button type="button" class="btn-save" (click)="deleteItem()">Yes, delete</button>
            <button type="button" class="btn-cancel" (click)="showDeleteConfirm = false; itemToDelete = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fee-addon-container {
      padding: 1.5rem 2rem;
      background-color: #f5ebe0;
      min-height: calc(100vh - 120px);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .list-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #333;
    }

    .btn-add-new {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-add-new:hover {
      background: #218838;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .show-entries {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #555;
    }

    .entries-select {
      padding: 0.35rem 1.75rem 0.35rem 0.5rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      font-size: 0.9rem;
      background: #fff;
      cursor: pointer;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-box label { font-size: 0.9rem; color: #555; }
    .search-input {
      padding: 0.4rem 0.75rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      font-size: 0.9rem;
      min-width: 200px;
    }

    .table-wrapper {
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .data-table th,
    .data-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .data-table th {
      background: #f9f6f1;
      font-weight: 600;
      color: #444;
    }

    .col-action { width: 120px; }
    .btn-edit, .btn-delete {
      padding: 0.35rem 0.6rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 0.35rem;
      font-size: 0.9rem;
    }

    .btn-edit {
      background: #fd7e14;
      color: #fff;
    }
    .btn-edit:hover { background: #e96b00; }

    .btn-delete {
      background: #dc3545;
      color: #fff;
    }
    .btn-delete:hover { background: #c82333; }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.75rem 0;
    }

    .pagination-info { font-size: 0.9rem; color: #555; }

    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-numbers { display: flex; gap: 0.25rem; }

    .btn-page-num {
      min-width: 2rem;
      padding: 0.4rem 0.6rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      background: #fff;
      font-size: 0.9rem;
      cursor: pointer;
      color: #555;
    }

    .btn-page-num:hover:not(:disabled):not(.ellipsis) {
      background: #f9f6f1;
      border-color: #a37b46;
    }

    .btn-page-num.active {
      background: #28a745;
      border-color: #28a745;
      color: #fff;
    }

    .btn-page-num.ellipsis {
      border: none;
      background: transparent;
      cursor: default;
    }

    .btn-pagination {
      padding: 0.4rem 1rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      background: #fff;
      font-size: 0.9rem;
      cursor: pointer;
      color: #555;
    }

    .btn-pagination:hover:not(:disabled) {
      background: #f9f6f1;
      border-color: #a37b46;
    }

    .btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Form */
    .form-container {
      background: #fdf1dc;
      border-radius: 4px;
      padding: 1.5rem 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      max-width: 500px;
    }

    .form-title {
      margin: 0 0 1.25rem;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.35rem;
      color: #333;
    }

    .form-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d2b892;
      border-radius: 4px;
      background: #fffdf8;
      font-size: 0.95rem;
    }

    .form-input:focus {
      outline: none;
      border-color: #a37b46;
    }

    .form-input.is-invalid { border-color: #dc3545; }

    .form-actions {
      margin-top: 1.25rem;
      display: flex;
      gap: 0.75rem;
    }

    .btn-save {
      padding: 0.45rem 1.25rem;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .btn-save:hover { background: #218838; }

    .btn-cancel {
      padding: 0.45rem 1.25rem;
      background: #6c757d;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .btn-cancel:hover { background: #5a6268; }

    .confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .confirm-box {
      background: #fff;
      padding: 1.5rem;
      border-radius: 8px;
      min-width: 320px;
    }

    .confirm-box p { margin: 0 0 1rem; }
    .confirm-actions { display: flex; gap: 0.75rem; }
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

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1);
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push(-1);
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1);
      pages.push(current - 1, current, current + 1);
      pages.push(-1);
      pages.push(total);
    }
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
