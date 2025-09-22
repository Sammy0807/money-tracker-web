import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RulesApi } from '../../core/api/rules.api';

@Component({
  standalone: true,
  selector: 'app-rules',
  imports: [NgFor, NgIf],
  template: `
    <h2>Transaction Rules</h2>
    <button (click)="refresh()">Refresh</button>

    <div *ngIf="rules; else loading">
      <table>
        <tr><th>Name</th><th>Predicate</th><th>Action</th><th>Status</th><th>Actions</th></tr>
        <tr *ngFor="let rule of rules">
          <td>{{rule.name}}</td>
          <td>{{rule.predicate}}</td>
          <td>{{rule.action}}</td>
          <td>
            <span [class]="rule.active ? 'status-active' : 'status-inactive'">
              {{rule.active ? 'Active' : 'Inactive'}}
            </span>
          </td>
          <td>
            <button *ngIf="!rule.active" (click)="activate(rule.id)">Activate</button>
            <button *ngIf="rule.active" (click)="deactivate(rule.id)">Deactivate</button>
          </td>
        </tr>
      </table>
    </div>

    <ng-template #loading>Loading…</ng-template>
  `,
  styles: [`
    .status-active { color: green; font-weight: bold; }
    .status-inactive { color: red; }
    button { margin: 0 4px; padding: 4px 8px; }
  `]
})
export default class RulesPage implements OnInit, OnDestroy {
  api = inject(RulesApi);
  rules: any = null;
  sub?: any;

  ngOnInit(){ this.refresh(); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }

  refresh(){
    this.sub?.unsubscribe();
    this.sub = this.api.getAll().subscribe(data => this.rules = data);
  }

  activate(id: string) {
    this.api.activate(id).subscribe(() => this.refresh());
  }

  deactivate(id: string) {
    this.api.deactivate(id).subscribe(() => this.refresh());
  }
}
