import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Don't add auth header to the auth endpoint itself
  if (isAuthUrl(req.url)) {
    return next(req);
  }

  // Add auth header to all other requests
  const authRequest = addAuthHeader(req, authService);

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthUrl(req.url)) {
        return handle401Error(authRequest, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addAuthHeader(request: any, authService: AuthService) {
  const token = authService.getAuthToken();

  if (token) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return request;
}

function handle401Error(request: any, next: any, authService: AuthService): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenResponse) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.access_token);

        return next(addAuthHeader(request, authService));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(() => next(addAuthHeader(request, authService)))
    );
  }
}

function isAuthUrl(url: string): boolean {
  return url.includes('/protocol/openid-connect/token');
}
