import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FamilyService } from '../../../../core/services/family/family.service';
import { Family } from '../../../../core/models/family.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-family-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, DropdownComponent],
  template: `
    <div class="family-list-container">
      <app-loading [show]="loading" [message]="'Loading families...'"></app-loading>

      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2><i class="fa fa-users"></i> Family Management</h2>
            <p class="page-subtitle">View and manage family records</p>
          </div>
          <a routerLink="/admin/family/add" class="btn btn-primary">
            <i class="fa fa-plus"></i> Add New Family
          </a>
        </div>
      </div>

      <div class="filters-card" *ngIf="!loading">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            placeholder="Search by father name, mother name, phone, or SMS number..."
            class="modern-form-control search-input"
          />
        </div>
      </div>

      <div class="academy-table-card" *ngIf="!loading">
        <div class="academy-table-header">
          <div class="academy-table-title">Families List</div>
          <div class="academy-table-toolbar">
            <div class="show-entries">
              <span>Show</span>
              <app-dropdown
                [(ngModel)]="pageSize"
                [options]="pageSizeOpts"
                [searchable]="false"
                [showPlaceholderOption]="false"
                size="sm"
                (changed)="onPageSizeChange($event)">
              </app-dropdown>
              <span>entries</span>
            </div>
            <div class="academy-table-count">
              <i class="fa fa-users"></i>
              <span>Total: {{ filteredFamilies.length }} family(ies)</span>
            </div>
          </div>
        </div>
        <div class="academy-table-responsive">
          <table class="academy-table">
            <thead>
              <tr>
                <th class="col-checkbox">
                  <input
                    type="checkbox"
                    [checked]="allSelected"
                    (change)="toggleSelectAll($event)"
                    title="Select all"
                  />
                </th>
                <th class="col-sortable" (click)="sortBy('fatherName')">
                  Father Name <i class="fa sort-icon" [ngClass]="sortCol==='fatherName' ? (sortAsc ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th class="col-sortable" (click)="sortBy('fatherPhone')">
                  Father Phone <i class="fa sort-icon" [ngClass]="sortCol==='fatherPhone' ? (sortAsc ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th class="col-sortable" (click)="sortBy('motherPhone')">
                  Mother Phone <i class="fa sort-icon" [ngClass]="sortCol==='motherPhone' ? (sortAsc ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'"></i>
                </th>
                <th>Students</th>
                <th>Fee</th>
                <th>Total Due</th>
                <th>Paid</th>
                <th>Date</th>
                <th class="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="!loading && paginatedFamilies.length === 0" class="empty-row">
                <td [attr.colspan]="10">No families found</td>
              </tr>
              <tr *ngFor="let family of paginatedFamilies">
                <td class="col-checkbox">
                  <input
                    type="checkbox"
                    [checked]="isSelected(family)"
                    (change)="toggleSelect(family)"
                  />
                </td>
                <td><strong>{{ family.fatherName || '-' }}</strong></td>
                <td>{{ family.fatherPhone || '-' }}</td>
                <td>{{ getMotherPhone(family) }}</td>
                <td>0</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td class="col-action">
                  <a [routerLink]="['/admin/family/add']" [queryParams]="{ id: family.familyId }" class="btn-action" title="Edit">
                    <i class="fa fa-edit"></i>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar" *ngIf="filteredFamilies.length > 0">
          <div class="pagination-info">
            Showing {{ startEntry }} to {{ endEntry }} of {{ filteredFamilies.length }} entries
          </div>
          <div class="pagination-controls">
            <button type="button" class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(1)" title="First">
              <i class="fa fa-angle-double-left"></i>
            </button>
            <button type="button" class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" title="Previous">
              <i class="fa fa-angle-left"></i>
            </button>
            <span class="page-numbers">
              <button
                *ngFor="let p of getPageNumbers()"
                type="button"
                class="page-num"
                [class.active]="p === currentPage"
                (click)="goToPage(p)"
              >{{ p }}</button>
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

      <div *ngIf="processing" class="processing-indicator">Processing...</div>
    </div>
  `,
  styles: [`
    .family-list-container { padding: 0; position: relative; }
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
      font-size: 0.9375rem; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.2s;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; box-shadow: 0 4px 14px rgba(30,58,95,0.35);
    }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
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
    .col-checkbox { width: 40px; text-align: center; }
    .col-sortable { cursor: pointer; user-select: none; white-space: nowrap; }
    .col-sortable:hover { color: rgba(255,255,255,0.9); }
    .sort-icon { margin-left: 0.35rem; opacity: 0.8; font-size: 0.75rem; }
    .col-action { width: 80px; text-align: center; }
    .empty-row td { text-align: center; padding: 2rem; color: #6a8cad; }
    .btn-action {
      display: inline-flex; align-items: center; justify-content: center; padding: 0.4rem 0.75rem;
      color: #fff; background: #2563eb; text-decoration: none; border-radius: 8px; transition: all 0.2s;
    }
    .btn-action:hover { background: #1d4ed8; opacity: 0.95; }
    .processing-indicator { text-align: center; padding: 0.5rem; color: #6a8cad; font-size: 0.9rem; }
    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem;
    }
    .pagination-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-num {
      padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; background: #fff; border-radius: 8px;
      cursor: pointer; font-size: 0.9rem; font-weight: 500; min-width: 38px; color: #334155;
      transition: all 0.2s ease;
    }
    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) {
      background: #f1f5f9; border-color: #cbd5e1; color: #0f172a;
    }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
    .page-num.active {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; border-color: transparent;
    }
    .page-numbers { display: flex; gap: 0.35rem; }
    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: flex-start; }
      .filters-card, .academy-table-header { padding: 1rem; }
      .search-box { min-width: 100%; }
    }
  `]
})
export class FamilyListComponent implements OnInit {
  families: Family[] = [];
  filteredFamilies: Family[] = [];
  paginatedFamilies: Family[] = [];
  searchTerm = '';
  loading = false;
  processing = false;
  selectedIds = new Set<number>();
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  sortCol: string | null = null;
  sortAsc = true;

  get pageSizeOpts(): DropdownOption[] {
    return this.pageSizeOptions.map(s => ({ value: s, label: '' + s }));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredFamilies.length / this.pageSize));
  }

  get startEntry(): number {
    if (this.filteredFamilies.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endEntry(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredFamilies.length);
  }

  get allSelected(): boolean {
    if (this.paginatedFamilies.length === 0) return false;
    return this.paginatedFamilies.every(f => this.selectedIds.has(f.familyId!));
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

  constructor(private familyService: FamilyService) {}

  ngOnInit() {
    this.loadFamilies();
  }

  loadFamilies() {
    this.loading = true;
    this.familyService.getAllFamilies().subscribe({
      next: (data) => {
        this.families = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.families = [];
        this.filteredFamilies = [];
        this.updatePaginated();
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let list = [...this.families];
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      list = list.filter(f =>
        (f.fatherName || '').toLowerCase().includes(term) ||
        (f.fatherPhone || '').toLowerCase().includes(term) ||
        (f.motherName || '').toLowerCase().includes(term) ||
        (f.motherPhone || '').toLowerCase().includes(term) ||
        (f.smsNumber || '').toLowerCase().includes(term)
      );
    }
    if (this.sortCol) {
      list.sort((a, b) => this.compare(a, b, this.sortCol!));
    }
    this.filteredFamilies = list;
    this.currentPage = 1;
    this.updatePaginated();
  }

  compare(a: Family, b: Family, col: string): number {
    let va: string | number | undefined;
    let vb: string | number | undefined;
    switch (col) {
      case 'familyId': va = a.familyId ?? 0; vb = b.familyId ?? 0; break;
      case 'fatherName': va = (a.fatherName || '').toLowerCase(); vb = (b.fatherName || '').toLowerCase(); break;
      case 'fatherPhone': va = (a.fatherPhone || '').toLowerCase(); vb = (b.fatherPhone || '').toLowerCase(); break;
      case 'motherPhone': va = (a.motherPhone || '').toLowerCase(); vb = (b.motherPhone || '').toLowerCase(); break;
      default: return 0;
    }
    if (va < vb) return this.sortAsc ? -1 : 1;
    if (va > vb) return this.sortAsc ? 1 : -1;
    return 0;
  }

  sortBy(col: string) {
    if (this.sortCol === col) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortCol = col;
      this.sortAsc = true;
    }
    this.applyFilters();
  }

  updatePaginated() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedFamilies = this.filteredFamilies.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.updatePaginated();
  }

  onPageSizeChange(value: number | string) {
    const n = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(n) && n >= 1) {
      this.pageSize = n;
      this.currentPage = 1;
      this.updatePaginated();
    }
  }

  getMotherPhone(family: Family): string {
    return family.motherPhone ?? '-';
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.paginatedFamilies.forEach(f => {
      if (f.familyId) {
        if (checked) this.selectedIds.add(f.familyId);
        else this.selectedIds.delete(f.familyId);
      }
    });
  }

  toggleSelect(family: Family) {
    if (!family.familyId) return;
    if (this.selectedIds.has(family.familyId)) {
      this.selectedIds.delete(family.familyId);
    } else {
      this.selectedIds.add(family.familyId);
    }
  }

  isSelected(family: Family): boolean {
    return family.familyId != null && this.selectedIds.has(family.familyId);
  }

  downloadSelectedVouchers() {
    if (this.selectedIds.size === 0) return;
    this.processing = true;
    setTimeout(() => {
      this.processing = false;
      console.log('Download vouchers for:', Array.from(this.selectedIds));
    }, 500);
  }
}
