import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { QuestionBankService } from '../../../core/services/question-bank.service';
import { ClassService } from '../../../core/services/class.service';
import { SubjectService } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';
import { Exam } from '../../../core/models/exam.model';
import { QuestionBank } from '../../../core/models/question-bank.model';
import { ExamQuestionRequest } from '../../../core/models/exam-question-request.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExamQuestionPaperComponent } from './exam-question-paper/exam-question-paper.component';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, LoadingComponent, ConfirmDialogComponent, ExamQuestionPaperComponent, DropdownComponent],
  template: `
    <div class="exams-container">
      <app-loading [show]="loading" [message]="'Loading exams...'"></app-loading>
      
      <div class="page-header">
        <div class="header-content">
          <h2><i class="fa fa-file-text"></i> Exam Management</h2>
          <button *ngIf="isAdmin" class="btn btn-primary" (click)="showAddForm = true" [disabled]="loading">
            <i class="fa fa-plus"></i> Add New Exam
          </button>
          <button *ngIf="!isAdmin" class="btn btn-primary" (click)="openQuestionPaperForm(null)" [disabled]="loading">
            <i class="fa fa-file-alt"></i> Generate Question Paper
          </button>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterExams()"
            placeholder="Search by exam name..."
            class="modern-form-control search-input">
        </div>
      </div>

      <div *ngIf="(showAddForm || editingExam) && isAdmin" class="modern-form-card">
        <h3>
          <i class="fa" [class.fa-file-plus]="!editingExam" [class.fa-file-edit]="editingExam"></i>
          {{ editingExam ? 'Edit Exam' : 'Add New Exam' }}
        </h3>
        <form (ngSubmit)="saveExam()">
          <div class="modern-form-group">
            <label>
              <i class="fa fa-file-text"></i>
              Exam Name
              <span class="required-indicator">*</span>
            </label>
            <div class="modern-input-wrapper">
              <i class="fa fa-file-text modern-input-icon"></i>
              <input 
                type="text" 
                [(ngModel)]="examForm.name" 
                name="name" 
                required 
                class="modern-form-control"
                placeholder="Enter exam name"
                [class.is-invalid]="submitted && !examForm.name">
            </div>
            <div *ngIf="submitted && !examForm.name" class="modern-invalid-feedback">
              <i class="fa fa-exclamation-circle"></i>
              Exam name is required
            </div>
          </div>
          <div class="modern-form-row">
            <div class="modern-form-group">
              <label>
                <i class="fa fa-calendar"></i>
                Date
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-calendar modern-input-icon"></i>
                <input 
                  type="date" 
                  [(ngModel)]="examForm.date" 
                  name="date" 
                  class="modern-form-control"
                  [value]="examForm.date ? formatDateForInput(examForm.date) : ''">
              </div>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-comment"></i>
                Comment
              </label>
              <div class="modern-input-wrapper">
                <i class="fa fa-comment modern-input-icon"></i>
                <input 
                  type="text" 
                  [(ngModel)]="examForm.comment" 
                  name="comment" 
                  class="modern-form-control"
                  placeholder="Additional notes">
              </div>
            </div>
          </div>
          <div class="modern-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <i class="fa" [class.fa-spinner]="saving" [class.fa-spin]="saving" [class.fa-save]="!saving"></i>
              <span *ngIf="saving">Saving...</span>
              <span *ngIf="!saving">Save Exam</span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()" [disabled]="saving">
              <i class="fa fa-times"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Exams List (Admin Only) -->
      <div class="modern-table-card" *ngIf="isAdmin">
        <div class="modern-table-header">
          <div class="modern-table-title">
            <i class="fa fa-table"></i>
            Exams List
          </div>
          <div class="modern-table-count">
            <i class="fa fa-file-text"></i>
            <span>Total: {{ filteredExams.length }} exam(s)</span>
          </div>
        </div>
        <div class="modern-table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th><i class="fa fa-hashtag"></i> ID</th>
                <th><i class="fa fa-file-text"></i> Exam Name</th>
                <th><i class="fa fa-calendar"></i> Date</th>
                <th><i class="fa fa-comment"></i> Comment</th>
                <th><i class="fa fa-cog"></i> Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let exam of filteredExams">
                <td>
                  <span class="id-badge">{{ exam.examId }}</span>
                </td>
                <td>
                  <strong>{{ exam.name }}</strong>
                </td>
                <td>
                  <span *ngIf="exam.date" class="date-badge">
                    <i class="fa fa-calendar"></i>
                    {{ exam.date | date:'mediumDate' }}
                  </span>
                  <span *ngIf="!exam.date" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="exam.comment" class="comment-text">{{ exam.comment }}</span>
                  <span *ngIf="!exam.comment" class="text-muted">-</span>
                </td>
                <td>
                  <div class="modern-table-actions">
                    <button class="modern-btn-icon modern-btn-generate" (click)="openQuestionPaperForm(exam)" title="Generate Question Paper">
                      <i class="fa fa-file-alt"></i>
                    </button>
                    <button *ngIf="isAdmin" class="modern-btn-icon modern-btn-edit" (click)="editExam(exam)" title="Edit Exam">
                      <i class="fa fa-edit"></i>
                    </button>
                    <button *ngIf="isAdmin" class="modern-btn-icon modern-btn-delete" (click)="confirmDelete(exam)" title="Delete Exam">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredExams.length === 0 && !loading">
                <td colspan="5" class="modern-table-empty">
                  <i class="fa fa-inbox"></i>
                  <p>No exams found</p>
                  <span *ngIf="searchTerm">Try adjusting your search criteria</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Question Paper Generation Form -->
      <div *ngIf="showQuestionPaperForm" class="modern-form-card">
        <h3>
          <i class="fa fa-file-alt"></i>
          Generate Question Paper{{ selectedExam ? ' - ' + selectedExam.name : '' }}
        </h3>
        <form (ngSubmit)="generateQuestionPaper()">
          <div class="modern-form-row">
            <div class="modern-form-group">
              <label>
                <i class="fa fa-book"></i>
                Class <span class="required-indicator">*</span>
              </label>
              <app-dropdown
                [(ngModel)]="questionPaperForm.classId"
                [options]="classOptions"
                placeholder="Select Class"
                [searchable]="true"
                (changed)="onQuestionPaperClassChange()">
              </app-dropdown>
            </div>
            <div class="modern-form-group">
              <label>
                <i class="fa fa-bookmark"></i>
                Subject <span class="required-indicator">*</span>
              </label>
              <app-dropdown
                [(ngModel)]="questionPaperForm.subjectId"
                [options]="subjectOptions"
                placeholder="Select Subject"
                [searchable]="true"
                [disabled]="!questionPaperForm.classId"
                (changed)="onQuestionPaperSubjectChange()">
              </app-dropdown>
            </div>
          </div>

          <div class="modern-form-group">
            <label>
              <i class="fa fa-list"></i>
              Question Selection <span class="required-indicator">*</span>
            </label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" [(ngModel)]="questionPaperForm.isFullBook" [value]="true" name="questionSelection" (change)="onQuestionSelectionChange()">
                <span>Full Book (All Questions)</span>
              </label>
              <label class="radio-label">
                <input type="radio" [(ngModel)]="questionPaperForm.isFullBook" [value]="false" name="questionSelection" (change)="onQuestionSelectionChange()">
                <span>Selected Chapters</span>
              </label>
            </div>
          </div>

          <div *ngIf="!questionPaperForm.isFullBook" class="modern-form-group">
            <label>
              <i class="fa fa-list-ul"></i>
              Select Chapters <span class="required-indicator">*</span>
            </label>
            <div class="chapters-list" *ngIf="availableChapters.length > 0">
              <label *ngFor="let chapter of availableChapters" class="checkbox-label">
                <input type="checkbox" [value]="chapter" [checked]="isChapterSelected(chapter)" (change)="toggleChapter(chapter)">
                <span>{{ chapter }}</span>
              </label>
            </div>
            <p *ngIf="availableChapters.length === 0 && questionPaperForm.classId && questionPaperForm.subjectId" class="text-muted">
              No chapters available for selected class and subject.
            </p>
          </div>

          <div class="modern-form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="generating || !canGeneratePaper()">
              <i class="fa" [class.fa-spinner]="generating" [class.fa-spin]="generating" [class.fa-file-alt]="!generating"></i>
              <span *ngIf="generating">Generating...</span>
              <span *ngIf="!generating">Generate Question Paper</span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelQuestionPaperForm()" [disabled]="generating">
              <i class="fa fa-times"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Question Paper Display -->
      <div *ngIf="showQuestionPaper && examQuestions.length > 0" class="question-paper-wrapper">
        <app-exam-question-paper
          [questions]="examQuestions"
          [examName]="selectedExam?.name || ''"
          [className]="selectedClassName"
          [subjectName]="selectedSubjectName"
          [selectedChapters]="questionPaperForm.selectedChapters"
          [examDate]="selectedExam?.date"
          (closeEvent)="cancelQuestionPaperForm()">
        </app-exam-question-paper>
      </div>

      <app-confirm-dialog
        [show]="showDeleteConfirm"
        title="Delete Exam"
        message="Are you sure you want to delete this exam? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="deleteExam()"
        (cancelled)="showDeleteConfirm = false; examToDelete = null">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .exams-container {
      padding: 2rem;
      position: relative;
    }
    
    .page-header {
      margin-bottom: 2rem;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .page-header h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .page-header h2 i {
      color: var(--primary);
    }
    
    .filters-section {
      margin-bottom: 2rem;
    }
    
    .search-box {
      position: relative;
      max-width: 400px;
    }
    
    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      z-index: 1;
    }
    
    .search-input {
      padding-left: 3rem;
    }
    
    .btn {
      padding: 0.875rem 1.75rem;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: var(--shadow-md);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    
    .btn-primary {
      background: var(--primary-gradient);
      color: var(--text-inverse);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .btn-secondary {
      background: var(--gray-600);
      color: var(--text-inverse);
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: var(--gray-700);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .id-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    
    .date-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: var(--bg-secondary);
      border-radius: var(--radius-full);
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    
    .date-badge i {
      color: var(--primary);
      font-size: 0.75rem;
    }
    
    .comment-text {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
    }
    
    .text-muted {
      color: var(--text-tertiary);
      font-style: italic;
    }

    .modern-btn-generate {
      background: #28a745;
      color: white;
    }

    .modern-btn-generate:hover {
      background: #218838;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .radio-label:hover {
      background: var(--bg-secondary);
    }

    .radio-label input[type="radio"] {
      cursor: pointer;
    }

    .chapters-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-top: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 4px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .checkbox-label:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .checkbox-label input[type="checkbox"] {
      cursor: pointer;
    }

    .question-paper-wrapper {
      margin-top: 2rem;
    }

    @media print {
      /* Hide everything in the exams container except question paper */
      .exams-container > *:not(.question-paper-wrapper) {
        display: none !important;
      }

      .question-paper-wrapper {
        margin: 0 !important;
        padding: 0 !important;
        position: static !important;
        top: auto !important;
        left: auto !important;
        width: 100% !important;
        height: auto !important;
        min-height: auto !important;
        background: white !important;
        overflow: visible !important;
        page-break-inside: auto !important;
      }

      /* Ensure container allows content to flow */
      .exams-container {
        height: auto !important;
        overflow: visible !important;
      }
    }
    
    @media (max-width: 768px) {
      .exams-container {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .search-box {
        width: 100%;
        max-width: none;
      }
    }
  `]
})
export class ExamsComponent implements OnInit {
  exams: Exam[] = [];
  filteredExams: Exam[] = [];
  searchTerm: string = '';
  showAddForm: boolean = false;
  editingExam: Exam | null = null;
  loading: boolean = false;
  saving: boolean = false;
  submitted: boolean = false;
  showDeleteConfirm: boolean = false;
  examToDelete: number | null = null;
  
  // Question Paper Generation
  showQuestionPaperForm: boolean = false;
  showQuestionPaper: boolean = false;
  generating: boolean = false;
  examQuestions: QuestionBank[] = [];
  selectedExam: Exam | null = null;
  classes: any[] = [];
  questionPaperSubjects: any[] = [];
  availableChapters: string[] = [];
  selectedClassName: string = '';
  selectedSubjectName: string = '';
  
  questionPaperForm: Partial<ExamQuestionRequest> = {
    classId: undefined,
    subjectId: undefined,
    isFullBook: true,
    selectedChapters: []
  };
  
  examForm: Partial<Exam> = {
    name: '',
    date: undefined,
    comment: ''
  };

  isAdmin: boolean = false;

  get classOptions(): DropdownOption[] {
    return this.classes.map(c => ({ value: c.classId, label: c.name }));
  }

  get subjectOptions(): DropdownOption[] {
    return this.questionPaperSubjects.map(s => ({ value: s.subjectId, label: s.name }));
  }

  constructor(
    private examService: ExamService,
    private questionBankService: QuestionBankService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    const userRoles = this.authService.getUserRoles();
    this.isAdmin = userRoles.includes('admin');
  }

  ngOnInit() {
    this.loadExams();
    this.loadClasses();
  }

  loadExams() {
    this.loading = true;
    this.examService.getAllExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.filteredExams = exams;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load exams');
        console.error('Error loading exams:', error);
        this.loading = false;
      }
    });
  }

  filterExams() {
    if (!this.searchTerm.trim()) {
      this.filteredExams = this.exams;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredExams = this.exams.filter(exam =>
      exam.name?.toLowerCase().includes(term) ||
      exam.comment?.toLowerCase().includes(term)
    );
  }

  formatDateForInput(date: string | Date | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  saveExam() {
    this.submitted = true;
    
    if (!this.examForm.name) {
      this.notificationService.warning('Please enter an exam name');
      return;
    }

    this.saving = true;
    const operation = this.editingExam
      ? this.examService.updateExam(this.editingExam.examId, this.examForm as Exam)
      : this.examService.createExam(this.examForm as Exam);

    operation.subscribe({
      next: () => {
        this.notificationService.success(
          this.editingExam ? 'Exam updated successfully' : 'Exam created successfully'
        );
        this.loadExams();
        this.cancelForm();
        this.saving = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to save exam';
        this.notificationService.error(errorMsg);
        console.error('Error saving exam:', error);
        this.saving = false;
      }
    });
  }

  editExam(exam: Exam) {
    this.editingExam = exam;
    this.examForm = { ...exam };
    this.showAddForm = true;
    this.submitted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDelete(exam: Exam) {
    this.examToDelete = exam.examId;
    this.showDeleteConfirm = true;
  }

  deleteExam() {
    if (!this.examToDelete) return;

    this.loading = true;
    this.examService.deleteExam(this.examToDelete).subscribe({
      next: () => {
        this.notificationService.success('Exam deleted successfully');
        this.loadExams();
        this.showDeleteConfirm = false;
        this.examToDelete = null;
        this.loading = false;
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Failed to delete exam';
        this.notificationService.error(errorMsg);
        console.error('Error deleting exam:', error);
        this.showDeleteConfirm = false;
        this.examToDelete = null;
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingExam = null;
    this.submitted = false;
    this.examForm = {
      name: '',
      date: undefined,
      comment: ''
    };
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
      }
    });
  }

  openQuestionPaperForm(exam: Exam | null) {
    this.selectedExam = exam;
    this.showQuestionPaperForm = true;
    this.showQuestionPaper = false;
    this.questionPaperForm = {
      classId: undefined,
      subjectId: undefined,
      isFullBook: true,
      selectedChapters: []
    };
    this.availableChapters = [];
    this.questionPaperSubjects = [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onQuestionPaperClassChange() {
    if (this.questionPaperForm.classId) {
      const classId = typeof this.questionPaperForm.classId === 'string' 
        ? parseInt(this.questionPaperForm.classId, 10) 
        : this.questionPaperForm.classId;
      
      if (classId && !isNaN(classId)) {
        this.subjectService.getSubjectsByClass(classId).subscribe({
          next: (subjects) => {
            this.questionPaperSubjects = subjects;
            const selectedClass = this.classes.find(c => c.classId === classId);
            this.selectedClassName = selectedClass?.name || '';
          },
          error: (error) => {
            console.error('Error loading subjects:', error);
            this.questionPaperSubjects = [];
          }
        });
      }
    } else {
      this.questionPaperSubjects = [];
    }
    this.questionPaperForm.subjectId = undefined;
    this.availableChapters = [];
    this.questionPaperForm.selectedChapters = [];
  }

  onQuestionPaperSubjectChange() {
    if (this.questionPaperForm.classId && this.questionPaperForm.subjectId) {
      const classId = typeof this.questionPaperForm.classId === 'string' 
        ? parseInt(this.questionPaperForm.classId, 10) 
        : this.questionPaperForm.classId;
      const subjectId = typeof this.questionPaperForm.subjectId === 'string' 
        ? parseInt(this.questionPaperForm.subjectId, 10) 
        : this.questionPaperForm.subjectId;
      
      if (classId && !isNaN(classId) && subjectId && !isNaN(subjectId)) {
        this.questionBankService.getChapters(classId, subjectId).subscribe({
          next: (chapters) => {
            this.availableChapters = chapters;
            const selectedSubject = this.questionPaperSubjects.find(s => s.subjectId === subjectId);
            this.selectedSubjectName = selectedSubject?.name || '';
          },
          error: (error) => {
            console.error('Error loading chapters:', error);
            this.availableChapters = [];
          }
        });
      }
    } else {
      this.availableChapters = [];
    }
    this.questionPaperForm.selectedChapters = [];
  }

  onQuestionSelectionChange() {
    if (this.questionPaperForm.isFullBook) {
      this.questionPaperForm.selectedChapters = [];
    }
  }

  isChapterSelected(chapter: string): boolean {
    return this.questionPaperForm.selectedChapters?.includes(chapter) || false;
  }

  toggleChapter(chapter: string) {
    if (!this.questionPaperForm.selectedChapters) {
      this.questionPaperForm.selectedChapters = [];
    }
    
    const index = this.questionPaperForm.selectedChapters.indexOf(chapter);
    if (index > -1) {
      this.questionPaperForm.selectedChapters.splice(index, 1);
    } else {
      this.questionPaperForm.selectedChapters.push(chapter);
    }
  }

  canGeneratePaper(): boolean {
    if (!this.questionPaperForm.classId || !this.questionPaperForm.subjectId) {
      return false;
    }
    
    if (this.questionPaperForm.isFullBook) {
      return true;
    }
    
    return (this.questionPaperForm.selectedChapters?.length || 0) > 0;
  }

  generateQuestionPaper() {
    if (!this.canGeneratePaper()) {
      this.notificationService.warning('Please select class, subject, and chapters (if not full book)');
      return;
    }

    this.generating = true;
    
    const classId = typeof this.questionPaperForm.classId === 'string' 
      ? parseInt(this.questionPaperForm.classId, 10) 
      : this.questionPaperForm.classId!;
    const subjectId = typeof this.questionPaperForm.subjectId === 'string' 
      ? parseInt(this.questionPaperForm.subjectId, 10) 
      : this.questionPaperForm.subjectId!;

    const request: ExamQuestionRequest = {
      classId: classId,
      subjectId: subjectId,
      isFullBook: this.questionPaperForm.isFullBook || false,
      selectedChapters: this.questionPaperForm.isFullBook ? undefined : this.questionPaperForm.selectedChapters
    };

    this.questionBankService.getQuestionsForExam(request).subscribe({
      next: (questions) => {
        if (questions.length === 0) {
          this.notificationService.warning('No questions found for the selected criteria');
          this.generating = false;
          return;
        }
        
        this.examQuestions = questions;
        this.showQuestionPaper = true;
        this.showQuestionPaperForm = false;
        this.generating = false;
        
        // Scroll to question paper
        setTimeout(() => {
          const element = document.querySelector('.question-paper-wrapper');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
      error: (error) => {
        this.notificationService.error('Failed to generate question paper');
        console.error('Error generating question paper:', error);
        this.generating = false;
      }
    });
  }

  cancelQuestionPaperForm() {
    this.showQuestionPaperForm = false;
    this.showQuestionPaper = false;
    this.selectedExam = null;
    this.examQuestions = [];
    this.questionPaperForm = {
      classId: undefined,
      subjectId: undefined,
      isFullBook: true,
      selectedChapters: []
    };
    this.availableChapters = [];
    this.questionPaperSubjects = [];
  }
}
