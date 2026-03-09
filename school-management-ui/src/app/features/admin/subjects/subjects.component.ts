import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../../core/services/subject.service';
import { ClassService } from '../../../core/services/class.service';
import { Subject } from '../../../core/models/subject.model';
import { Class } from '../../../core/models/student.model';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  template: `
    <div class="subjects-container">
      <div class="page-header-card">
        <div class="header-content">
          <div>
            <h2>Subject Management</h2>
            <p class="page-subtitle">Manage subjects and assign to classes</p>
          </div>
          <button class="btn btn-primary" (click)="showAddForm = true">
            <i class="fa fa-plus"></i> Add New Subject
          </button>
        </div>
      </div>

      <div *ngIf="showAddForm || editingSubjectName" class="academy-form-card">
        <h3>{{ editingSubjectName ? 'Edit Subject' : 'Add New Subject' }}</h3>
        <form (ngSubmit)="saveSubject()">
          <div class="academy-form-row">
            <div class="academy-form-group">
              <label>Subject Name <span class="required">*</span></label>
              <input type="text" [(ngModel)]="subjectForm.name" name="name" required class="academy-input" placeholder="e.g., Mathematics">
            </div>
            <div class="academy-form-group academy-form-group-full">
              <label>Classes <span class="required">*</span></label>
              <div class="class-checkboxes">
                <label *ngFor="let cls of classes" class="checkbox-item">
                  <input type="checkbox" [value]="cls.classId" (change)="onClassCheckboxChange($event, cls.classId)" [checked]="selectedClassIds.includes(cls.classId)" />
                  <span>{{ cls.nameNumeric || cls.name }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="academy-form-actions">
            <button type="submit" class="btn btn-primary">Save Subject</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <div class="filters-card">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterSubjects()"
            placeholder="Search by subject name..."
            class="modern-form-control search-input">
        </div>
        <div class="class-filter-box">
          <button type="button" class="class-filter-trigger" (click)="toggleClassFilter($event)" [class.open]="classFilterOpen">
            <i class="fa fa-book"></i>
            <span>{{ getSelectedClassName() }}</span>
            <i class="fa fa-chevron-down trigger-chevron"></i>
          </button>
          <div class="class-filter-dropdown" *ngIf="classFilterOpen" (click)="$event.stopPropagation()">
            <button type="button" class="class-filter-option" [class.selected]="selectedClassId === null" (click)="selectClass(null)">
              All Classes
            </button>
            <button type="button" class="class-filter-option" *ngFor="let cls of classes" [class.selected]="selectedClassId === cls.classId" (click)="selectClass(cls.classId)">
              {{ cls.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="academy-table-card">
        <div class="academy-table-header">
          <div class="academy-table-title">Subjects List</div>
          <div class="academy-table-toolbar">
            <div class="show-entries">
              <span>Show</span>
              <app-dropdown
                [(ngModel)]="pageSize"
                [options]="pageSizeOpts"
                [searchable]="false"
                [showPlaceholderOption]="false"
                size="sm"
                (changed)="pageSizeChange()">
              </app-dropdown>
              <span>entries</span>
            </div>
            <div class="academy-table-count">Total: {{ filteredGroupedSubjects.length }} subject(s)</div>
          </div>
        </div>
        <div class="academy-table-responsive">
          <table class="academy-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Classes</th>
                <th>Actions</th>
              </tr>
            </thead>
          <tbody>
            <tr *ngFor="let group of paginatedGroupedSubjects">
              <td>{{ group.name }}</td>
              <td>{{ group.classLabels }}</td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon btn-edit" (click)="editByName(group.name)" title="Edit"><i class="fa fa-edit"></i></button>
                  <button class="btn-icon btn-delete" (click)="deleteByName(group.name)" title="Delete"><i class="fa fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredGroupedSubjects.length === 0">
              <td colspan="3" class="academy-table-empty"><p>No subjects found</p></td>
            </tr>
          </tbody>
        </table>
        </div>
        <div class="pagination-bar" *ngIf="filteredGroupedSubjects.length > 0">
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ getPageEndIndex() }} of {{ filteredGroupedSubjects.length }} entries
          </div>
          <div class="pagination-controls">
            <button class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(1)" title="First"><i class="fa fa-angle-double-left"></i></button>
            <button class="page-btn" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" title="Previous"><i class="fa fa-angle-left"></i></button>
            <span class="page-numbers">
              <button *ngFor="let p of getPageNumbers()" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            </span>
            <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" title="Next"><i class="fa fa-angle-right"></i></button>
            <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="goToPage(totalPages)" title="Last"><i class="fa fa-angle-double-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subjects-container { padding: 0; }
    .page-header-card {
      background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header-card h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f2744; }
    .page-subtitle { margin: 0.25rem 0 0 0; font-size: 0.9375rem; color: #6a8cad; }
    .academy-form-card {
      background: #fff; border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
    }
    .academy-form-card h3 { margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 700; color: #0f2744; }
    .academy-form-row { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .academy-form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #1e3a5f; }
    .academy-form-group .required { color: #dc2626; }
    .academy-form-group-full { grid-column: 1 / -1; }
    .academy-input {
      padding: 0.75rem 1rem; border: 2px solid #d9e2ec; border-radius: 0.75rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .academy-input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 4px rgba(30,58,95,0.12); }
    .academy-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eef2f7; }
    .btn { padding: 0.65rem 1.25rem; border: none; border-radius: 0.75rem; cursor: pointer; font-size: 0.9375rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #fff; box-shadow: 0 4px 14px rgba(30,58,95,0.35); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,95,0.4); }
    .btn-secondary { background: #6b7280; color: #fff; }
    .btn-secondary:hover { background: #4b5563; }
    .class-checkboxes { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-top: 0.25rem; }
    .checkbox-item {
      display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem;
      border-radius: 999px; border: 2px solid #d9e2ec; background: #fff; font-size: 0.9rem;
      cursor: pointer; font-weight: 500; color: #435d7a; transition: all 0.2s;
    }
    .checkbox-item:hover { border-color: #b5c9da; background: #f7f9fc; }
    .checkbox-item input { margin: 0; }
    .checkbox-item input:checked + span { color: #1e3a5f; font-weight: 600; }
    .checkbox-item:has(input:checked) { border-color: #1e3a5f; background: rgba(30,58,95,0.08); }
    .filters-card {
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .search-box { position: relative; flex: 1; min-width: 300px; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8aa8c4; z-index: 1; }
    .search-input { padding-left: 3rem; }
    .class-filter-box { position: relative; min-width: 220px; }
    .class-filter-trigger {
      display: flex; align-items: center; gap: 0.5rem; width: 100%; min-height: 44px; padding: 0.6rem 1rem;
      font-size: 0.9375rem; font-weight: 500; color: #0f2744; background: #fff; border: 1px solid #e2e8f0;
      border-radius: 10px; cursor: pointer; text-align: left; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .class-filter-trigger:hover { border-color: #cbd5e1; }
    .class-filter-trigger.open { border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.15); }
    .class-filter-trigger i.fa-book { color: #8aa8c4; font-size: 0.95rem; }
    .class-filter-trigger span { flex: 1; }
    .trigger-chevron { color: #8aa8c4; font-size: 0.75rem; transition: transform 0.2s ease; }
    .class-filter-trigger.open .trigger-chevron { transform: rotate(180deg); }
    .class-filter-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; padding: 6px;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); z-index: 1000;
    }
    .class-filter-option {
      display: block; width: 100%; padding: 10px 14px; font-size: 0.9375rem; font-weight: 500; color: #0f2744;
      background: transparent; border: none; border-radius: 6px; cursor: pointer; text-align: left; transition: background 0.15s, color 0.15s;
    }
    .class-filter-option:hover { background: #f1f5f9; color: #1e3a5f; }
    .class-filter-option.selected { background: rgba(30,58,95,0.1); color: #1e3a5f; }
    .academy-table-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .academy-table-header { padding: 1.25rem 1.5rem; background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .academy-table-title { font-size: 1.0625rem; font-weight: 700; color: #0f2744; }
    .academy-table-toolbar { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
    .show-entries { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6a8cad; }
    .entries-select { padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9rem; background: white; min-width: 60px; }
    .academy-table-count { font-size: 0.9rem; font-weight: 500; color: #6a8cad; }
    .pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; background: #fafbfc; flex-wrap: wrap; gap: 1rem; }
    .pagination-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; align-items: center; gap: 0.35rem; }
    .page-btn, .page-num { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; min-width: 38px; color: #334155; transition: all 0.2s ease; }
    .page-btn:hover:not(:disabled), .page-num:hover:not(.active) { background: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8fafc; }
    .page-num.active { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; border-color: transparent; }
    .page-numbers { display: flex; gap: 0.35rem; }
    .academy-table-responsive { overflow-x: auto; }
    .academy-table { width: 100%; border-collapse: collapse; }
    .academy-table thead { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); }
    .academy-table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.8125rem; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
    .academy-table td { padding: 1rem; border-bottom: 1px solid #eef2f7; font-size: 0.9375rem; color: #435d7a; }
    .academy-table tbody tr:hover { background: #f7f9fc; }
    .table-actions { display: flex; gap: 0.5rem; }
    .btn-icon { width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-edit { background: #2563eb; color: #fff; }
    .btn-edit:hover { background: #1d4ed8; }
    .btn-delete { background: #dc2626; color: #fff; }
    .btn-delete:hover { background: #b91c1c; }
    .academy-table-empty { padding: 3rem; text-align: center; color: #6a8cad; }
    .academy-table-empty p { margin: 0; font-size: 1rem; }
    @media (max-width: 768px) { .academy-form-row { grid-template-columns: 1fr; } .header-content { flex-direction: column; align-items: flex-start; } }
  `]
})
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  groupedSubjects: { name: string; classLabels: string; classIds: number[] }[] = [];
  filteredGroupedSubjects: { name: string; classLabels: string; classIds: number[] }[] = [];
  classes: Class[] = [];
  searchTerm = '';
  selectedClassId: number | null = null;
  classFilterOpen = false;
  pageSizeOptions = [10, 25, 50, 100];
  pageSize = 10;
  currentPage = 1;
  showAddForm: boolean = false;
  editingSubjectName: string | null = null;

  get pageSizeOpts(): DropdownOption[] {
    return this.pageSizeOptions.map(s => ({ value: s, label: '' + s }));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredGroupedSubjects.length / this.pageSize));
  }

  get paginatedGroupedSubjects(): { name: string; classLabels: string; classIds: number[] }[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredGroupedSubjects.slice(start, start + this.pageSize);
  }
  
  subjectForm: Partial<Subject> = {
    name: '',
    classId: undefined
  };

  selectedClassIds: number[] = [];

  constructor(
    private subjectService: SubjectService,
    private classService: ClassService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadSubjects();
    this.loadClasses();
  }

  loadSubjects() {
    this.subjectService.getAllSubjects().subscribe(subjects => {
      this.subjects = subjects;

      const map = new Map<string, { name: string; classIds: number[]; classLabels: string[] }>();

      for (const s of subjects) {
        const key = s.name.toLowerCase();
        const entry = map.get(key) || { name: s.name, classIds: [], classLabels: [] };

        const label = s.class?.nameNumeric || s.class?.name || '';
        if (s.classId && !entry.classIds.includes(s.classId)) {
          entry.classIds.push(s.classId);
        }
        if (label && !entry.classLabels.includes(label)) {
          entry.classLabels.push(label);
        }

        map.set(key, entry);
      }

      this.groupedSubjects = Array.from(map.values()).map(e => ({
        name: e.name,
        classIds: e.classIds,
        classLabels: e.classLabels.join(', ')
      }));
      this.filterSubjects();
    });
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  filterSubjects() {
    let list = this.groupedSubjects;
    if (this.selectedClassId != null) {
      list = list.filter(g => g.classIds.includes(this.selectedClassId!));
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(g => g.name?.toLowerCase().includes(term));
    }
    this.filteredGroupedSubjects = list;
    this.currentPage = 1;
  }

  toggleClassFilter(event: MouseEvent) {
    event.stopPropagation();
    this.classFilterOpen = !this.classFilterOpen;
  }

  selectClass(classId: number | null) {
    this.selectedClassId = classId;
    this.classFilterOpen = false;
    this.filterSubjects();
    this.cdr.detectChanges();
  }

  getSelectedClassName(): string {
    if (!this.selectedClassId) return 'All Classes';
    const cls = this.classes.find(c => c.classId === this.selectedClassId);
    return cls?.name ?? 'All Classes';
  }

  pageSizeChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = Math.max(1, Math.min(page, this.totalPages)); }
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
  getPageEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredGroupedSubjects.length);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target?.closest('.class-filter-box')) this.classFilterOpen = false;
  }

  saveSubject() {
    const name = (this.subjectForm.name || '').trim();
    if (!name || this.selectedClassIds.length === 0) {
      alert('Please enter a subject name and select at least one class.');
      return;
    }

    if (this.editingSubjectName) {
      this.subjectService.updateSubjectsByName({
        originalName: this.editingSubjectName,
        newName: name,
        classIds: this.selectedClassIds
      }).subscribe(() => {
        this.loadSubjects();
        this.cancelForm();
      });
    } else {
      this.subjectService.createSubjectForClasses({
        name,
        classIds: this.selectedClassIds
      }).subscribe(() => {
        this.loadSubjects();
        this.cancelForm();
      });
    }
  }

  editByName(name: string) {
    this.editingSubjectName = name;
    this.subjectForm = { name };
    const related = this.subjects.filter(s => s.name === name);
    this.selectedClassIds = related
      .map(s => s.classId!)
      .filter((id, idx, arr) => id && arr.indexOf(id) === idx);
    this.showAddForm = true;
  }

  deleteByName(name: string) {
    if (!confirm('Are you sure you want to delete this subject from all classes?')) {
      return;
    }
    const related = this.subjects.filter(s => s.name === name);
    if (related.length === 0) {
      return;
    }
    let pending = related.length;
    related.forEach(s => {
      this.subjectService.deleteSubject(s.subjectId).subscribe({
        next: () => {
          pending--;
          if (pending === 0) {
            this.loadSubjects();
          }
        },
        error: () => {
          pending--;
          if (pending === 0) {
            this.loadSubjects();
          }
        }
      });
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingSubjectName = null;
    this.subjectForm = {
      name: '',
      classId: undefined
    };
    this.selectedClassIds = [];
  }

  onClassCheckboxChange(event: Event, classId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedClassIds.includes(classId)) {
        this.selectedClassIds.push(classId);
      }
    } else {
      this.selectedClassIds = this.selectedClassIds.filter(id => id !== classId);
    }
  }
}

