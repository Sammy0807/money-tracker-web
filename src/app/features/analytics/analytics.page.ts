import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { AnalyticsApi } from '../../core/api/analytics.api';

@Component({
  standalone: true,
  selector: 'app-analytics',
  imports: [NgFor, NgIf, DecimalPipe],
  template: `
    <h2>Analytics</h2>
    <button (click)="refresh()">Refresh</button>

    <div *ngIf="kpis; else loading">
      <h3>Key Performance Indicators</h3>
      <div class="kpi-grid">
        <div *ngFor="let kpi of kpis" class="kpi-card">
          <h4>{{kpi.name}}</h4>
          <div class="kpi-value">{{kpi.value | number:'1.0-2'}}</div>
          <div *ngIf="kpi.delta" class="kpi-delta"
               [class.positive]="kpi.delta > 0"
               [class.negative]="kpi.delta < 0">
            {{kpi.delta > 0 ? '+' : ''}}{{kpi.delta | number:'1.0-2'}}
          </div>
        </div>
      </div>

      <h3>Monthly Trends</h3>
      <table *ngIf="monthly">
        <tr><th>Month</th><th>Income</th><th>Expenses</th><th>Savings Rate</th></tr>
        <tr *ngFor="let m of monthly">
          <td>{{m.month}}</td>
          <td>{{m.incomeCents/100 | number:'1.0-2'}}</td>
          <td>{{m.expenseCents/100 | number:'1.0-2'}}</td>
          <td>{{(m.savingsRate * 100) | number:'1.1-1'}}%</td>
        </tr>
      </table>
    </div>

    <ng-template #loading>Loading…</ng-template>
  `,
  styles: [`
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; }
    .kpi-card { border: 1px solid #ddd; padding: 1rem; border-radius: 4px; }
    .kpi-value { font-size: 1.5em; font-weight: bold; }
    .kpi-delta.positive { color: green; }
    .kpi-delta.negative { color: red; }
  `]
})
export default class AnalyticsPage implements OnInit, OnDestroy {
  api = inject(AnalyticsApi);
  kpis: any = null;
  monthly: any = null;
  sub1?: any;
  sub2?: any;

  ngOnInit(){ this.refresh(); }
  ngOnDestroy(){
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
  }

  refresh(){
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub1 = this.api.kpis().subscribe(data => this.kpis = data);
    this.sub2 = this.api.monthly().subscribe(data => this.monthly = data);
  }
}
