import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from './api.config';
import { Transaction, UUID } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

export interface ImportJob {
  id: UUID;
  filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows?: number;
  processedRows?: number;
  processed?: number;  // Support both field names from mock
  errors?: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ImportPreview {
  headers: string[];
  rows: string[][];
  mapping: { [header: string]: string };
}

@Injectable({ providedIn: 'root' })
export class ImportApi {
  private http = inject(HttpClient);
  private mockService = inject(MockDataService);

  // File upload (multipart)
  upload(file: File, accountId: UUID) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accountId', accountId);
    return this.http.post<ImportJob>(`${API.import}/upload`, formData);
  }

  // Preview import data
  preview(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportPreview>(`${API.import}/preview`, formData);
  }

  // Import job management
  getJobs() {
    if (environment.useMock) {
      return this.mockService.getMockData<ImportJob[]>('imports');
    }
    return this.http.get<ImportJob[]>(`${API.import}/jobs`);
  }

  getJob(id: UUID) { return this.http.get<ImportJob>(`${API.import}/jobs/${id}`); }
  getJobTransactions(id: UUID) { return this.http.get<Transaction[]>(`${API.import}/jobs/${id}/transactions`); }

  // Cancel/retry job
  cancelJob(id: UUID) { return this.http.post<ImportJob>(`${API.import}/jobs/${id}/cancel`, {}); }
  retryJob(id: UUID) { return this.http.post<ImportJob>(`${API.import}/jobs/${id}/retry`, {}); }
}
