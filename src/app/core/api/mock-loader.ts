import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, map, shareReplay, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private http = inject(HttpClient);
  private mockData$ = new BehaviorSubject<any>(null);
  private loadingPromise: Promise<any> | null = null;

  private loadMockData(): Promise<any> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    if (!environment.useMock) {
      return Promise.resolve(null);
    }

    this.loadingPromise = this.http.get<any>('assets/finance_mock.json')
      .pipe(shareReplay(1))
      .toPromise()
      .then(data => {
        this.mockData$.next(data);
        return data;
      })
      .catch(error => {
        console.error('Failed to load mock data:', error);
        this.mockData$.next({});
        return {};
      });

    return this.loadingPromise;
  }

  // Generic method to get any section of mock data
  getMockData<T>(path: string): Observable<T> {
    if (!environment.useMock) {
      throw new Error('Mock data not enabled');
    }

    return new Observable(observer => {
      this.loadMockData().then(data => {
        // Navigate the path (e.g., 'user', 'accounts', 'transactions.paged.content')
        let result = data;
        for (const segment of path.split('.')) {
          result = result?.[segment];
        }
        observer.next(result as T);
        observer.complete();
      });
    });
  }

  // Simulate paginated transactions
  getMockTransactionsPaged(page: number = 0, size: number = 50): Observable<any> {
    return this.getMockData<any>('transactions.paged').pipe(
      map(paged => {
        if (!paged) return null;

        const startIndex = page * size;
        const endIndex = startIndex + size;
        const content = paged.content.slice(startIndex, endIndex);

        return {
          ...paged,
          page,
          size,
          content,
          totalElements: paged.content.length
        };
      })
    );
  }
}
