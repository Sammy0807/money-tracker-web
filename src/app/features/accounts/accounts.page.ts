import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountsApi } from '../../core/api/accounts.api';
import { MockDataService } from '../../core/api/mock-loader';

@Component({
  standalone: true,
  selector: 'app-accounts',
  imports: [NgFor, NgIf, CurrencyPipe, DecimalPipe, TitleCasePipe, FormsModule],
  template: `
    <div class="accounts-container">
      <header class="page-header">
        <h1 class="page-title">My Accounts</h1>
        <p class="page-subtitle">Manage and monitor all your financial accounts</p>
        <button class="refresh-btn" (click)="refresh()">
          <span class="refresh-icon">🔄</span>
          Refresh Data
        </button>
      </header>

      <!-- Account Summary Cards -->
      <section class="account-summary" *ngIf="accounts.length > 0">
        <div class="summary-grid">
          <div class="summary-card total-assets">
            <div class="summary-header">
              <h3 class="summary-title">Total Assets</h3>
              <span class="summary-icon">💰</span>
            </div>
            <div class="summary-value">{{ getTotalAssets() | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="summary-change positive">
              <span class="change-icon">↗️</span>
              <span class="change-text">+4.2% this month</span>
            </div>
          </div>

          <div class="summary-card total-liabilities">
            <div class="summary-header">
              <h3 class="summary-title">Total Liabilities</h3>
              <span class="summary-icon">💳</span>
            </div>
            <div class="summary-value">{{ getTotalLiabilities() | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="summary-change negative">
              <span class="change-icon">↘️</span>
              <span class="change-text">-2.1% this month</span>
            </div>
          </div>

          <div class="summary-card net-worth">
            <div class="summary-header">
              <h3 class="summary-title">Net Worth</h3>
              <span class="summary-icon">📊</span>
            </div>
            <div class="summary-value">{{ getNetWorth() | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="summary-change positive">
              <span class="change-icon">↗️</span>
              <span class="change-text">+5.8% this month</span>
            </div>
          </div>

          <div class="summary-card active-accounts">
            <div class="summary-header">
              <h3 class="summary-title">Active Accounts</h3>
              <span class="summary-icon">🏦</span>
            </div>
            <div class="summary-value">{{ getActiveAccountsCount() }}</div>
            <div class="summary-change neutral">
              <span class="change-text">across {{ getInstitutionsCount() }} institutions</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Filters and Controls -->
      <section class="account-controls">
        <div class="filter-bar">
          <div class="filter-group">
            <label for="typeFilter" class="filter-label">Account Type:</label>
            <select id="typeFilter" class="filter-select" [(ngModel)]="selectedAccountType" (change)="filterAccounts()">
              <option value="ALL">All Types</option>
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
              <option value="CREDIT">Credit Cards</option>
              <option value="INVESTMENT">Investments</option>
              <option value="LOAN">Loans</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="institutionFilter" class="filter-label">Institution:</label>
            <select id="institutionFilter" class="filter-select" [(ngModel)]="selectedInstitution" (change)="filterAccounts()">
              <option value="ALL">All Institutions</option>
              <option *ngFor="let institution of getUniqueInstitutions()" [value]="institution">{{ institution }}</option>
            </select>
          </div>

          <div class="view-toggle">
            <button class="toggle-btn" [class.active]="viewMode === 'cards'" (click)="setViewMode('cards')">
              <span class="toggle-icon">📱</span>
              Cards
            </button>
            <button class="toggle-btn" [class.active]="viewMode === 'list'" (click)="setViewMode('list')">
              <span class="toggle-icon">📋</span>
              List
            </button>
          </div>
        </div>
      </section>

      <!-- Accounts Display -->
      <!-- Accounts Display -->
      <section class="accounts-section" *ngIf="filteredAccounts.length > 0; else noAccountsOrLoading">
        <!-- Card View -->
        <div class="accounts-grid" *ngIf="viewMode === 'cards'">
          <div class="account-card"
               *ngFor="let account of filteredAccounts"
               [class]="'account-' + account.type.toLowerCase()"
               [class.inactive]="isInactive(account)">

            <div class="account-header">
              <div class="account-info">
                <h3 class="account-name">{{ account.name }}</h3>
                <p class="account-institution">{{ account.institution }}</p>
                <span class="account-number">{{ getAccountNumber(account) }}</span>
              </div>
              <div class="account-type-badge" [class]="'badge-' + account.type.toLowerCase()">
                {{ account.type | titlecase }}
              </div>
            </div>

            <div class="account-balance-section">
              <div class="primary-balance">
                <span class="balance-label">{{ getBalanceLabel(account.type) }}</span>
                <span class="balance-amount" [class.negative]="account.balanceCents < 0">
                  {{ account.balanceCents / 100 | currency:account.currency:'symbol':'1.0-0' }}
                </span>
              </div>

              <div class="secondary-info" *ngIf="hasAvailableBalance(account)">
                <span class="available-label">Available Credit:</span>
                <span class="available-amount">
                  {{ getAvailableBalance(account) / 100 | currency:account.currency:'symbol':'1.0-0' }}
                </span>
              </div>

              <div class="secondary-info" *ngIf="hasInterestRate(account)">
                <span class="rate-label">Interest Rate:</span>
                <span class="rate-amount">{{ getInterestRate(account) | number:'1.2-2' }}%</span>
              </div>
            </div>

            <div class="account-actions">
              <button class="action-btn primary">View Details</button>
              <button class="action-btn secondary">Transactions</button>
              <button class="action-btn tertiary">⭐</button>
            </div>

            <div class="account-status" *ngIf="isInactive(account)">
              <span class="status-indicator">⚠️ Inactive</span>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div class="accounts-table" *ngIf="viewMode === 'list'">
          <table class="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Institution</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Interest Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let account of filteredAccounts" [class.inactive]="isInactive(account)">
                <td>
                  <div class="account-cell">
                    <strong class="account-name">{{ account.name }}</strong>
                    <small class="account-number">{{ getAccountNumber(account) }}</small>
                  </div>
                </td>
                <td>{{ account.institution }}</td>
                <td>
                  <span class="type-badge" [class]="'badge-' + account.type.toLowerCase()">
                    {{ account.type | titlecase }}
                  </span>
                </td>
                <td>
                  <span class="balance" [class.negative]="account.balanceCents < 0">
                    {{ account.balanceCents / 100 | currency:account.currency:'symbol':'1.0-0' }}
                  </span>
                </td>
                <td>
                  <span *ngIf="hasInterestRate(account)">{{ getInterestRate(account) | number:'1.2-2' }}%</span>
                  <span *ngIf="!hasInterestRate(account)">—</span>
                </td>
                <td>
                  <span class="status-badge" [class.active]="isActive(account)" [class.inactive]="isInactive(account)">
                    {{ isActive(account) ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="action-btn-small">View</button>
                    <button class="action-btn-small">Edit</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <ng-template #noAccountsOrLoading>
        <div class="empty-state" *ngIf="!api.loading(); else loading">
          <div class="empty-icon">🏦</div>
          <h3 class="empty-title">No accounts found</h3>
          <p class="empty-message">Try adjusting your filters or add a new account to get started.</p>
          <button class="empty-action-btn">Add Account</button>
        </div>

        <ng-template #loading>
          <div class="loading-state">
            <div class="loading-spinner">⏳</div>
            <p class="loading-message">Loading your accounts...</p>
          </div>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: [`
    .accounts-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-lg);
      font-family: var(--font-family);
    }

    /* Header Styles */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2xl);
      padding-bottom: var(--space-lg);
      border-bottom: 1px solid var(--border-light);
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 var(--space-xs) 0;
    }

    .page-subtitle {
      color: var(--text-secondary);
      margin: 0;
      font-size: 1rem;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-lg);
      background: var(--primary-gradient);
      color: white;
      border: none;
      border-radius: var(--radius-lg);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .refresh-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    /* Summary Cards */
    .account-summary {
      margin-bottom: var(--space-2xl);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-lg);
    }

    .summary-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      transition: all var(--transition-base);
    }

    .summary-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-md);
    }

    .summary-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-icon {
      font-size: 1.5rem;
    }

    .summary-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--space-sm);
    }

    .summary-change {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .summary-change.positive {
      color: var(--success-color);
    }

    .summary-change.negative {
      color: var(--danger-color);
    }

    .summary-change.neutral {
      color: var(--text-secondary);
    }

    /* Filters and Controls */
    .account-controls {
      margin-bottom: var(--space-xl);
    }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .filter-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .filter-select {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .view-toggle {
      display: flex;
      gap: var(--space-xs);
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--border-light);
      background: var(--bg-primary);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .toggle-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    /* Account Cards */
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--space-xl);
    }

    .account-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      transition: all var(--transition-base);
      position: relative;
      overflow: hidden;
    }

    .account-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-gradient);
    }

    .account-card.account-checking::before {
      background: var(--primary-gradient);
    }

    .account-card.account-savings::before {
      background: var(--success-gradient);
    }

    .account-card.account-credit::before {
      background: var(--warning-gradient);
    }

    .account-card.account-investment::before {
      background: var(--info-gradient);
    }

    .account-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .account-card.inactive {
      opacity: 0.6;
    }

    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-lg);
    }

    .account-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--space-xs) 0;
    }

    .account-institution {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0 0 var(--space-xs) 0;
    }

    .account-number {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      font-family: 'Monaco', 'Consolas', monospace;
    }

    .account-type-badge {
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-checking {
      background: var(--primary-bg);
      color: var(--primary-color);
    }

    .badge-savings {
      background: var(--success-bg);
      color: var(--success-color);
    }

    .badge-credit {
      background: var(--warning-bg);
      color: var(--warning-color);
    }

    .badge-investment {
      background: var(--info-bg);
      color: var(--info-color);
    }

    .account-balance-section {
      margin-bottom: var(--space-lg);
    }

    .primary-balance {
      margin-bottom: var(--space-md);
    }

    .balance-label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
    }

    .balance-amount {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .balance-amount.negative {
      color: var(--danger-color);
    }

    .secondary-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-sm);
      font-size: 0.875rem;
    }

    .available-label,
    .rate-label {
      color: var(--text-secondary);
    }

    .available-amount,
    .rate-amount {
      color: var(--text-primary);
      font-weight: 500;
    }

    .account-actions {
      display: flex;
      gap: var(--space-sm);
    }

    .action-btn {
      flex: 1;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .action-btn.primary {
      background: var(--primary-gradient);
      color: white;
      border: none;
    }

    .action-btn.secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-light);
    }

    .action-btn.tertiary {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-light);
      flex: 0 0 40px;
    }

    .action-btn:hover {
      transform: translateY(-1px);
    }

    /* Table Styles */
    .accounts-table {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th {
      background: var(--bg-secondary);
      padding: var(--space-md) var(--space-lg);
      text-align: left;
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table td {
      padding: var(--space-lg);
      border-bottom: 1px solid var(--border-light);
    }

    .table tr:hover {
      background: var(--bg-secondary);
    }

    .table tr.inactive {
      opacity: 0.6;
    }

    .account-cell {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .account-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .account-number {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      font-family: 'Monaco', 'Consolas', monospace;
    }

    .type-badge {
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .balance.negative {
      color: var(--danger-color);
    }

    .status-badge {
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.active {
      background: var(--success-bg);
      color: var(--success-color);
    }

    .status-badge.inactive {
      background: var(--danger-bg);
      color: var(--danger-color);
    }

    .table-actions {
      display: flex;
      gap: var(--space-sm);
    }

    .action-btn-small {
      padding: var(--space-xs) var(--space-sm);
      border: 1px solid var(--border-light);
      background: var(--bg-primary);
      color: var(--text-primary);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .action-btn-small:hover {
      background: var(--primary-color);
      color: white;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-secondary);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--space-lg);
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-md);
    }

    .empty-message {
      font-size: 1rem;
      margin-bottom: var(--space-xl);
    }

    .empty-action-btn {
      padding: var(--space-md) var(--space-xl);
      background: var(--primary-gradient);
      color: white;
      border: none;
      border-radius: var(--radius-lg);
      font-weight: 500;
      cursor: pointer;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-secondary);
    }

    .loading-spinner {
      font-size: 2rem;
      margin-bottom: var(--space-lg);
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-md);
      }

      .filter-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .accounts-grid {
        grid-template-columns: 1fr;
      }

      .accounts-table {
        overflow-x: auto;
      }
    }
  `]
})
export default class AccountsPage implements OnInit, OnDestroy {
  api = inject(AccountsApi);
  private mockDataService = inject(MockDataService);

  // Data properties
  get accounts() {
    return this.api.accounts() || [];
  }

  filteredAccounts: any[] = [];

  // UI state
  selectedAccountType = 'ALL';
  selectedInstitution = 'ALL';
  viewMode: 'cards' | 'list' = 'cards';

  // Subscriptions
  private subscriptions: any[] = [];

  ngOnInit() {
    this.refresh();
    // Initialize filtered accounts
    this.filterAccounts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub?.unsubscribe());
  }

  refresh() {
    console.log('AccountsPage: refresh() called');
    // Unsubscribe from previous subscriptions
    this.subscriptions.forEach(sub => sub?.unsubscribe());
    this.subscriptions = [];

    // Use the AccountsApi service to load data
    console.log('AccountsPage: calling api.list()');
    const subscription = this.api.list();
    this.subscriptions.push(subscription);

    // Watch for changes in accounts data and filter them
    setTimeout(() => {
      console.log('AccountsPage: accounts loaded, count:', this.accounts.length);
      this.filterAccounts();
    }, 100);
  }  // Filtering methods
  filterAccounts() {
    this.filteredAccounts = this.accounts.filter(account => {
      const typeMatch = this.selectedAccountType === 'ALL' || account.type === this.selectedAccountType;
      const institutionMatch = this.selectedInstitution === 'ALL' || account.institution === this.selectedInstitution;
      return typeMatch && institutionMatch;
    });
  }

  getUniqueInstitutions(): string[] {
    const institutions = this.accounts.map(account => account.institution).filter((inst): inst is string => !!inst);
    return [...new Set(institutions)].sort();
  }

  setViewMode(mode: 'cards' | 'list') {
    this.viewMode = mode;
  }

  // Helper methods for template
  getAccountNumber(account: any): string {
    return account.accountNumber || '****';
  }

  isInactive(account: any): boolean {
    return account.isActive === false;
  }

  getAvailableBalance(account: any): number {
    return account.availableBalanceCents || account.balanceCents;
  }

  hasAvailableBalance(account: any): boolean {
    return account.availableBalanceCents !== undefined &&
           account.availableBalanceCents !== account.balanceCents &&
           account.type === 'CREDIT';
  }

  getInterestRate(account: any): number {
    return account.interestRate;
  }

  hasInterestRate(account: any): boolean {
    return !!account.interestRate;
  }

  isActive(account: any): boolean {
    return account.isActive !== false;
  }

  // Summary calculations
  getTotalAssets(): number {
    return this.accounts
      .filter(account => account.balanceCents > 0)
      .reduce((total, account) => total + account.balanceCents, 0) / 100;
  }

  getTotalLiabilities(): number {
    return Math.abs(this.accounts
      .filter(account => account.balanceCents < 0)
      .reduce((total, account) => total + account.balanceCents, 0)) / 100;
  }

  getNetWorth(): number {
    return this.accounts.reduce((total, account) => total + account.balanceCents, 0) / 100;
  }

  getActiveAccountsCount(): number {
    return this.accounts.filter(account => (account as any).isActive !== false).length;
  }

  getInstitutionsCount(): number {
    return this.getUniqueInstitutions().length;
  }

  // Utility methods
  getBalanceLabel(accountType: string): string {
    const labels: { [key: string]: string } = {
      'CHECKING': 'Current Balance',
      'SAVINGS': 'Account Balance',
      'CREDIT': 'Current Balance',
      'INVESTMENT': 'Portfolio Value',
      'LOAN': 'Outstanding Balance'
    };
    return labels[accountType] || 'Balance';
  }
}
