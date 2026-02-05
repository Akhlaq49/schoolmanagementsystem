import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NotificationComponent],
  template: `
    <router-outlet></router-outlet>
    <app-notification></app-notification>
  `,
  styles: []
})
export class AppComponent {
  title = 'School Management System';
}

