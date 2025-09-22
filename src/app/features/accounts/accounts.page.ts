import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { AccountsApi } from '../../core/api/accounts.api';

@Component({
  standalone: true,
  selector: 'app-accounts',
  imports: [NgFor, NgIf, CurrencyPipe],
  template: `
    <h2>Accounts</h2>
    <button (click)="refresh()">Refresh</button>
    <table *ngIf="api.accounts(); else loading">
      <tr><th>Name</th><th>Type</th><th>Balance</th></tr>
      <tr *ngFor="let a of api.accounts()!">
        <td>{{a.name}}</td>
        <td>{{a.type}}</td>
        <td>{{a.balanceCents/100 | currency:a.currency}}</td>
      </tr>
    </table>
    <ng-template #loading>Loading…</ng-template>
  `
})
export default class AccountsPage implements OnInit, OnDestroy {
  api = inject(AccountsApi);
  sub?: any;
  ngOnInit(){ this.sub = this.api.list(); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }
  refresh(){ this.sub?.unsubscribe(); this.sub = this.api.list(); }
}
