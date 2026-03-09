import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionBankService } from '../../../core/services/question-bank.service';
import { ClassService } from '../../../core/services/class.service';
import { SubjectService } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuestionBank } from '../../../core/models/question-bank.model';
import { Class } from '../../../core/models/student.model';
import { Subject } from '../../../core/models/subject.model';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  template: `
    <div class="question-bank-container">
      <div class="page-header">
        <h2>Question Bank Management</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="downloadTemplate()">
            <i class="fa fa-download"></i> Download Template
          </button>
          <button class="btn btn-primary" (click)="showAddForm = true">
            <i class="fa fa-plus"></i> Add New Question
          </button>
        </div>
      </div>

      <!-- Excel Upload Section -->
      <div class="upload-card">
        <h3>Bulk Upload Questions</h3>
        <div class="upload-section">
          <input type="file" #fileInput accept=".xlsx,.xls" (change)="onFileSelected($event)" style="display: none;">
          <button class="btn btn-secondary" (click)="fileInput.click()">
            <i class="fa fa-upload"></i> Select Excel File
          </button>
          <span *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</span>
          <button *ngIf="selectedFile" class="btn btn-primary" (click)="uploadExcel()" [disabled]="uploading">
            <i class="fa fa-upload"></i> {{ uploading ? 'Uploading...' : 'Upload' }}
          </button>
        </div>
        
        <!-- Upload Results -->
        <div *ngIf="uploadResult" class="upload-result" [class.success]="uploadResult.successCount > 0" [class.error]="uploadResult.failureCount > 0">
          <h4>Upload Results</h4>
          <div class="result-summary">
            <p><strong>Total Rows:</strong> {{ uploadResult.totalRows }}</p>
            <p class="success-text"><strong>Successfully Imported:</strong> {{ uploadResult.successCount }}</p>
            <p class="error-text" *ngIf="uploadResult.failureCount > 0"><strong>Failed:</strong> {{ uploadResult.failureCount }}</p>
          </div>
          <div *ngIf="uploadResult.errors && uploadResult.errors.length > 0" class="errors">
            <h5>Errors:</h5>
            <ul>
              <li *ngFor="let error of uploadResult.errors">{{ error }}</li>
            </ul>
          </div>
          <div *ngIf="uploadResult.warnings && uploadResult.warnings.length > 0" class="warnings">
            <h5>Warnings:</h5>
            <ul>
              <li *ngFor="let warning of uploadResult.warnings">{{ warning }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <h3>Filter Questions</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Class</label>
            <app-dropdown
              [(ngModel)]="filterClassId"
              [options]="filterClassOptions"
              placeholder="All Classes"
              (changed)="onFilterChange()">
            </app-dropdown>
          </div>
          <div class="form-group">
            <label>Subject</label>
            <app-dropdown
              [(ngModel)]="filterSubjectId"
              [options]="filterSubjectOptions"
              placeholder="All Subjects"
              [disabled]="!filterClassId"
              (changed)="onFilterChange()">
            </app-dropdown>
          </div>
          <div class="form-group">
            <label>Chapter</label>
            <app-dropdown
              [(ngModel)]="filterChapter"
              [options]="filterChapterOptions"
              placeholder="All Chapters"
              [disabled]="!filterClassId || !filterSubjectId"
              (changed)="onFilterChange()">
            </app-dropdown>
          </div>
        </div>
        <button class="btn btn-secondary" (click)="clearFilters()">Clear Filters</button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showAddForm || editingQuestion" class="form-card">
        <h3>{{ editingQuestion ? 'Edit Question' : 'Add New Question' }}</h3>
        <form (ngSubmit)="saveQuestion()" #formRef="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label>Class *</label>
              <app-dropdown
                [(ngModel)]="questionForm.classId"
                [ngModelOptions]="{standalone: true}"
                [options]="formClassOptions"
                placeholder="Select Class"
                [placeholderValue]="''"
                (changed)="onClassChange()">
              </app-dropdown>
            </div>
            <div class="form-group">
              <label>Subject *</label>
              <app-dropdown
                [(ngModel)]="questionForm.subjectId"
                [ngModelOptions]="{standalone: true}"
                [options]="formSubjectOptions"
                placeholder="Select Subject"
                [placeholderValue]="''"
                [disabled]="!questionForm.classId"
                (changed)="onSubjectChange()">
              </app-dropdown>
            </div>
            <div class="form-group">
              <label>Chapter Name *</label>
              <input type="text" [(ngModel)]="questionForm.chapterName" name="chapterName" required class="form-control" placeholder="Enter chapter name">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Question Type *</label>
              <app-dropdown
                [(ngModel)]="questionForm.questionType"
                [ngModelOptions]="{standalone: true}"
                [options]="questionTypeOptions"
                [showPlaceholderOption]="false"
                [searchable]="false"
                (changed)="onQuestionTypeChange()">
              </app-dropdown>
            </div>
            <div class="form-group">
              <label>Difficulty Level *</label>
              <app-dropdown
                [(ngModel)]="questionForm.difficultyLevel"
                [ngModelOptions]="{standalone: true}"
                [options]="difficultyLevelOptions"
                [showPlaceholderOption]="false"
                [searchable]="false">
              </app-dropdown>
            </div>
            <div class="form-group">
              <label>Marks *</label>
              <input type="number" [(ngModel)]="questionForm.marks" name="marks" required min="0.5" step="0.5" class="form-control">
            </div>
          </div>

          <div class="form-group">
            <label>Question Text *</label>
            <textarea [(ngModel)]="questionForm.questionText" name="questionText" required class="form-control" rows="4" placeholder="Enter the question"></textarea>
          </div>

          <!-- Multiple Choice Options -->
          <div *ngIf="questionForm.questionType === 'MultipleChoice'" class="form-row">
            <div class="form-group">
              <label>Option A *</label>
              <input type="text" [(ngModel)]="questionForm.optionA" name="optionA" required class="form-control">
            </div>
            <div class="form-group">
              <label>Option B *</label>
              <input type="text" [(ngModel)]="questionForm.optionB" name="optionB" required class="form-control">
            </div>
          </div>
          <div *ngIf="questionForm.questionType === 'MultipleChoice'" class="form-row">
            <div class="form-group">
              <label>Option C *</label>
              <input type="text" [(ngModel)]="questionForm.optionC" name="optionC" required class="form-control">
            </div>
            <div class="form-group">
              <label>Option D *</label>
              <input type="text" [(ngModel)]="questionForm.optionD" name="optionD" required class="form-control">
            </div>
          </div>
          <div *ngIf="questionForm.questionType === 'MultipleChoice'" class="form-group">
            <label>Correct Answer *</label>
            <app-dropdown
              [(ngModel)]="questionForm.correctAnswer"
              [ngModelOptions]="{standalone: true}"
              [options]="mcqAnswerOptions"
              placeholder="Select Answer"
              [placeholderValue]="''"
              [searchable]="false">
            </app-dropdown>
          </div>

          <!-- True/False Options -->
          <div *ngIf="questionForm.questionType === 'TrueFalse'" class="form-group">
            <label>Correct Answer *</label>
            <app-dropdown
              [(ngModel)]="questionForm.correctAnswer"
              [ngModelOptions]="{standalone: true}"
              [options]="trueFalseAnswerOptions"
              placeholder="Select Answer"
              [placeholderValue]="''"
              [searchable]="false">
            </app-dropdown>
          </div>

          <!-- Short Answer / Essay -->
          <div *ngIf="questionForm.questionType === 'ShortAnswer' || questionForm.questionType === 'Essay'" class="form-group">
            <label>Correct Answer / Sample Answer</label>
            <textarea [(ngModel)]="questionForm.correctAnswer" name="correctAnswer" class="form-control" rows="3" placeholder="Enter sample answer or key points"></textarea>
          </div>

          <div class="form-group">
            <label>Explanation</label>
            <textarea [(ngModel)]="questionForm.explanation" name="explanation" class="form-control" rows="3" placeholder="Optional explanation for the answer"></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="!formRef.valid">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Questions List -->
      <div class="table-card">
        <div class="table-header">
          <h3>Questions ({{ filteredQuestions.length }})</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Question</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Chapter</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let question of filteredQuestions">
              <td>{{ question.questionBankId }}</td>
              <td class="question-text">{{ question.questionText | slice:0:50 }}{{ question.questionText.length > 50 ? '...' : '' }}</td>
              <td>{{ question.class?.name || '-' }}</td>
              <td>{{ question.subject?.name || '-' }}</td>
              <td>{{ question.chapterName }}</td>
              <td><span class="badge badge-{{ question.questionType.toLowerCase() }}">{{ question.questionType }}</span></td>
              <td><span class="badge badge-{{ question.difficultyLevel.toLowerCase() }}">{{ question.difficultyLevel }}</span></td>
              <td>{{ question.marks }}</td>
              <td>
                <button class="btn btn-sm btn-edit" (click)="editQuestion(question)" title="Edit">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" (click)="deleteQuestion(question.questionBankId)" title="Delete">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredQuestions.length === 0">
              <td colspan="9" class="text-center">No questions found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .question-bank-container {
      padding: 2rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .page-header h2 {
      margin: 0;
      color: #333;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    .btn-edit {
      background: #3498db;
      color: white;
      margin-right: 0.5rem;
    }
    .btn-delete {
      background: #e74c3c;
      color: white;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .filters-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .filters-card h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #667eea;
    }
    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-card h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #667eea;
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    .form-control:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .table-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .table-header {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #ddd;
    }
    .table-header h3 {
      margin: 0;
      color: #333;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table thead {
      background: #667eea;
      color: white;
    }
    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .data-table tbody tr:hover {
      background: #f8f9fa;
    }
    .question-text {
      max-width: 300px;
      word-wrap: break-word;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-multiplechoice {
      background: #3498db;
      color: white;
    }
    .badge-truefalse {
      background: #9b59b6;
      color: white;
    }
    .badge-shortanswer {
      background: #f39c12;
      color: white;
    }
    .badge-essay {
      background: #e67e22;
      color: white;
    }
    .badge-easy {
      background: #27ae60;
      color: white;
    }
    .badge-medium {
      background: #f39c12;
      color: white;
    }
    .badge-hard {
      background: #e74c3c;
      color: white;
    }
    .text-center {
      text-align: center;
      padding: 2rem;
      color: #999;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .upload-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .upload-card h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #667eea;
    }
    .upload-section {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .file-name {
      color: #555;
      font-size: 0.9rem;
    }
    .upload-result {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 4px;
      background: #f8f9fa;
      border-left: 4px solid #667eea;
    }
    .upload-result.success {
      border-left-color: #27ae60;
    }
    .upload-result.error {
      border-left-color: #e74c3c;
    }
    .upload-result h4 {
      margin-top: 0;
      margin-bottom: 0.75rem;
    }
    .result-summary {
      margin-bottom: 1rem;
    }
    .result-summary p {
      margin: 0.5rem 0;
    }
    .success-text {
      color: #27ae60;
      font-weight: 600;
    }
    .error-text {
      color: #e74c3c;
      font-weight: 600;
    }
    .errors, .warnings {
      margin-top: 1rem;
    }
    .errors h5 {
      color: #e74c3c;
      margin-bottom: 0.5rem;
    }
    .warnings h5 {
      color: #f39c12;
      margin-bottom: 0.5rem;
    }
    .errors ul, .warnings ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    .errors li {
      color: #e74c3c;
      margin: 0.25rem 0;
    }
    .warnings li {
      color: #f39c12;
      margin: 0.25rem 0;
    }
  `]
})
export class QuestionBankComponent implements OnInit {
  questions: QuestionBank[] = [];
  filteredQuestions: QuestionBank[] = [];
  classes: Class[] = [];
  subjects: Subject[] = [];
  formSubjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  chapters: string[] = [];
  
  showAddForm: boolean = false;
  editingQuestion: QuestionBank | null = null;
  
  filterClassId?: number;
  filterSubjectId?: number;
  filterChapter?: string;

  questionTypeOptions: DropdownOption[] = [
    { value: 'MultipleChoice', label: 'Multiple Choice' },
    { value: 'TrueFalse', label: 'True/False' },
    { value: 'ShortAnswer', label: 'Short Answer' },
    { value: 'Essay', label: 'Essay' }
  ];
  difficultyLevelOptions: DropdownOption[] = [
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' }
  ];
  mcqAnswerOptions: DropdownOption[] = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' }
  ];
  trueFalseAnswerOptions: DropdownOption[] = [
    { value: 'True', label: 'True' },
    { value: 'False', label: 'False' }
  ];
  get filterClassOptions(): DropdownOption[] {
    return this.classes.map(cls => ({ value: cls.classId, label: cls.name }));
  }

  get filterSubjectOptions(): DropdownOption[] {
    return this.filteredSubjects.map(s => ({ value: s.subjectId, label: s.name }));
  }

  get filterChapterOptions(): DropdownOption[] {
    return this.chapters.map(ch => ({ value: ch, label: ch }));
  }

  get formClassOptions(): DropdownOption[] {
    return this.classes.map(cls => ({ value: String(cls.classId), label: cls.name }));
  }

  get formSubjectOptions(): DropdownOption[] {
    return this.formSubjects.map(s => ({ value: String(s.subjectId), label: s.name }));
  }
  
  selectedFile: File | null = null;
  uploading: boolean = false;
  uploadResult: any = null;
  
  questionForm: Partial<QuestionBank> = {
    questionText: '',
    questionType: 'MultipleChoice',
    difficultyLevel: 'Medium',
    marks: 1,
    chapterName: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    explanation: ''
  };

  private currentUserId: number;

  constructor(
    private questionBankService: QuestionBankService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private authService: AuthService
  ) {
    const userId = this.authService.getUserId();
    this.currentUserId = userId ?? 0;
  }

  ngOnInit() {
    this.loadQuestions();
    this.loadClasses();
    this.loadAllSubjects();
  }

  loadQuestions() {
    this.questionBankService.getQuestionsByTeacher(this.currentUserId).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      }
    });
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

  loadAllSubjects() {
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.filteredSubjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      }
    });
  }

  onClassChange() {
    // Convert classId to number if it's a string (from select dropdown)
    const classId = typeof this.questionForm.classId === 'string' 
      ? parseInt(this.questionForm.classId, 10) 
      : this.questionForm.classId;
    
    if (classId && !isNaN(classId)) {
      this.subjectService.getSubjectsByClass(classId).subscribe({
        next: (subjects) => {
          this.formSubjects = subjects;
          console.log('Subjects loaded for class:', classId, subjects);
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
          this.formSubjects = [];
        }
      });
    } else {
      this.formSubjects = [];
    }
    this.questionForm.subjectId = undefined;
  }

  onSubjectChange() {
    // Convert IDs to numbers if they're strings
    const classId = typeof this.questionForm.classId === 'string' 
      ? parseInt(this.questionForm.classId, 10) 
      : this.questionForm.classId;
    const subjectId = typeof this.questionForm.subjectId === 'string' 
      ? parseInt(this.questionForm.subjectId, 10) 
      : this.questionForm.subjectId;
    
    if (classId && !isNaN(classId) && subjectId && !isNaN(subjectId)) {
      this.loadChapters(classId, subjectId);
    }
  }

  onQuestionTypeChange() {
    // Clear options when question type changes
    if (this.questionForm.questionType !== 'MultipleChoice') {
      this.questionForm.optionA = '';
      this.questionForm.optionB = '';
      this.questionForm.optionC = '';
      this.questionForm.optionD = '';
    }
    if (this.questionForm.questionType !== 'TrueFalse') {
      // Keep correct answer for other types
    }
  }

  loadChapters(classId: number, subjectId: number) {
    this.questionBankService.getChapters(classId, subjectId).subscribe({
      next: (chapters) => {
        this.chapters = chapters;
      },
      error: (error) => {
        console.error('Error loading chapters:', error);
        this.chapters = [];
      }
    });
  }

  onFilterChange() {
    // Convert filterClassId to number if it's a string
    if (this.filterClassId !== undefined && this.filterClassId !== null) {
      const classId = typeof this.filterClassId === 'string' 
        ? (this.filterClassId === '' ? undefined : parseInt(this.filterClassId, 10))
        : this.filterClassId;
      
      // Update the filter property with the converted value
      this.filterClassId = classId;
      
      if (classId && !isNaN(classId)) {
        this.subjectService.getSubjectsByClass(classId).subscribe({
          next: (subjects) => {
            this.filteredSubjects = subjects;
            // Reset subject filter if current selection is not in the new list
            if (this.filterSubjectId && !subjects.some(s => s.subjectId === this.filterSubjectId)) {
              this.filterSubjectId = undefined;
              this.filterChapter = undefined;
              this.chapters = [];
            }
          },
          error: (error) => {
            console.error('Error loading subjects for filter:', error);
            this.filteredSubjects = [];
          }
        });
      } else {
        this.filteredSubjects = this.subjects;
        this.filterSubjectId = undefined;
        this.filterChapter = undefined;
        this.chapters = [];
      }
    } else {
      this.filteredSubjects = this.subjects;
      this.filterSubjectId = undefined;
      this.filterChapter = undefined;
      this.chapters = [];
    }

    // Convert filterSubjectId to number if it's a string
    if (this.filterSubjectId !== undefined && this.filterSubjectId !== null) {
      const subjectId = typeof this.filterSubjectId === 'string' 
        ? (this.filterSubjectId === '' ? undefined : parseInt(this.filterSubjectId, 10))
        : this.filterSubjectId;
      
      // Update the filter property with the converted value
      this.filterSubjectId = subjectId;

      if (this.filterClassId && !isNaN(this.filterClassId) && subjectId && !isNaN(subjectId)) {
        this.loadChapters(this.filterClassId, subjectId);
      } else {
        this.chapters = [];
        this.filterChapter = undefined;
      }
    } else {
      this.chapters = [];
      this.filterChapter = undefined;
    }

    this.applyFilters();
  }

  applyFilters() {
    this.filteredQuestions = this.questions.filter(q => {
      // Convert filter values to numbers for comparison
      const filterClassId = typeof this.filterClassId === 'string' 
        ? (this.filterClassId === '' || this.filterClassId === 'undefined' ? undefined : parseInt(this.filterClassId, 10))
        : this.filterClassId;
      
      const filterSubjectId = typeof this.filterSubjectId === 'string' 
        ? (this.filterSubjectId === '' || this.filterSubjectId === 'undefined' ? undefined : parseInt(this.filterSubjectId, 10))
        : this.filterSubjectId;
      
      // Apply filters
      if (filterClassId !== undefined && filterClassId !== null && q.classId !== filterClassId) {
        return false;
      }
      if (filterSubjectId !== undefined && filterSubjectId !== null && q.subjectId !== filterSubjectId) {
        return false;
      }
      if (this.filterChapter && this.filterChapter !== 'undefined' && q.chapterName.toLowerCase() !== this.filterChapter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  clearFilters() {
    this.filterClassId = undefined;
    this.filterSubjectId = undefined;
    this.filterChapter = undefined;
    this.filteredSubjects = this.subjects;
    this.chapters = [];
    this.applyFilters();
  }

  saveQuestion() {
    // Convert IDs to numbers if they're strings
    const classId = typeof this.questionForm.classId === 'string' 
      ? parseInt(this.questionForm.classId, 10) 
      : this.questionForm.classId;
    const subjectId = typeof this.questionForm.subjectId === 'string' 
      ? parseInt(this.questionForm.subjectId, 10) 
      : this.questionForm.subjectId;
    
    if (!classId || !subjectId || !this.questionForm.chapterName || !this.questionForm.questionText) {
      alert('Please fill in all required fields');
      return;
    }

    const question: QuestionBank = {
      ...this.questionForm,
      classId: classId,
      subjectId: subjectId,
      chapterName: this.questionForm.chapterName!,
      questionText: this.questionForm.questionText!,
      questionType: this.questionForm.questionType!,
      difficultyLevel: this.questionForm.difficultyLevel!,
      marks: this.questionForm.marks || 1,
      teacherId: this.currentUserId
    } as QuestionBank;

    if (this.editingQuestion) {
      this.questionBankService.updateQuestion(this.editingQuestion.questionBankId, question).subscribe({
        next: () => {
          this.loadQuestions();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error updating question:', error);
          alert('Error updating question. Please try again.');
        }
      });
    } else {
      this.questionBankService.createQuestion(question).subscribe({
        next: () => {
          this.loadQuestions();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error creating question:', error);
          alert('Error creating question. Please try again.');
        }
      });
    }
  }

  editQuestion(question: QuestionBank) {
    this.editingQuestion = question;
    this.questionForm = {
      ...question,
      classId: question.classId,
      subjectId: question.subjectId,
      chapterName: question.chapterName,
      questionText: question.questionText,
      questionType: question.questionType,
      difficultyLevel: question.difficultyLevel,
      marks: question.marks,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    };
    
    // Load subjects for the selected class
    if (question.classId) {
      // Ensure classId is a number
      const classId = typeof question.classId === 'string' 
        ? parseInt(question.classId, 10) 
        : question.classId;
      
      if (classId && !isNaN(classId)) {
        this.subjectService.getSubjectsByClass(classId).subscribe({
          next: (subjects) => {
            this.formSubjects = subjects;
            // Load chapters if subject is also set
            if (question.subjectId) {
              const subjectId = typeof question.subjectId === 'string' 
                ? parseInt(question.subjectId, 10) 
                : question.subjectId;
              if (subjectId && !isNaN(subjectId)) {
                this.loadChapters(classId, subjectId);
              }
            }
          },
          error: (error) => {
            console.error('Error loading subjects for edit:', error);
            this.formSubjects = [];
          }
        });
      }
    }
    
    this.showAddForm = true;
  }

  deleteQuestion(id: number) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.questionBankService.deleteQuestion(id).subscribe({
        next: () => {
          this.loadQuestions();
        },
        error: (error) => {
          console.error('Error deleting question:', error);
          alert('Error deleting question. Please try again.');
        }
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingQuestion = null;
    this.questionForm = {
      questionText: '',
      questionType: 'MultipleChoice',
      difficultyLevel: 'Medium',
      marks: 1,
      chapterName: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      explanation: ''
    };
    this.formSubjects = [];
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }
      
      this.selectedFile = file;
      this.uploadResult = null;
    }
  }

  uploadExcel() {
    if (!this.selectedFile) {
      alert('Please select a file first');
      return;
    }

    this.uploading = true;
    this.uploadResult = null;

    this.questionBankService.uploadExcel(this.selectedFile).subscribe({
      next: (result) => {
        this.uploadResult = result;
        this.uploading = false;
        
        if (result.successCount > 0) {
          // Reload questions after successful upload
          this.loadQuestions();
          // Clear selected file after successful upload
          setTimeout(() => {
            this.selectedFile = null;
            this.uploadResult = null;
          }, 5000);
        }
      },
      error: (error) => {
        this.uploading = false;
        this.uploadResult = {
          totalRows: 0,
          successCount: 0,
          failureCount: 0,
          errors: [error.error?.message || error.message || 'Error uploading file. Please try again.'],
          warnings: []
        };
        console.error('Error uploading file:', error);
      }
    });
  }

  downloadTemplate() {
    this.questionBankService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'QuestionBankTemplate.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading template:', error);
        alert('Error downloading template. Please try again.');
      }
    });
  }
}
