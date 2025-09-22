import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from './api.config';
import { Account, UUID } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

@Injectable({ providedIn: 'root' })
export class AccountsApi {
  private http = inject(HttpClient);
  private mockService = inject(MockDataService);
  accounts = signal<Account[] | null>(null);
  loading = signal(false);

  list() {
    this.loading.set(true);

    if (environment.useMock) {
      return this.mockService.getMockData<Account[]>('accounts').subscribe({
        next: (data) => { this.accounts.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }

    return this.http.get<Account[]>(API.accounts).subscribe({
      next: (data) => { this.accounts.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  create(payload: Partial<Account>) {
    return this.http.post<Account>(API.accounts, payload);
  }

  get(id: UUID) {
    return this.http.get<Account>(`${API.accounts}/${id}`);
  }

  delete(id: UUID) {
    return this.http.delete<void>(`${API.accounts}/${id}`);
  }
}
