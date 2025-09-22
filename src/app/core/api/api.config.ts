import { environment } from '../../../environments/environment';

export const API = {
  base: environment.apiBase,
  accounts: `${environment.apiBase}/accounts`,
  transactions: `${environment.apiBase}/transactions`,
  budget: `${environment.apiBase}/budget`,
  analytics: `${environment.apiBase}/analytics`,
  rules: `${environment.apiBase}/rules`,
  notifications: `${environment.apiBase}/notifications`,
  import: `${environment.apiBase}/import`,
  user: `${environment.apiBase}/users`
};
