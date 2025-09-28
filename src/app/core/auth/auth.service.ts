import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  username: string;
  password: string;
  grant_type?: string;
  client_id?: string;
  client_secret?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface AuthUser {
  username: string;
  // Add other user properties as needed
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals for reactive state management
  private _isAuthenticated = signal(false);
  private _user = signal<AuthUser | null>(null);
  private _token = signal<string | null>(null);

  // Public readonly signals
  isAuthenticated = this._isAuthenticated.asReadonly();
  user = this._user.asReadonly();
  token = this._token.asReadonly();

  // Computed signal for auth status
  authStatus = computed(() => ({
    isAuthenticated: this._isAuthenticated(),
    user: this._user(),
    hasToken: !!this._token()
  }));

  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'auth_user';

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user) {
      this._token.set(token);
      this._user.set(user);
      this._isAuthenticated.set(true);
    }
  }

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    // Prepare form data as required by OAuth2
    const body = new URLSearchParams({
      grant_type: credentials.grant_type || 'password',
      client_id: credentials.client_id || 'gateway',
      client_secret: credentials.client_secret || 'gHT8yvTHCrR8mQGPLaXGDVAPSxlgFk9C',
      username: credentials.username,
      password: credentials.password
    }).toString();

    return this.http.post<TokenResponse>(environment.userAuth.url, body, { headers })
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response, credentials.username);
        }),
        catchError(error => {
          console.error('Login failed:', error);
          this.handleAuthError();
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this._isAuthenticated.set(false);
    this._user.set(null);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: 'gateway',
      client_secret: 'gHT8yvTHCrR8mQGPLaXGDVAPSxlgFk9C',
      refresh_token: refreshToken
    }).toString();

    return this.http.post<TokenResponse>(environment.userAuth.url, body, { headers })
      .pipe(
        tap(response => {
          this.updateTokens(response);
        }),
        catchError(error => {
          console.error('Token refresh failed:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  getAuthToken(): string | null {
    return this._token();
  }

  isTokenExpired(): boolean {
    const token = this._token();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  private handleAuthSuccess(response: TokenResponse, username: string): void {
    const user: AuthUser = { username };

    this.storeToken(response.access_token);
    this.storeUser(user);

    if (response.refresh_token) {
      this.storeRefreshToken(response.refresh_token);
    }

    this._token.set(response.access_token);
    this._user.set(user);
    this._isAuthenticated.set(true);
  }

  private handleAuthError(): void {
    this.clearAuthData();
    this._isAuthenticated.set(false);
    this._user.set(null);
    this._token.set(null);
  }

  private updateTokens(response: TokenResponse): void {
    this.storeToken(response.access_token);
    this._token.set(response.access_token);

    if (response.refresh_token) {
      this.storeRefreshToken(response.refresh_token);
    }
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private storeUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
