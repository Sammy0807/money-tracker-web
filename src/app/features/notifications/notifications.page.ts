import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { NotificationsApi } from '../../core/api/notifications.api';

@Component({
  standalone: true,
  selector: 'app-notifications',
  imports: [NgFor, NgIf, DatePipe],
  template: `
    <h2>Notifications</h2>
    <div class="actions">
      <button (click)="refresh()">Refresh</button>
      <button (click)="markAllAsRead()" [disabled]="!hasUnread()">Mark All Read</button>
    </div>

    <div *ngIf="notifications; else loading">
      <div *ngIf="notifications.length === 0" class="empty-state">
        No notifications
      </div>

      <div *ngFor="let notification of notifications"
           class="notification-card"
           [class.unread]="!notification.read"
           [class]="'type-' + notification.type.toLowerCase()">
        <div class="notification-header">
          <h4>{{notification.title}}</h4>
          <div class="notification-meta">
            <span class="type-badge">{{notification.type}}</span>
            <span class="date">{{notification.createdAt | date:'short'}}</span>
          </div>
        </div>
        <p>{{notification.message}}</p>
        <div class="notification-actions">
          <button *ngIf="!notification.read" (click)="markAsRead(notification.id)">Mark Read</button>
          <button (click)="deleteNotification(notification.id)" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>

    <ng-template #loading>Loading…</ng-template>
  `,
  styles: [`
    .actions { margin: 1rem 0; }
    .actions button { margin-right: 1rem; }
    .notification-card {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
      margin: 0.5rem 0;
    }
    .notification-card.unread {
      border-left: 4px solid #007bff;
      background-color: #f8f9fa;
    }
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .notification-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .type-badge {
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.8em;
      font-weight: bold;
    }
    .type-info .type-badge { background-color: #d1ecf1; color: #0c5460; }
    .type-warning .type-badge { background-color: #fff3cd; color: #856404; }
    .type-error .type-badge { background-color: #f8d7da; color: #721c24; }
    .type-success .type-badge { background-color: #d4edda; color: #155724; }
    .notification-actions button { margin-right: 0.5rem; padding: 4px 8px; }
    .delete-btn { background-color: #dc3545; color: white; border: none; }
    .empty-state { text-align: center; color: #666; margin: 2rem 0; }
  `]
})
export default class NotificationsPage implements OnInit, OnDestroy {
  api = inject(NotificationsApi);
  notifications: any = null;
  sub?: any;

  ngOnInit(){ this.refresh(); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }

  refresh(){
    this.sub?.unsubscribe();
    this.sub = this.api.getAll().subscribe(data => this.notifications = data);
  }

  markAsRead(id: string) {
    this.api.markAsRead(id).subscribe(() => this.refresh());
  }

  markAllAsRead() {
    this.api.markAllAsRead().subscribe(() => this.refresh());
  }

  deleteNotification(id: string) {
    this.api.delete(id).subscribe(() => this.refresh());
  }

  hasUnread(): boolean {
    return this.notifications?.some((n: any) => !n.read) || false;
  }
}
