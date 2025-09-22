import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, JsonPipe } from '@angular/common';
import { AccountsApi } from '../../core/api/accounts.api';

@Component({
  standalone: true,
  selector: 'app-accounts-simple',
  imports: [NgFor, NgIf, CurrencyPipe, JsonPipe],
  template: `
    <div class="accounts-container">
      <h1>My Accounts - Debug Version</h1>
      <button (click)="refresh()">Refresh Data</button>

      <div class="debug-section">
        <h3>Debug Info:</h3>
        <p>Loading: {{ api.loading() }}</p>
        <p>Accounts count: {{ accounts.length }}</p>
        <pre>{{ accounts | json }}</pre>
      </div>

      <div class="accounts-list" *ngIf="accounts.length > 0">
        <h3>Accounts:</h3>
        <div class="account-item" *ngFor="let account of accounts">
          <h4>{{ account.name }}</h4>
          <p>Institution: {{ account.institution }}</p>
          <p>Type: {{ account.type }}</p>
          <p>Balance: {{ account.balanceCents / 100 | currency:account.currency }}</p>
          <hr>
        </div>
      </div>

      <div *ngIf="accounts.length === 0 && !api.loading()">
        <p>No accounts found</p>
      </div>

      <div *ngIf="api.loading()">
        <p>Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .accounts-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .debug-section {
      background: #f5f5f5;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }

    .account-item {
      margin: 10px 0;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    pre {
      background: #f0f0f0;
      padding: 10px;
      border-radius: 3px;
      overflow-x: auto;
      max-height: 300px;
    }
  `]
})
export default class AccountsSimplePage implements OnInit, OnDestroy {
  api = inject(AccountsApi);

  get accounts() {
    return this.api.accounts() || [];
  }

  private subscriptions: any[] = [];

  ngOnInit() {
    console.log('AccountsSimplePage: ngOnInit');
    console.log('AccountsSimplePage: initial accounts state:', this.api.accounts());
    console.log('AccountsSimplePage: loading state:', this.api.loading());
    this.refresh();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub?.unsubscribe());
  }

  refresh() {
    console.log('AccountsSimplePage: refresh called');
    console.log('AccountsSimplePage: before refresh - accounts:', this.api.accounts());
    console.log('AccountsSimplePage: before refresh - loading:', this.api.loading());

    this.subscriptions.forEach(sub => sub?.unsubscribe());
    this.subscriptions = [];

    const subscription = this.api.list();
    console.log('AccountsSimplePage: subscription created:', subscription);
    this.subscriptions.push(subscription);

    // Add a timeout to check state after a few seconds
    setTimeout(() => {
      console.log('AccountsSimplePage: 2 seconds after refresh - accounts:', this.api.accounts());
      console.log('AccountsSimplePage: 2 seconds after refresh - loading:', this.api.loading());
    }, 2000);
  }
}
