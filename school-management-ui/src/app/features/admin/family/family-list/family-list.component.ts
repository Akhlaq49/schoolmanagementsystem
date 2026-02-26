import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FamilyService } from '../../../../core/services/family/family.service';
import { Family } from '../../../../core/models/family.model';

@Component({
  selector: 'app-family-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="family-list-container">
      <div class="list-header">
        <h1 class="list-title">FAMILY</h1>
        <div class="search-box">
          <label for="search">Search:</label>
          <input
            id="search"
            type="text"
            class="search-input"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            (input)="onSearch()"
            placeholder="Search by name, phone, SMS..."
          />
        </div>
      </div>

      <div class="table-wrapper">
        <table class="family-table">
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
              <th class="col-sortable" (click)="sortBy('familyId')">
                Family No <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='familyId'&&sortAsc" [class.fa-sort-down]="sortCol==='familyId'&&!sortAsc"></i>
              </th>
              <th class="col-sortable" (click)="sortBy('fatherName')">
                Father Name <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='fatherName'&&sortAsc" [class.fa-sort-down]="sortCol==='fatherName'&&!sortAsc"></i>
              </th>
              <th class="col-sortable" (click)="sortBy('fatherPhone')">
                Father Phone <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='fatherPhone'&&sortAsc" [class.fa-sort-down]="sortCol==='fatherPhone'&&!sortAsc"></i>
              </th>
              <th class="col-sortable" (click)="sortBy('motherPhone')">
                Mother Phone <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='motherPhone'&&sortAsc" [class.fa-sort-down]="sortCol==='motherPhone'&&!sortAsc"></i>
              </th>
              <th class="col-sortable" (click)="sortBy('students')">
                Students <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='students'&&sortAsc" [class.fa-sort-down]="sortCol==='students'&&!sortAsc"></i>
              </th>
              <th class="col-sortable" (click)="sortBy('fee')">
                Fee <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='fee'&&sortAsc" [class.fa-sort-down]="sortCol==='fee'&&!sortAsc"></i>
              </th>
              <th class="col-sortable" (click)="sortBy('totalDue')">
                Total Due <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='totalDue'&&sortAsc" [class.fa-sort-down]="sortCol==='totalDue'&&!sortAsc"></i>
              </th>
              <th class="col-sortable" (click)="sortBy('paid')">
                Paid <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='paid'&&sortAsc" [class.fa-sort-down]="sortCol==='paid'&&!sortAsc"></i>
              </th>
              <th class="col-sortable" (click)="sortBy('date')">
                Date <i class="fa fa-sort" [class.fa-sort-up]="sortCol==='date'&&sortAsc" [class.fa-sort-down]="sortCol==='date'&&!sortAsc"></i>
              </th>
              <th class="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading" class="loading-row">
              <td colspan="11">Loading...</td>
            </tr>
            <tr *ngIf="!loading && paginatedFamilies.length === 0" class="empty-row">
              <td colspan="11">No entries found</td>
            </tr>
            <tr *ngFor="let family of paginatedFamilies">
              <td class="col-checkbox">
                <input
                  type="checkbox"
                  [checked]="isSelected(family)"
                  (change)="toggleSelect(family)"
                />
              </td>
              <td>{{ family.familyId }}</td>
              <td>{{ family.fatherName || '-' }}</td>
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

      <div *ngIf="processing" class="processing-indicator">Processing...</div>

      <!-- Download button commented out
      <div class="footer-actions">
        <button class="btn-download" [disabled]="selectedIds.size === 0" (click)="downloadSelectedVouchers()">
          <i class="fa fa-download"></i> Download Selected Vouchers (Single File)
        </button>
      </div>
      -->

      <div class="pagination-bar">
        <div class="pagination-left">
          <span class="show-entries">
            Show
            <select
              class="entries-select"
              [ngModel]="pageSize"
              (ngModelChange)="onPageSizeChange($event)"
            >
              <option *ngFor="let opt of pageSizeOptions" [ngValue]="opt">{{ opt }}</option>
            </select>
            entries
          </span>
          <span class="pagination-info">
            Showing {{ startEntry }} to {{ endEntry }} of {{ filteredFamilies.length }} entries
          </span>
        </div>
        <div class="pagination-buttons">
          <button
            class="btn-pagination"
            [disabled]="currentPage <= 1"
            (click)="goToPage(currentPage - 1)"
          >
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
          <button
            class="btn-pagination"
            [disabled]="currentPage >= totalPages"
            (click)="goToPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .family-list-container {
      padding: 1.5rem 2rem;
      background-color: #f5ebe0;
      min-height: calc(100vh - 120px);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .list-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #333;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-box label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #555;
    }

    .search-input {
      padding: 0.4rem 0.75rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      background: #fff;
      font-size: 0.9rem;
      min-width: 200px;
    }

    .search-input:focus {
      outline: none;
      border-color: #a37b46;
    }

    .table-wrapper {
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    .family-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .family-table th,
    .family-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .family-table th {
      background: #f9f6f1;
      font-weight: 600;
      color: #444;
    }

    .family-table tbody tr:hover {
      background: #faf8f5;
    }

    .col-checkbox {
      width: 40px;
      text-align: center;
    }

    .col-sortable {
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    .col-sortable:hover {
      color: #a37b46;
    }

    .col-sortable i {
      margin-left: 0.25rem;
      font-size: 0.75rem;
      color: #999;
    }

    .col-action {
      width: 80px;
      text-align: center;
    }

    .loading-row td,
    .empty-row td {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.5rem;
      color: #555;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
    }

    .btn-action:hover {
      background: #eee;
      color: #a37b46;
    }

    .processing-indicator {
      text-align: center;
      padding: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .footer-actions {
      margin-bottom: 1rem;
    }

    .btn-download {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-download:hover:not(:disabled) {
      background: #218838;
    }

    .btn-download:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.75rem 0;
    }

    .pagination-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
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

    .entries-select:focus {
      outline: none;
      border-color: #a37b46;
    }

    .pagination-info {
      font-size: 0.9rem;
      color: #555;
    }

    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .btn-page-num {
      min-width: 2rem;
      padding: 0.4rem 0.6rem;
      border: 1px solid #d4c4a8;
      border-radius: 4px;
      background: #fff;
      font-size: 0.9rem;
      cursor: pointer;
      color: #555;
      transition: background 0.2s, border-color 0.2s;
    }

    .btn-page-num:hover:not(:disabled):not(.ellipsis) {
      background: #f9f6f1;
      border-color: #a37b46;
    }

    .btn-page-num.active {
      background: #a37b46;
      border-color: #a37b46;
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
      transition: background 0.2s, border-color 0.2s;
    }

    .btn-pagination:hover:not(:disabled) {
      background: #f9f6f1;
      border-color: #a37b46;
    }

    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .family-list-container {
        padding: 1rem;
      }

      .list-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .search-input {
        min-width: 100%;
      }
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

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: number[] = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1); // ellipsis
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push(-1);
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1);
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push(-1);
      pages.push(total);
    }
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
