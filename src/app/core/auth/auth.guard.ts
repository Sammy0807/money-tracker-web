import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }

  private checkAuth(url: string): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
      // Check if token is expired
      if (this.authService.isTokenExpired()) {
        // Try to refresh token
        return this.authService.refreshToken().pipe(
          map(() => true),
          catchError(() => {
            this.redirectToLogin(url);
            return of(false);
          })
        );
      }
      return of(true);
    }

    this.redirectToLogin(url);
    return of(false);
  }

  private redirectToLogin(url: string): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: url }
    });
  }
}

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']); // or your default authenticated route
      return false;
    }
    return true;
  }
}
