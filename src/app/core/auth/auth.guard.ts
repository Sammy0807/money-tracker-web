import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = async () => {
  const kc = inject(KeycloakService);
  const router = inject(Router);

  // Skip auth check if using mock data
  if (!kc) return true;

  try {
    const authenticated = await kc.isLoggedIn();
    if (!authenticated) {
      await kc.login();
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Keycloak auth error, allowing access:', error);
    return true; // Allow access if Keycloak fails (for development)
  }
};
