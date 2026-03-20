import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inline-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="inline-spinner" [style.width.px]="size" [style.height.px]="size" [style.borderWidth.px]="thickness"></span>`,
  styles: [`
    .inline-spinner {
      display: inline-block;
      border-style: solid;
      border-color: currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      vertical-align: middle;
      flex-shrink: 0;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class InlineSpinnerComponent {
  @Input() size = 14;
  @Input() thickness = 2;
}

