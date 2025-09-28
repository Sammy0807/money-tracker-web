import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from './api.config';
import { Account, UUID } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

@Injectable({ providedIn: 'root' })
export class AccountsApi {
  private http = inject(HttpClient);


  accounts = signal<Account[] | null>(null);
  loading = signal(false);

  list() {
    console.log('AccountsApi: list() called, useMock:', environment.useMock);
    this.loading.set(true);

    return this.http.get<Account[]>(API.accounts).subscribe({
      next: data => {
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: err => {
        // Enhanced diagnostics: differentiate network/CORS vs auth vs server
        const details = {
          message: err?.message,
            status: err?.status,
            statusText: err?.statusText,
            url: err?.url,
            error: err?.error
        };
        console.error('AccountsApi: real API error', details);
        if (details.status === 0) {
          console.warn('Status 0 suggests network failure or CORS preflight rejection.');
        }
        if (details.status === 401 || details.status === 403) {
          console.warn('Auth issue: verify token audience, realm, clientId, and interceptor.');
        }
        this.loading.set(false);
      }
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
