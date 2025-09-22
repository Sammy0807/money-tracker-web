import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API } from './api.config';
import { Transaction, UUID } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

@Injectable({ providedIn: 'root' })
export class TransactionsApi {
  private http = inject(HttpClient);
  private mockService = inject(MockDataService);
  transactions = signal<Transaction[] | null>(null);
  loading = signal(false);

  list(params?: { accountId?: UUID; from?: string; to?: string; q?: string; page?: number; size?: number; }) {
    this.loading.set(true);

    if (environment.useMock) {
      const page = params?.page || 0;
      const size = params?.size || 50;
      return this.mockService.getMockTransactionsPaged(page, size).subscribe({
        next: (data) => {
          this.transactions.set(data?.content || []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }

    let p = new HttpParams();
    for (const [k,v] of Object.entries(params ?? {})) if (v !== undefined && v !== null) p = p.set(k, String(v));
    return this.http.get<Transaction[]>(API.transactions, { params: p }).subscribe({
      next: (data) => { this.transactions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  create(payload: Partial<Transaction>) {
    return this.http.post<Transaction>(API.transactions, payload);
  }
}
