import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { TransactionsApi } from '../../core/api/transactions.api';

@Component({
  standalone: true,
  selector: 'app-transactions',
  imports: [NgFor, NgIf, CurrencyPipe, DatePipe],
  template: `
    <h2>Transactions</h2>
    <button (click)="refresh()">Refresh</button>
    <table *ngIf="api.transactions(); else loading">
      <tr><th>Date</th><th>Merchant</th><th>Amount</th><th>Category</th></tr>
      <tr *ngFor="let t of api.transactions()!">
        <td>{{t.occurredAt | date:'short'}}</td>
        <td>{{t.merchant || 'Unknown'}}</td>
        <td>{{t.amountCents/100 | currency:t.currency}}</td>
        <td>{{t.category || 'Uncategorized'}}</td>
      </tr>
    </table>
    <ng-template #loading>Loading…</ng-template>
  `
})
export default class TransactionsPage implements OnInit, OnDestroy {
  api = inject(TransactionsApi);
  sub?: any;
  ngOnInit(){ this.sub = this.api.list(); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }
  refresh(){ this.sub?.unsubscribe(); this.sub = this.api.list(); }
}
