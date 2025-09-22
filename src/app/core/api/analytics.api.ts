import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from './api.config';
import { AnalyticsKpi, BudgetSummary } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  private http = inject(HttpClient);
  private mockService = inject(MockDataService);

  kpis() {
    if (environment.useMock) {
      return this.mockService.getMockData<AnalyticsKpi[]>('analytics.kpis');
    }
    return this.http.get<AnalyticsKpi[]>(`${API.analytics}/kpis`);
  }

  monthly() {
    if (environment.useMock) {
      return this.mockService.getMockData<BudgetSummary[]>('analytics.monthly');
    }
    return this.http.get<BudgetSummary[]>(`${API.analytics}/monthly`);
  }
}
