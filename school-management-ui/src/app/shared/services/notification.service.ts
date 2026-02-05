import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new Subject<Notification>();
  private notificationId = 0;

  getNotifications() {
    return this.notifications$.asObservable();
  }

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) {
    const notification: Notification = {
      id: this.notificationId++,
      type,
      message,
      duration
    };
    this.notifications$.next(notification);
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration || 7000);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }
}

