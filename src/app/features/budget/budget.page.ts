import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { BudgetApi } from '../../core/api/budget.api';

@Component({
  standalone: true,
  selector: 'app-budget',
  imports: [NgFor, NgIf, CurrencyPipe],
  template: `
    <h2>Budget Summary</h2>
    <button (click)="refresh()">Refresh</button>
    <div *ngIf="summaries; else loading">
      <table>
        <tr><th>Month</th><th>Income</th><th>Expenses</th><th>Savings Rate</th></tr>
        <tr *ngFor="let s of summaries">
          <td>{{s.month}}</td>
          <td>{{s.incomeCents/100 | currency:'USD'}}</td>
          <td>{{s.expenseCents/100 | currency:'USD'}}</td>
          <td>{{(s.savingsRate * 100).toFixed(1)}}%</td>
        </tr>
      </table>
    </div>
    <ng-template #loading>Loading…</ng-template>
  `
})
export default class BudgetPage implements OnInit, OnDestroy {
  api = inject(BudgetApi);
  summaries: any = null;
  sub?: any;

  ngOnInit(){ this.refresh(); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }

  refresh(){
    this.sub?.unsubscribe();
    this.sub = this.api.summary().subscribe(data => this.summaries = data);
  }
}
