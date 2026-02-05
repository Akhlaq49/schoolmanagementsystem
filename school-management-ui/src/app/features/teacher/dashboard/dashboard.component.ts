import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <h2>Teacher Dashboard</h2>
      <p>Welcome, {{ userName }}!</p>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  userName: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
  }
}





