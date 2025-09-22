import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API } from './api.config';
import { User, UUID } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

export interface UserPreferences {
  currency: string;
  locale: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    lowBalance: boolean;
    budgetAlerts: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class UserApi {
  private http = inject(HttpClient);
  private mockService = inject(MockDataService);

  // Current user operations
  getCurrentUser() {
    if (environment.useMock) {
      return this.mockService.getMockData<User>('user');
    }
    return this.http.get<User>(`${API.user}/me`);
  }

  updateCurrentUser(user: Partial<User>) { return this.http.put<User>(`${API.user}/me`, user); }
  deleteCurrentUser() { return this.http.delete<void>(`${API.user}/me`); }

  // User preferences
  getPreferences() {
    // Mock some preferences if using mock data
    if (environment.useMock) {
      return this.mockService.getMockData<User>('user').pipe(
        map((user: User) => ({
          currency: user?.currency || 'USD',
          locale: user?.locale || 'en-US',
          timezone: user?.timezone || 'America/New_York',
          notifications: {
            email: true,
            push: false,
            lowBalance: true,
            budgetAlerts: true
          }
        }))
      );
    }
    return this.http.get<UserPreferences>(`${API.user}/me/preferences`);
  }

  updatePreferences(preferences: Partial<UserPreferences>) {
    return this.http.put<UserPreferences>(`${API.user}/me/preferences`, preferences);
  }

  // Data export
  exportData() { return this.http.get(`${API.user}/me/export`, { responseType: 'blob' }); }

  // Feature flags
  getFeatureFlags() {
    if (environment.useMock) {
      return this.mockService.getMockData<User>('user').pipe(
        map((user: User) => {
          try {
            return JSON.parse(user?.featureFlagsJson || '{}');
          } catch {
            return {};
          }
        })
      );
    }
    return this.http.get<{ [key: string]: boolean }>(`${API.user}/me/feature-flags`);
  }
}
