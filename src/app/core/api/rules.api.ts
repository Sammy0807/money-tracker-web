import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from './api.config';
import { Rule, UUID } from './models';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-loader';

@Injectable({ providedIn: 'root' })
export class RulesApi {
  private http = inject(HttpClient);
  private mockService = inject(MockDataService);

  // CRUD operations
  getAll() {
    if (environment.useMock) {
      return this.mockService.getMockData<Rule[]>('rules');
    }
    return this.http.get<Rule[]>(`${API.rules}`);
  }

  getById(id: UUID) { return this.http.get<Rule>(`${API.rules}/${id}`); }
  create(rule: Omit<Rule, 'id'>) { return this.http.post<Rule>(`${API.rules}`, rule); }
  update(id: UUID, rule: Partial<Rule>) { return this.http.put<Rule>(`${API.rules}/${id}`, rule); }
  delete(id: UUID) { return this.http.delete<void>(`${API.rules}/${id}`); }

  // Special endpoints
  activate(id: UUID) { return this.http.post<Rule>(`${API.rules}/${id}/activate`, {}); }
  deactivate(id: UUID) { return this.http.post<Rule>(`${API.rules}/${id}/deactivate`, {}); }
  test(predicate: string) { return this.http.post<{ valid: boolean; error?: string }>(`${API.rules}/test`, { predicate }); }
}
