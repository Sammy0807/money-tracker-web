import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

export const authInterceptor: HttpInterceptorFn = async (req, next) => {
  try {
    const kc = inject(KeycloakService);
    const token = await kc.getToken();
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    return next(authReq);
  } catch (error) {
    // If Keycloak fails, proceed without auth header
    console.warn('Auth interceptor error, proceeding without token:', error);
    return next(req);
  }
};
