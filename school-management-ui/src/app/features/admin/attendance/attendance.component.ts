import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { StudentService } from '../../../core/services/student.service';
import { ClassService } from '../../../core/services/class.service';
import { SectionService } from '../../../core/services/section.service';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  template: `
    <div class="attendance-container">
      <h2>Attendance Management</h2>
      
      <div class="filter-card">
        <h3>Select Date and Class</h3>
        <form (ngSubmit)="loadAttendance()">
          <div class="form-row">
            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="selectedDate" name="date" required class="form-control">
            </div>
            <div class="form-group">
              <label>Class</label>
              <app-dropdown
                [(ngModel)]="selectedClassId"
                [options]="classOptions"
                placeholder="Select Class"
                [searchable]="true"
                (changed)="loadSections()">
              </app-dropdown>
            </div>
            <div class="form-group">
              <label>Section</label>
              <app-dropdown
                [(ngModel)]="selectedSectionId"
                [options]="sectionOptions"
                placeholder="Select Section"
                [searchable]="false">
              </app-dropdown>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Load Attendance</button>
        </form>
      </div>

      <div *ngIf="students.length > 0" class="attendance-card">
        <h3>Mark Attendance for {{ selectedDate | date:'fullDate' }}</h3>
        <form (ngSubmit)="saveAttendance()">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Roll</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of students">
                <td>{{ student.studentId }}</td>
                <td>{{ student.name }}</td>
                <td>{{ student.roll || '-' }}</td>
                <td>
                  <app-dropdown
                    [(ngModel)]="attendanceStatus[student.studentId]"
                    [options]="statusOptions"
                    placeholder="Select Status"
                    [searchable]="false"
                    [showPlaceholderOption]="false"
                    size="sm">
                  </app-dropdown>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Attendance</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .attendance-container {
      padding: 2rem;
    }
    .filter-card, .attendance-card {
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
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .data-table thead {
      background: #667eea;
      color: white;
    }
  `]
})
export class AttendanceComponent implements OnInit {
  classes: any[] = [];
  sections: any[] = [];
  students: any[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  attendanceStatus: { [key: number]: number } = {};

  statusOptions: DropdownOption[] = [
    { value: 1, label: 'Present' },
    { value: 2, label: 'Absent' },
    { value: 3, label: 'Holiday' },
    { value: 4, label: 'Half Day' },
    { value: 5, label: 'Late' }
  ];

  get classOptions(): DropdownOption[] {
    return this.classes.map(c => ({ value: c.classId, label: c.name }));
  }

  get sectionOptions(): DropdownOption[] {
    return this.sections.map(s => ({ value: s.sectionId, label: s.name }));
  }

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private classService: ClassService,
    private sectionService: SectionService
  ) {}

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.classService.getAllClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  loadSections() {
    if (this.selectedClassId) {
      this.sectionService.getSectionsByClass(this.selectedClassId).subscribe(sections => {
        this.sections = sections;
      });
    }
  }

  loadAttendance() {
    if (this.selectedClassId) {
      this.studentService.getStudentsByClass(this.selectedClassId).subscribe(students => {
        this.students = students;
        students.forEach(student => {
          this.attendanceStatus[student.studentId] = 1; // Default to Present
        });
      });
    }
  }

  saveAttendance() {
    // Implementation for saving attendance
    alert('Attendance saved successfully!');
  }
}

