import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API } from './api.config';
import { BudgetSummary } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

@Injectable({ providedIn: 'root' })
export class BudgetApi {
  private http = inject(HttpClient);
  private mockService = inject(MockDataService);

  // Get budget summaries
  summary() {
    if (environment.useMock) {
      return this.mockService.getMockData<BudgetSummary[]>('budget.summaries');
    }
    return this.http.get<BudgetSummary[]>(`${API.budget}/summary`);
  }

  // Get budget for specific month
  getMonth(month: string) {
    if (environment.useMock) {
      return this.mockService.getMockData<BudgetSummary[]>('budget.summaries').pipe(
        map((summaries: BudgetSummary[]) => summaries?.find(s => s.month === month))
      );
    }
    return this.http.get<BudgetSummary>(`${API.budget}/${month}`);
  }

  // Update budget for specific month
  updateMonth(month: string, budget: Partial<BudgetSummary>) {
    return this.http.put<BudgetSummary>(`${API.budget}/${month}`, budget);
  }
}
