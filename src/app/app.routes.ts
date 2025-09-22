import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.default) },
  { path: 'accounts', loadComponent: () => import('./features/accounts/accounts.page').then(m => m.default) },
  { path: 'transactions', loadComponent: () => import('./features/transactions/transactions.page').then(m => m.default) },
  { path: 'budget', loadComponent: () => import('./features/budget/budget.page').then(m => m.default) },
  { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.page').then(m => m.default) },
  { path: 'rules', loadComponent: () => import('./features/rules/rules.page').then(m => m.default) },
  { path: 'import', loadComponent: () => import('./features/import/import.page').then(m => m.default) },
  { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.page').then(m => m.default) },
  { path: 'profile', loadComponent: () => import('./features/profile/profile.page').then(m => m.default) },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
