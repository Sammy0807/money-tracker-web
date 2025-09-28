import { bootstrapApplication } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppShellComponent } from './app/core/layout/app-shell.component';
import { authInterceptor } from './app/core/auth/auth.interceptor';

bootstrapApplication(AppShellComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch(err => console.error(err));
