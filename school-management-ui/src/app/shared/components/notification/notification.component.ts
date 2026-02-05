import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(120%)', opacity: 0 }),
        animate('0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications" 
        class="notification notification-{{ notification.type }}"
        [@slideIn]>
        <div class="notification-content">
          <div class="notification-icon">
            <i [class]="getIcon(notification.type)"></i>
          </div>
          <div class="notification-text">
            <p class="notification-message">{{ notification.message }}</p>
          </div>
        </div>
        <button class="notification-close" (click)="remove(notification.id)" aria-label="Close">
          <i class="fa fa-times"></i>
        </button>
        <div class="notification-progress" *ngIf="notification.duration && notification.duration > 0">
          <div class="progress-bar" [style.animation-duration]="notification.duration + 'ms'"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 90px;
      right: 20px;
      z-index: var(--z-tooltip);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      width: 100%;
    }
    
    .notification {
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      min-width: 320px;
      max-width: 100%;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(120%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .notification-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      flex: 1;
    }
    
    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    
    .notification-text {
      flex: 1;
    }
    
    .notification-message {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 1.5;
    }
    
    .notification-success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
      color: var(--text-inverse);
    }
    
    .notification-success .notification-icon {
      background: rgba(255, 255, 255, 0.2);
      color: var(--text-inverse);
    }
    
    .notification-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
      color: var(--text-inverse);
    }
    
    .notification-error .notification-icon {
      background: rgba(255, 255, 255, 0.2);
      color: var(--text-inverse);
    }
    
    .notification-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%);
      color: var(--text-inverse);
    }
    
    .notification-warning .notification-icon {
      background: rgba(255, 255, 255, 0.2);
      color: var(--text-inverse);
    }
    
    .notification-info {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%);
      color: var(--text-inverse);
    }
    
    .notification-info .notification-icon {
      background: rgba(255, 255, 255, 0.2);
      color: var(--text-inverse);
    }
    
    .notification-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      margin-left: 0.75rem;
      border-radius: var(--radius-md);
      color: var(--text-inverse);
      transition: all var(--transition-fast);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .notification-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }
    
    .notification-close i {
      font-size: 0.875rem;
    }
    
    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      animation: progress linear forwards;
      transform-origin: left;
    }
    
    @keyframes progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }
    
    @media (max-width: 768px) {
      .notification-container {
        right: 10px;
        left: 10px;
        max-width: none;
      }
      
      .notification {
        min-width: auto;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.getNotifications().subscribe(notification => {
      this.notifications.push(notification);
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          this.remove(notification.id);
        }, notification.duration);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  remove(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: 'fa fa-check-circle',
      error: 'fa fa-exclamation-circle',
      warning: 'fa fa-exclamation-triangle',
      info: 'fa fa-info-circle'
    };
    return icons[type] || 'fa fa-info-circle';
  }
}
