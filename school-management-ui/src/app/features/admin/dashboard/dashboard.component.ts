import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ClassService } from '../../../core/services/class.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ExamService } from '../../../core/services/exam.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { SubjectService } from '../../../core/services/subject.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent],
  template: `
    <div class="dashboard">
      <app-loading [show]="loading" [message]="'Loading dashboard...'"></app-loading>
      
      <div class="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p class="welcome-text">Welcome back! Here's what's happening at your school today.</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card" routerLink="/admin/students">
          <div class="stat-icon students">
            <i class="fa fa-users"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalStudents }}</h3>
            <p>Total Students</p>
            <span class="stat-change" *ngIf="totalStudents > 0">
              <i class="fa fa-arrow-up"></i> Active
            </span>
          </div>
        </div>
        
        <div class="stat-card" routerLink="/admin/teachers">
          <div class="stat-icon teachers">
            <i class="fa fa-user-md"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalTeachers }}</h3>
            <p>Total Teachers</p>
            <span class="stat-change" *ngIf="totalTeachers > 0">
              <i class="fa fa-arrow-up"></i> Active
            </span>
          </div>
        </div>
        
        <div class="stat-card" routerLink="/admin/classes">
          <div class="stat-icon classes">
            <i class="fa fa-book"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalClasses }}</h3>
            <p>Total Classes</p>
            <span class="stat-change" *ngIf="totalSubjects > 0">
              {{ totalSubjects }} Subjects
            </span>
          </div>
        </div>
        
        <div class="stat-card" routerLink="/admin/exams">
          <div class="stat-icon exams">
            <i class="fa fa-file-text"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalExams }}</h3>
            <p>Total Exams</p>
            <span class="stat-change" *ngIf="totalExams > 0">
              <i class="fa fa-calendar"></i> Scheduled
            </span>
          </div>
        </div>
        
        <div class="stat-card" routerLink="/admin/assignments">
          <div class="stat-icon assignments">
            <i class="fa fa-tasks"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalAssignments }}</h3>
            <p>Total Assignments</p>
            <span class="stat-change" *ngIf="totalAssignments > 0">
              <i class="fa fa-check"></i> Active
            </span>
          </div>
        </div>
        
        <div class="stat-card" routerLink="/admin/invoices">
          <div class="stat-icon invoices">
            <i class="fa fa-money"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalInvoices }}</h3>
            <p>Total Invoices</p>
            <span class="stat-change pending" *ngIf="pendingInvoices > 0">
              <i class="fa fa-exclamation-circle"></i> {{ pendingInvoices }} Pending
            </span>
            <span class="stat-change" *ngIf="pendingInvoices === 0 && totalInvoices > 0">
              <i class="fa fa-check-circle"></i> All Paid
            </span>
          </div>
        </div>
        
        <div class="stat-card" routerLink="/admin/attendance">
          <div class="stat-icon attendance">
            <i class="fa fa-check-square"></i>
          </div>
          <div class="stat-info">
            <h3>{{ todayAttendance }}</h3>
            <p>Today's Attendance</p>
            <span class="stat-change" *ngIf="todayAttendance > 0">
              <i class="fa fa-calendar-check"></i> Marked
            </span>
          </div>
        </div>
        
        <div class="stat-card financial">
          <div class="stat-icon revenue">
            <i class="fa fa-dollar-sign"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalRevenue | currency }}</h3>
            <p>Total Revenue</p>
            <span class="stat-change" *ngIf="totalRevenue > 0">
              <i class="fa fa-chart-line"></i> Collected
            </span>
          </div>
        </div>
      </div>

      <div class="dashboard-sections">
        <div class="section-card quick-actions">
          <h3><i class="fa fa-bolt"></i> Quick Actions</h3>
          <div class="actions-grid">
            <a routerLink="/admin/students" class="action-card">
              <i class="fa fa-user-plus"></i>
              <span>Add Student</span>
            </a>
            <a routerLink="/admin/teachers" class="action-card">
              <i class="fa fa-user-plus"></i>
              <span>Add Teacher</span>
            </a>
            <a routerLink="/admin/classes" class="action-card">
              <i class="fa fa-plus-circle"></i>
              <span>Add Class</span>
            </a>
            <a routerLink="/admin/attendance" class="action-card">
              <i class="fa fa-check-square"></i>
              <span>Mark Attendance</span>
            </a>
            <a routerLink="/admin/exams" class="action-card">
              <i class="fa fa-file-text"></i>
              <span>Create Exam</span>
            </a>
            <a routerLink="/admin/invoices" class="action-card">
              <i class="fa fa-money"></i>
              <span>Create Invoice</span>
            </a>
          </div>
        </div>

        <div class="section-card recent-activity">
          <h3><i class="fa fa-clock-o"></i> Recent Activity</h3>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <div class="activity-icon" [class]="'icon-' + activity.type">
                <i [class]="activity.icon"></i>
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.text }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
            <div *ngIf="recentActivities.length === 0" class="no-activity">
              <i class="fa fa-inbox"></i>
              <p>No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      position: relative;
      min-height: 100vh;
    }
    .dashboard-header {
      margin-bottom: 2rem;
    }
    .dashboard-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    .welcome-text {
      color: #666;
      margin: 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
      cursor: pointer;
      border-left: 4px solid transparent;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .stat-card.students { border-left-color: #3498db; }
    .stat-card.teachers { border-left-color: #9b59b6; }
    .stat-card.classes { border-left-color: #2ecc71; }
    .stat-card.exams { border-left-color: #f39c12; }
    .stat-card.assignments { border-left-color: #e74c3c; }
    .stat-card.invoices { border-left-color: #16a085; }
    .stat-card.attendance { border-left-color: #27ae60; }
    .stat-card.financial { border-left-color: #2980b9; }
    .stat-icon {
      width: 70px;
      height: 70px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1.5rem;
      font-size: 2rem;
      color: white;
    }
    .stat-icon.students { background: linear-gradient(135deg, #3498db, #2980b9); }
    .stat-icon.teachers { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
    .stat-icon.classes { background: linear-gradient(135deg, #2ecc71, #27ae60); }
    .stat-icon.exams { background: linear-gradient(135deg, #f39c12, #e67e22); }
    .stat-icon.assignments { background: linear-gradient(135deg, #e74c3c, #c0392b); }
    .stat-icon.invoices { background: linear-gradient(135deg, #16a085, #138d75); }
    .stat-icon.attendance { background: linear-gradient(135deg, #27ae60, #229954); }
    .stat-icon.revenue { background: linear-gradient(135deg, #2980b9, #1f618d); }
    .stat-info {
      flex: 1;
    }
    .stat-info h3 {
      margin: 0;
      font-size: 2.5rem;
      color: #333;
      font-weight: 700;
    }
    .stat-info p {
      margin: 0.5rem 0;
      color: #666;
      font-size: 0.95rem;
    }
    .stat-change {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #27ae60;
      font-weight: 500;
    }
    .stat-change.pending {
      color: #e67e22;
    }
    .dashboard-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .section-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .section-card h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }
    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      text-decoration: none;
      color: #333;
      transition: all 0.3s;
      border: 2px solid transparent;
    }
    .action-card:hover {
      background: #667eea;
      color: white;
      transform: translateY(-3px);
      border-color: #667eea;
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }
    .action-card i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .activity-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      transition: background 0.2s;
    }
    .activity-item:hover {
      background: #f8f9fa;
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      color: white;
    }
    .activity-icon.icon-student { background: #3498db; }
    .activity-icon.icon-teacher { background: #9b59b6; }
    .activity-icon.icon-exam { background: #f39c12; }
    .activity-icon.icon-payment { background: #27ae60; }
    .activity-content {
      flex: 1;
    }
    .activity-text {
      margin: 0;
      color: #333;
      font-weight: 500;
    }
    .activity-time {
      font-size: 0.85rem;
      color: #999;
    }
    .no-activity {
      text-align: center;
      padding: 3rem;
      color: #999;
    }
    .no-activity i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }
    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .dashboard-sections {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalStudents: number = 0;
  totalTeachers: number = 0;
  totalClasses: number = 0;
  totalSubjects: number = 0;
  totalExams: number = 0;
  totalAssignments: number = 0;
  totalInvoices: number = 0;
  pendingInvoices: number = 0;
  todayAttendance: number = 0;
  totalRevenue: number = 0;
  loading: boolean = false;
  recentActivities: any[] = [];

  constructor(
    private studentService: StudentService,
    private teacherService: TeacherService,
    private classService: ClassService,
    private assignmentService: AssignmentService,
    private examService: ExamService,
    private invoiceService: InvoiceService,
    private attendanceService: AttendanceService,
    private subjectService: SubjectService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    const today = new Date().toISOString().split('T')[0];

    // Load all statistics in parallel
    Promise.all([
      this.loadStudents(),
      this.loadTeachers(),
      this.loadClasses(),
      this.loadSubjects(),
      this.loadExams(),
      this.loadAssignments(),
      this.loadInvoices(),
      this.loadTodayAttendance(today)
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadStudents() {
    return new Promise<void>((resolve) => {
      this.studentService.getAllStudents().subscribe({
        next: (students) => {
          this.totalStudents = students.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading students:', error);
          resolve();
        }
      });
    });
  }

  loadTeachers() {
    return new Promise<void>((resolve) => {
      this.teacherService.getAllTeachers().subscribe({
        next: (teachers) => {
          this.totalTeachers = teachers.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading teachers:', error);
          resolve();
        }
      });
    });
  }

  loadClasses() {
    return new Promise<void>((resolve) => {
      this.classService.getAllClasses().subscribe({
        next: (classes) => {
          this.totalClasses = classes.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading classes:', error);
          resolve();
        }
      });
    });
  }

  loadSubjects() {
    return new Promise<void>((resolve) => {
      this.subjectService.getAllSubjects().subscribe({
        next: (subjects) => {
          this.totalSubjects = subjects.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
          resolve();
        }
      });
    });
  }

  loadExams() {
    return new Promise<void>((resolve) => {
      this.examService.getAllExams().subscribe({
        next: (exams) => {
          this.totalExams = exams.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading exams:', error);
          resolve();
        }
      });
    });
  }

  loadAssignments() {
    return new Promise<void>((resolve) => {
      this.assignmentService.getAllAssignments().subscribe({
        next: (assignments) => {
          this.totalAssignments = assignments.length;
          resolve();
        },
        error: (error) => {
          console.error('Error loading assignments:', error);
          resolve();
        }
      });
    });
  }

  loadInvoices() {
    return new Promise<void>((resolve) => {
      this.invoiceService.getAllInvoices().subscribe({
        next: (invoices) => {
          this.totalInvoices = invoices.length;
          this.pendingInvoices = invoices.filter(inv => inv.status === 'unpaid').length;
          this.totalRevenue = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
          resolve();
        },
        error: (error) => {
          console.error('Error loading invoices:', error);
          resolve();
        }
      });
    });
  }

  loadTodayAttendance(date: string) {
    return new Promise<void>((resolve) => {
      this.attendanceService.getAttendance(date).subscribe({
        next: (attendance) => {
          this.todayAttendance = attendance.filter(a => a.status === 1).length;
          resolve();
        },
        error: (error) => {
          // It's okay if there's no attendance for today
          console.log('No attendance data for today');
          resolve();
        }
      });
    });
  }
}
