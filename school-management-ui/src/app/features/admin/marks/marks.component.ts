import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkService } from '../../../core/services/mark.service';
import { ExamService } from '../../../core/services/exam.service';
import { StudentService } from '../../../core/services/student.service';
import { ClassService } from '../../../core/services/class.service';
import { SubjectService } from '../../../core/services/subject.service';
import { PdfService } from '../../../core/services/pdf.service';
import { Mark } from '../../../core/models/mark.model';

@Component({
  selector: 'app-marks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="marks-container">
      <h2>Marks Management</h2>
      
      <div class="filter-card">
        <h3>Select Exam, Class, and Student</h3>
        <form (ngSubmit)="loadMarks()">
          <div class="form-row">
            <div class="form-group">
              <label>Exam *</label>
              <select [(ngModel)]="selectedExamId" name="examId" required class="form-control">
                <option value="">Select Exam</option>
                <option *ngFor="let exam of exams" [value]="exam.examId">{{ exam.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Class *</label>
              <select [(ngModel)]="selectedClassId" name="classId" required (change)="loadStudents()" class="form-control">
                <option value="">Select Class</option>
                <option *ngFor="let cls of classes" [value]="cls.classId">{{ cls.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Student *</label>
              <select [(ngModel)]="selectedStudentId" name="studentId" required class="form-control">
                <option value="">Select Student</option>
                <option *ngFor="let student of students" [value]="student.studentId || student.userId">{{ student.name }}</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Load Marks</button>
          <button type="button" class="btn btn-secondary" (click)="downloadResultCard()">
            <i class="fa fa-file-pdf-o"></i> Download Result Card
          </button>
        </form>
      </div>

      <div *ngIf="marks.length > 0" class="marks-card">
        <h3>Enter Marks</h3>
        <form (ngSubmit)="saveMarks()">
          <table class="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Class Score 1</th>
                <th>Class Score 2</th>
                <th>Class Score 3</th>
                <th>Exam Score</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let mark of marks">
                <td>{{ mark.subject?.name || '-' }}</td>
                <td>
                  <input type="number" [(ngModel)]="mark.classScore1" name="score1_{{mark.markId}}" class="form-control" step="0.01">
                </td>
                <td>
                  <input type="number" [(ngModel)]="mark.classScore2" name="score2_{{mark.markId}}" class="form-control" step="0.01">
                </td>
                <td>
                  <input type="number" [(ngModel)]="mark.classScore3" name="score3_{{mark.markId}}" class="form-control" step="0.01">
                </td>
                <td>
                  <input type="number" [(ngModel)]="mark.examScore" name="exam_{{mark.markId}}" class="form-control" step="0.01">
                </td>
                <td>
                  <input type="text" [(ngModel)]="mark.comment" name="comment_{{mark.markId}}" class="form-control">
                </td>
              </tr>
            </tbody>
          </table>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Marks</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .marks-container {
      padding: 2rem;
    }
    .filter-card, .marks-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
    }
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #667eea;
      color: white;
    }
    .btn-secondary {
      background: #e74c3c;
      color: white;
      margin-left: 0.75rem;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
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
    .data-table input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-actions {
      margin-top: 1.5rem;
    }
  `]
})
export class MarksComponent implements OnInit {
  marks: Mark[] = [];
  exams: any[] = [];
  classes: any[] = [];
  students: any[] = [];
  subjects: any[] = [];
  selectedExamId: number | null = null;
  selectedClassId: number | null = null;
  selectedStudentId: number | null = null;

  constructor(
    private markService: MarkService,
    private examService: ExamService,
    private studentService: StudentService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private pdfService: PdfService
  ) {}

  ngOnInit() {
    this.loadExams();
    this.loadClasses();
  }

  loadExams() {
    this.examService.getAllExams().subscribe(exams => {
      this.exams = exams;
    });
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  loadStudents() {
    if (this.selectedClassId) {
      this.studentService.getStudentsByClass(this.selectedClassId).subscribe(students => {
        this.students = students;
      });
      this.subjectService.getSubjectsByClass(this.selectedClassId).subscribe(subjects => {
        this.subjects = subjects;
      });
    }
  }

  downloadResultCard() {
    if (!this.selectedExamId || this.selectedExamId <= 0 || !this.selectedStudentId || this.selectedStudentId <= 0) {
      alert('Please select valid exam and student before downloading the result card.');
      return;
    }

    this.pdfService.getResultCard(this.selectedStudentId, this.selectedExamId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `result-card-${this.selectedStudentId}-${this.selectedExamId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading result card:', error);
        alert('Error downloading result card. Please try again.');
      }
    });
  }

  loadMarks() {
    if (this.selectedExamId && this.selectedStudentId) {
      this.markService.getMarksByExamAndStudent(this.selectedExamId, this.selectedStudentId)
        .subscribe(marks => {
          this.marks = marks;
        });
    }
  }

  saveMarks() {
    this.markService.bulkUpdateMarks(this.marks).subscribe(() => {
      alert('Marks saved successfully!');
    });
  }
}

