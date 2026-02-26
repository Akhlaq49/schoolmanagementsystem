import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-defaulter-families',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="family-page-container">
      <div class="page-header">
        <div class="header-content">
          <h2>
            <i class="fa fa-exclamation-triangle"></i>
            Family - Defaulter Families
          </h2>
        </div>
      </div>

      <div class="modern-table-card">
        <div class="modern-table-header">
          <div class="modern-table-title">
            <i class="fa fa-table"></i>
            Defaulter Families
          </div>
        </div>
        <div class="modern-table-empty">
          <i class="fa fa-inbox"></i>
          <p>Defaulter families view is not implemented yet.</p>
          <span class="text-muted">We will implement filters, summary and export options in the next steps.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .family-page-container {
      padding: 2rem;
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
  `]
})
export class DefaulterFamiliesComponent {}

