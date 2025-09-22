import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from './api.config';
import { UUID } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

export interface Notification {
  id: UUID;
  title?: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'BUDGET_THRESHOLD' | 'IMPORT_COMPLETE' | 'RULES_SUGGESTION';
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private http = inject(HttpClient);
  private mockService = inject(MockDataService);

  // CRUD operations
  getAll() {
    if (environment.useMock) {
      return this.mockService.getMockData<Notification[]>('notifications');
    }
    return this.http.get<Notification[]>(`${API.notifications}`);
  }

  getById(id: UUID) { return this.http.get<Notification>(`${API.notifications}/${id}`); }
  create(notification: Omit<Notification, 'id' | 'createdAt'>) {
    return this.http.post<Notification>(`${API.notifications}`, notification);
  }
  delete(id: UUID) { return this.http.delete<void>(`${API.notifications}/${id}`); }

  // Special endpoints
  markAsRead(id: UUID) { return this.http.patch<Notification>(`${API.notifications}/${id}/read`, {}); }
  markAllAsRead() { return this.http.patch<void>(`${API.notifications}/read-all`, {}); }
  getUnreadCount() { return this.http.get<{ count: number }>(`${API.notifications}/unread-count`); }
}
