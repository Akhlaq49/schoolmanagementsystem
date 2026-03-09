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
    trigger('notifAnim', [
      transition(':enter', [
        style({ transform: 'translateX(100%) scale(0.95)', opacity: 0 }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'translateX(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ transform: 'translateX(100%) scale(0.95)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="notif-container">
      <div
        *ngFor="let n of notifications; trackBy: trackById"
        class="notif notif-{{ n.type }}"
        [@notifAnim]>

        <div class="notif-accent"></div>

        <div class="notif-body">
          <div class="notif-icon-wrap">
            <i [class]="getIcon(n.type)"></i>
          </div>
          <div class="notif-content">
            <span class="notif-title">{{ getTitle(n.type) }}</span>
            <p class="notif-message">{{ n.message }}</p>
          </div>
        </div>

        <button class="notif-close" (click)="remove(n.id)" aria-label="Close">
          <i class="fa fa-times"></i>
        </button>

        <div class="notif-timer" *ngIf="n.duration && n.duration > 0">
          <div class="timer-bar" [style.animation-duration]="n.duration + 'ms'"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      width: 100%;
      pointer-events: none;
    }

    .notif {
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1rem 1.25rem 1rem 0;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 8px 30px rgba(15, 39, 68, 0.12), 0 2px 8px rgba(15, 39, 68, 0.08);
      overflow: hidden;
      pointer-events: auto;
      border: 1px solid #e2e8f0;
    }

    .notif-accent {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      border-radius: 12px 0 0 12px;
    }

    .notif-body {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      flex: 1;
      padding-left: 1.25rem;
    }

    .notif-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .notif-content { flex: 1; }

    .notif-title {
      display: block;
      font-size: 0.8125rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      margin-bottom: 0.2rem;
    }

    .notif-message {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.45;
      color: #435d7a;
    }

    /* ─── Success ─────────────────────────────── */
    .notif-success .notif-accent { background: #059669; }
    .notif-success .notif-icon-wrap { background: #d1fae5; color: #059669; }
    .notif-success .notif-title { color: #065f46; }

    /* ─── Error ──────────────────────────────── */
    .notif-error .notif-accent { background: #dc2626; }
    .notif-error .notif-icon-wrap { background: #fee2e2; color: #dc2626; }
    .notif-error .notif-title { color: #991b1b; }

    /* ─── Warning ────────────────────────────── */
    .notif-warning .notif-accent { background: #d97706; }
    .notif-warning .notif-icon-wrap { background: #fef3c7; color: #d97706; }
    .notif-warning .notif-title { color: #92400e; }

    /* ─── Info ───────────────────────────────── */
    .notif-info .notif-accent { background: #1e3a5f; }
    .notif-info .notif-icon-wrap { background: rgba(30, 58, 95, 0.1); color: #1e3a5f; }
    .notif-info .notif-title { color: #0f2744; }

    /* ─── Close Button ───────────────────────── */
    .notif-close {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.35rem;
      margin-left: 0.5rem;
      margin-top: 0.15rem;
      border-radius: 8px;
      color: #8aa8c4;
      transition: all 0.2s;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notif-close:hover { background: #f1f5f9; color: #435d7a; transform: rotate(90deg); }
    .notif-close i { font-size: 0.8rem; }

    /* ─── Timer Bar ──────────────────────────── */
    .notif-timer {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: #eef2f7;
      overflow: hidden;
    }
    .timer-bar {
      height: 100%;
      border-radius: 0 3px 3px 0;
      animation: timerShrink linear forwards;
      transform-origin: left;
    }
    .notif-success .timer-bar { background: #059669; }
    .notif-error .timer-bar { background: #dc2626; }
    .notif-warning .timer-bar { background: #d97706; }
    .notif-info .timer-bar { background: #1e3a5f; }

    @keyframes timerShrink {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }

    /* ─── Responsive ─────────────────────────── */
    @media (max-width: 768px) {
      .notif-container { right: 12px; left: 12px; max-width: none; top: 12px; }
      .notif { min-width: auto; }
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
        setTimeout(() => this.remove(notification.id), notification.duration);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  remove(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  trackById(_: number, n: Notification): number {
    return n.id;
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'fa fa-check-circle',
      error: 'fa fa-exclamation-circle',
      warning: 'fa fa-exclamation-triangle',
      info: 'fa fa-info-circle'
    };
    return icons[type] || 'fa fa-info-circle';
  }

  getTitle(type: string): string {
    const titles: Record<string, string> = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };
    return titles[type] || 'Notice';
  }
}
