import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { QuestionBank } from '../../../../core/models/question-bank.model';

@Component({
  selector: 'app-exam-question-paper',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="question-paper-container" id="questionPaper">
      <!-- Header -->
      <div class="paper-header">
        <div class="school-info">
          <h1>{{ schoolName }}</h1>
          <h2>{{ examName }}</h2>
          <div class="exam-details">
            <p><strong>Class:</strong> {{ className }}</p>
            <p><strong>Subject:</strong> {{ subjectName }}</p>
            <p *ngIf="selectedChapters && selectedChapters.length > 0">
              <strong>Chapters:</strong> {{ selectedChapters.join(', ') }}
            </p>
            <p *ngIf="examDate"><strong>Date:</strong> {{ examDate | date:'mediumDate' }}</p>
          </div>
        </div>
        <div class="student-info">
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-line">_________________________________</span>
          </div>
          <div class="info-row">
            <span class="info-label">Roll Number:</span>
            <span class="info-line">_________________________________</span>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Read all questions carefully before answering</li>
          <li>Total Marks: {{ totalMarks }}</li>
          <li>Time Allowed: {{ timeAllowed || 'As per schedule' }}</li>
          <li>Answer all questions</li>
        </ul>
      </div>

      <!-- Questions -->
      <div class="questions-section">
        <div *ngFor="let question of questions; let i = index" class="question-item">
          <div class="question-header">
            <span class="question-number">Q{{ i + 1 }}.</span>
            <span class="question-marks">[{{ question.marks }} Marks]</span>
            <span class="question-difficulty">{{ question.difficultyLevel }}</span>
          </div>
          
          <div class="question-text">
            {{ question.questionText }}
          </div>

          <!-- Multiple Choice Options -->
          <div *ngIf="question.questionType === 'MultipleChoice'" class="options">
            <div class="option" *ngIf="question.optionA">
              <strong>A)</strong> {{ question.optionA }}
            </div>
            <div class="option" *ngIf="question.optionB">
              <strong>B)</strong> {{ question.optionB }}
            </div>
            <div class="option" *ngIf="question.optionC">
              <strong>C)</strong> {{ question.optionC }}
            </div>
            <div class="option" *ngIf="question.optionD">
              <strong>D)</strong> {{ question.optionD }}
            </div>
          </div>

          <!-- True/False Options (one line) -->
          <div *ngIf="question.questionType === 'TrueFalse'" class="options options-truefalse">
            <span class="option-inline"><strong>A)</strong> True</span>
            <span class="option-inline"><strong>B)</strong> False</span>
          </div>

          <!-- Answer Space for Short Answer (4 rows) -->
          <div *ngIf="question.questionType === 'ShortAnswer'" class="answer-space answer-short">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>

          <!-- Answer Space for Essay/Subjective (10 rows) -->
          <div *ngIf="question.questionType === 'Essay'" class="answer-space answer-essay">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="paper-footer">
        <p>--- End of Question Paper ---</p>
      </div>
    </div>

    <!-- Print Button -->
    <div class="print-actions">
      <button class="btn btn-primary" (click)="printPaper()">
        <i class="fa fa-print"></i> Print Question Paper
      </button>
      <button class="btn btn-secondary" (click)="close()">
        <i class="fa fa-times"></i> Close
      </button>
    </div>
  `,
  styles: [`
    .question-paper-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      font-family: 'Libre Baskerville', Georgia, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
    }

    .paper-header {
      text-align: center;
      border-bottom: 3px solid #000;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }

    .school-info h1 {
      margin: 0;
      font-size: 24pt;
      font-weight: bold;
      text-transform: uppercase;
    }

    .school-info h2 {
      margin: 0.5rem 0;
      font-size: 18pt;
      font-weight: bold;
    }

    .exam-details {
      margin-top: 1rem;
      text-align: left;
      display: inline-block;
    }

    .exam-details p {
      margin: 0.25rem 0;
      font-size: 11pt;
    }

    .student-info {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      gap: 2rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .info-label {
      font-weight: bold;
      font-size: 11pt;
      white-space: nowrap;
    }

    .info-line {
      flex: 1;
      border-bottom: 1px solid #000;
      height: 1.2em;
      min-width: 150px;
    }

    .instructions {
      background: #f5f5f5;
      padding: 1rem;
      border-left: 4px solid #333;
      margin-bottom: 2rem;
    }

    .instructions h3 {
      margin-top: 0;
      font-size: 14pt;
    }

    .instructions ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .instructions li {
      margin: 0.25rem 0;
      font-size: 11pt;
    }

    .questions-section {
      margin-top: 2rem;
    }

    .question-item {
      margin-bottom: 2rem;
      page-break-inside: avoid;
    }

    .question-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    .question-number {
      font-size: 12pt;
    }

    .question-marks {
      font-size: 10pt;
      color: #666;
    }

    .question-difficulty {
      font-size: 9pt;
      padding: 0.25rem 0.5rem;
      background: #e0e0e0;
      border-radius: 4px;
      margin-left: auto;
    }

    .question-text {
      font-size: 11pt;
      margin-bottom: 1rem;
      line-height: 1.8;
    }

    .options {
      margin-left: 2rem;
      margin-bottom: 1rem;
    }

    .options-multiple {
      display: flex;
      flex-direction: column;
    }

    .options-truefalse {
      display: flex;
      flex-direction: row;
      gap: 3rem;
      margin-left: 2rem;
      margin-bottom: 1rem;
    }

    .option {
      margin: 0.5rem 0;
      font-size: 11pt;
      line-height: 1.6;
    }

    .option-inline {
      font-size: 11pt;
      line-height: 1.6;
    }

    .answer-space {
      margin-top: 1rem;
      margin-left: 2rem;
    }

    .answer-short {
      min-height: 6rem;
    }

    .answer-essay {
      min-height: 15rem;
    }

    .answer-line {
      border-bottom: 1px solid #ccc;
      margin-bottom: 0.75rem;
      height: 1.5rem;
    }

    .paper-footer {
      text-align: center;
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 2px solid #000;
      font-weight: bold;
    }

    .print-actions {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      gap: 1rem;
      z-index: 1000;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0,0,0,0.15);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    @media print {
      /* Hide print actions */
      .print-actions {
        display: none !important;
      }

      /* Ensure question paper container is visible and properly formatted */
      .question-paper-container {
        box-shadow: none !important;
        padding: 15mm !important;
        margin: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
        height: auto !important;
        min-height: auto !important;
        overflow: visible !important;
        page-break-after: auto !important;
      }

      /* Allow questions to flow across pages */
      .questions-section {
        page-break-inside: auto !important;
        overflow: visible !important;
        height: auto !important;
      }

      /* Prevent page breaks inside individual questions when possible */
      .question-item {
        page-break-inside: avoid;
        page-break-after: auto;
        margin-bottom: 1.5rem;
      }

      /* Allow page breaks between questions if needed */
      .question-item + .question-item {
        page-break-before: auto;
      }

      /* Ensure header doesn't break */
      .paper-header {
        page-break-after: avoid;
      }

      /* Ensure footer appears on last page */
      .paper-footer {
        page-break-before: auto;
      }

      /* Hide any wrapper elements */
      .question-paper-wrapper {
        margin: 0 !important;
        padding: 0 !important;
        height: auto !important;
        overflow: visible !important;
      }
    }
  `]
})
export class ExamQuestionPaperComponent implements OnInit {
  @Input() questions: QuestionBank[] = [];
  @Input() examName: string = '';
  @Input() className: string = '';
  @Input() subjectName: string = '';
  @Input() selectedChapters?: string[];
  @Input() examDate?: Date;
  @Input() schoolName: string = 'School Management System';
  @Input() timeAllowed?: string;
  @Output() closeEvent = new EventEmitter<void>();

  totalMarks: number = 0;

  ngOnInit() {
    this.calculateTotalMarks();
  }

  calculateTotalMarks() {
    this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  }

  printPaper() {
    window.print();
  }

  close() {
    this.closeEvent.emit();
  }
}
