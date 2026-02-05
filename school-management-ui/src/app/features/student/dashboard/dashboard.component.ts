import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StudentService } from '../../../core/services/student.service';
import { AssignmentService } from '../../../core/services/assignment.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <h2>Student Dashboard</h2>
      <p>Welcome, {{ userName }}!</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <h3>My Assignments</h3>
          <p class="stat-number">{{ totalAssignments }}</p>
        </div>
        <div class="stat-card">
          <h3>My Subjects</h3>
          <p class="stat-number">{{ totalSubjects }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
    }
  `]
})
export class DashboardComponent implements OnInit {
  userName: string | null = null;
  totalAssignments: number = 0;
  totalSubjects: number = 0;

  constructor(
    private authService: AuthService,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
    const userId = this.authService.getUserId();
    if (userId) {
      this.assignmentService.getAssignmentsByStudent(userId).subscribe(assignments => {
        this.totalAssignments = assignments.length;
      });
    }
  }
}





