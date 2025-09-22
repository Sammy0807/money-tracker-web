import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppShellComponent } from './app/core/layout/app-shell.component';

bootstrapApplication(AppShellComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
