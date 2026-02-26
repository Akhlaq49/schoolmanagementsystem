import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-fee-add-on',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="family-page-container">
      <div class="page-header">
        <div class="header-content">
          <h2>
            <i class="fa fa-money"></i>
            Family - Fee Add On
          </h2>
        </div>
      </div>

      <div class="modern-form-card">
        <h3>
          <i class="fa fa-money"></i>
          Fee Add On
        </h3>
        <p class="text-muted">
          Placeholder for configuring additional fee items for families. We will design the full form and behavior next.
        </p>
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
export class FeeAddOnComponent {}

