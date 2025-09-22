import { Component, OnInit, inject, signal } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { AnalyticsApi } from '../../core/api/analytics.api';
import { MockDataService } from '../../core/api/mock-loader';

interface Kpi {
  name: string;
  value: number;
  delta?: number;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, DecimalPipe],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1 class="page-title">Financial Dashboard</h1>
        <p class="page-subtitle">Welcome back! Here's your complete financial overview.</p>
      </header>

      <!-- KPI Cards Section -->
      <section class="kpi-section">
        <div class="kpi-grid">
          <div class="kpi-card" *ngFor="let k of kpis$(); trackBy: trackByKpi">
            <div class="kpi-header">
              <span class="kpi-icon" [attr.data-type]="getKpiType(k.name)">
                {{ getKpiIcon(k.name) }}
              </span>
              <h3 class="kpi-title">{{ k.name }}</h3>
            </div>
            <div class="kpi-value">
              <span class="value-primary">{{ formatKpiValue(k.value, k.name) }}</span>
              <div class="kpi-delta" *ngIf="k.delta !== undefined"
                   [class.positive]="k.delta > 0" [class.negative]="k.delta < 0">
                <span class="delta-icon">{{ k.delta > 0 ? '↗' : '↘' }}</span>
                <span class="delta-value">{{ k.delta | number:'1.0-2' }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Net Worth Overview -->
        <section class="overview-card net-worth-card" *ngIf="netWorth">
          <div class="card-header">
            <h2 class="card-title">💎 Net Worth Overview</h2>
            <span class="card-subtitle">Your financial snapshot</span>
          </div>
          <div class="net-worth-summary">
            <div class="net-worth-total">
              <span class="amount">\${{ (netWorth?.current / 100) | number:'1.0-0' }}</span>
              <span class="growth" [class.positive]="netWorthGrowth > 0">
                {{ netWorthGrowth > 0 ? '+' : '' }}\${{ getAbsoluteValue(netWorthGrowth / 100) | number:'1.0-0' }} this month
              </span>
            </div>
            <div class="net-worth-breakdown">
              <div class="breakdown-item assets">
                <span class="label">Assets</span>
                <span class="amount">\${{ ((netWorth?.breakdown?.assets || 0) / 100) | number:'1.0-0' }}</span>
              </div>
              <div class="breakdown-item liabilities">
                <span class="label">Liabilities</span>
                <span class="amount">\${{ ((netWorth?.breakdown?.liabilities || 0) / 100) | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Account Balances -->
        <section class="overview-card accounts-card" *ngIf="accounts">
          <div class="card-header">
            <h2 class="card-title">🏦 Account Balances</h2>
            <span class="card-subtitle">{{ accounts.length }} active accounts</span>
          </div>
          <div class="accounts-list">
            <div class="account-item" *ngFor="let account of accounts.slice(0, 5)">
              <div class="account-info">
                <span class="account-name">{{ account.name }}</span>
                <span class="account-institution">{{ account.institution }}</span>
              </div>
              <div class="account-balance" [class.negative]="account.balanceCents < 0">
                \${{ (account.balanceCents / 100) | number:'1.0-2' }}
              </div>
            </div>
            <a href="/accounts" class="view-all-link">View all accounts →</a>
          </div>
        </section>

        <!-- Monthly Spending Breakdown -->
        <section class="overview-card spending-card" *ngIf="categoryBreakdown">
          <div class="card-header">
            <h2 class="card-title">📊 Spending Breakdown</h2>
            <span class="card-subtitle">This month's categories</span>
          </div>
          <div class="spending-chart">
            <div class="category-item" *ngFor="let category of categoryBreakdown.slice(0, 6)">
              <div class="category-info">
                <span class="category-name">{{ category.category }}</span>
                <span class="category-percentage">{{ category.percentage }}%</span>
              </div>
              <div class="category-bar">
                <div class="bar-fill" [style.width.%]="category.percentage"></div>
              </div>
              <span class="category-amount">\${{ category.amount | number:'1.0-0' }}</span>
            </div>
          </div>
        </section>

        <!-- Recent Transactions -->
        <section class="overview-card transactions-card" *ngIf="recentTransactions">
          <div class="card-header">
            <h2 class="card-title">💳 Recent Transactions</h2>
            <span class="card-subtitle">Last 5 transactions</span>
          </div>
          <div class="transactions-list">
            <div class="transaction-item" *ngFor="let tx of recentTransactions">
              <div class="transaction-icon">{{ getTransactionIcon(tx.category) }}</div>
              <div class="transaction-details">
                <span class="transaction-merchant">{{ tx.merchant || tx.description }}</span>
                <span class="transaction-category">{{ tx.category }}</span>
              </div>
              <div class="transaction-amount" [class.negative]="tx.amountCents < 0" [class.positive]="tx.amountCents > 0">
                \${{ (tx.amountCents / 100) | number:'1.0-2' }}
              </div>
            </div>
            <a href="/transactions" class="view-all-link">View all transactions →</a>
          </div>
        </section>

        <!-- Goals Progress -->
        <section class="overview-card goals-card" *ngIf="goals">
          <div class="card-header">
            <h2 class="card-title">🎯 Goals Progress</h2>
            <span class="card-subtitle">{{ getActiveGoalsCount() }} active goals</span>
          </div>
          <div class="goals-list">
            <div class="goal-item" *ngFor="let goal of goals.slice(0, 3)">
              <div class="goal-info">
                <span class="goal-name">{{ goal.name }}</span>
                <span class="goal-progress">{{ goal.completionPercentage | number:'1.0-1' }}% complete</span>
              </div>
              <div class="goal-bar">
                <div class="bar-fill" [style.width.%]="goal.completionPercentage"
                     [class.completed]="goal.status === 'completed'"></div>
              </div>
              <div class="goal-amounts">
                <span class="current">\${{ (goal.currentCents / 100) | number:'1.0-0' }}</span>
                <span class="target">of \${{ (goal.targetCents / 100) | number:'1.0-0' }}</span>
              </div>
            </div>
            <a href="/profile" class="view-all-link">Manage goals →</a>
          </div>
        </section>

        <!-- Credit Score -->
        <section class="overview-card credit-card" *ngIf="creditScore">
          <div class="card-header">
            <h2 class="card-title">📈 Credit Score</h2>
            <span class="card-subtitle">FICO Score</span>
          </div>
          <div class="credit-score-display">
            <div class="score-circle">
              <div class="score-number">{{ creditScore.current }}</div>
              <div class="score-change" [class.positive]="creditScore.change > 0">
                {{ creditScore.change > 0 ? '+' : '' }}{{ creditScore.change }}
              </div>
            </div>
            <div class="score-factors">
              <div class="factor" *ngFor="let factor of creditScore.factors.slice(0, 3)">
                <span class="factor-name">{{ factor.factor }}</span>
                <span class="factor-impact" [class]="factor.impact.toLowerCase()">
                  {{ factor.impact }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Budget Status -->
        <section class="overview-card budget-card" *ngIf="budgetStatus">
          <div class="card-header">
            <h2 class="card-title">💰 Budget Status</h2>
            <span class="card-subtitle">{{ getBudgetStatusText() }}</span>
          </div>
          <div class="budget-overview">
            <div class="budget-summary">
              <div class="budget-total">
                <span class="spent">\${{ (budgetStatus.totalSpentCents / 100) | number:'1.0-0' }}</span>
                <span class="of">of</span>
                <span class="budget">\${{ (budgetStatus.totalBudgetCents / 100) | number:'1.0-0' }}</span>
              </div>
              <div class="budget-percentage">
                {{ (budgetStatus.totalSpentCents / budgetStatus.totalBudgetCents * 100) | number:'1.0-1' }}% used
              </div>
            </div>
            <div class="budget-categories">
              <div class="category-status" *ngFor="let cat of budgetStatus.categories.slice(0, 4)"
                   [class]="cat.status.replace('_', '-')">
                <span class="category-name">{{ cat.category }}</span>
                <span class="category-used">{{ cat.percentUsed | number:'1.0-0' }}%</span>
              </div>
            </div>
          </div>
          <a href="/budget" class="view-all-link">Manage budget →</a>
        </section>
      </div>

      <ng-template #loading>
        <div class="loading">
          <div class="spinner"></div>
          <span>Loading your financial overview...</span>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: var(--space-2xl);
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--space-sm);
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--text-muted);
      margin: 0;
    }

    .kpi-section {
      margin-bottom: var(--space-2xl);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-lg);
    }

    .kpi-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
      position: relative;
      overflow: hidden;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-gradient);
      transform: scaleX(0);
      transition: transform var(--transition-base);
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .kpi-card:hover::before {
      transform: scaleX(1);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: var(--bg-tertiary);
    }

    .kpi-icon[data-type="balance"] { background: linear-gradient(135deg, #10b981, #059669); }
    .kpi-icon[data-type="income"] { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .kpi-icon[data-type="expenses"] { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .kpi-icon[data-type="savings"] { background: linear-gradient(135deg, #f59e0b, #d97706); }

    .kpi-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .kpi-value {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }

    .value-primary {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .kpi-delta {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .kpi-delta.positive {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success-500);
    }

    .kpi-delta.negative {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error-500);
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-lg);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-md);
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-xl);
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: var(--text-primary);
      transition: all var(--transition-base);
      text-align: center;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary-500);
    }

    .action-icon {
      font-size: 2rem;
      margin-bottom: var(--space-sm);
    }

    .action-title {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .action-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .net-worth-card {
        grid-column: span 1;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .budget-categories {
        grid-template-columns: 1fr;
      }

      .net-worth-breakdown {
        grid-template-columns: 1fr;
      }
    }

    /* Additional styles for financial overview components */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }

    .overview-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
    }

    .overview-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-lg);
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .card-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .net-worth-card {
      grid-column: span 2;
    }

    .net-worth-summary {
      text-align: center;
    }

    .net-worth-total .amount {
      display: block;
      font-size: 3rem;
      font-weight: 700;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    .net-worth-total .growth {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-top: var(--space-sm);
    }

    .net-worth-total .growth.positive {
      color: var(--success-color);
    }

    .net-worth-breakdown {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-lg);
      margin-top: var(--space-lg);
    }

    .breakdown-item {
      padding: var(--space-md);
      border-radius: var(--radius-md);
      text-align: center;
      border: 1px solid var(--border-light);
    }

    .breakdown-item.assets {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
      border-color: var(--success-color);
    }

    .breakdown-item.liabilities {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
      border-color: var(--warning-color);
    }

    .breakdown-item .label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
    }

    .breakdown-item .amount {
      display: block;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .accounts-list, .transactions-list, .goals-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .account-item, .transaction-item, .goal-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-md);
      background: var(--bg-tertiary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      transition: all var(--transition-base);
    }

    .account-item:hover, .transaction-item:hover, .goal-item:hover {
      background: var(--bg-secondary);
      transform: translateX(4px);
    }

    .account-info, .transaction-details, .goal-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .account-name, .transaction-merchant, .goal-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .account-institution, .transaction-category, .goal-progress {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .account-balance, .transaction-amount {
      font-weight: 600;
      color: var(--text-primary);
    }

    .account-balance.negative, .transaction-amount.negative {
      color: var(--danger-color);
    }

    .transaction-amount.positive {
      color: var(--success-color);
    }

    .transaction-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: var(--space-md);
      align-items: center;
    }

    .transaction-icon {
      font-size: 1.25rem;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-gradient);
      border-radius: var(--radius-md);
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--primary-color);
      text-decoration: none;
      padding: var(--space-sm) 0;
      transition: color var(--transition-base);
      margin-top: var(--space-md);
    }

    .view-all-link:hover {
      color: var(--primary-color-dark);
    }
  `]
})
export default class DashboardPage implements OnInit {
  private api = inject(AnalyticsApi);
  private mockDataService = inject(MockDataService);

  kpis$ = signal<Kpi[]>([]);

  // Financial overview data
  netWorth: any;
  netWorthGrowth = 0;
  accounts: any[] = [];
  categoryBreakdown: any[] = [];
  recentTransactions: any[] = [];
  goals: any[] = [];
  creditScore: any;
  budgetStatus: any;

  ngOnInit() {
    this.loadKpis();
    this.loadFinancialData();
  }

  private loadKpis(): void {
    const kpis: Kpi[] = [
      { name: 'Total Balance', value: 125430.50, delta: 2.3 },
      { name: 'Monthly Income', value: 8500.00, delta: 1.2 },
      { name: 'Monthly Expenses', value: 3420.75, delta: -0.8 },
      { name: 'Savings Rate', value: 60.2, delta: 3.1 }
    ];
    this.kpis$.set(kpis);
  }

  private loadFinancialData(): void {
    // Load comprehensive financial data using the correct paths from finance_mock.json
    this.mockDataService.getMockData<any>('analytics.netWorth').subscribe(data => {
      this.netWorth = data;
      this.netWorthGrowth = data?.growth?.amount || 0;
    });

    this.mockDataService.getMockData<any[]>('accounts').subscribe(accounts => {
      this.accounts = accounts || [];
    });

    this.mockDataService.getMockData<any[]>('transactions.recent').subscribe(transactions => {
      this.recentTransactions = (transactions || []).slice(0, 5);
      // Calculate category breakdown from these transactions
      this.calculateCategoryBreakdown(transactions || []);
    });

    this.mockDataService.getMockData<any[]>('goals').subscribe(goals => {
      this.goals = goals || [];
    });

    this.mockDataService.getMockData<any>('analytics.creditScore').subscribe(creditScore => {
      this.creditScore = creditScore;
    });

    this.mockDataService.getMockData<any>('budget').subscribe(budget => {
      this.budgetStatus = budget;
    });
  }

  private calculateCategoryBreakdown(transactions: any[]): void {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter((tx: any) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() + 1 === currentMonth &&
             txDate.getFullYear() === currentYear &&
             tx.amountCents < 0; // Only expenses
    });

    const categoryTotals = monthlyTransactions.reduce((acc: Record<string, number>, tx: any) => {
      const category = tx.category;
      acc[category] = (acc[category] || 0) + Math.abs(tx.amountCents);
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum: number, amount: number) => sum + amount, 0);

    this.categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: (amount as number) / 100,
        percentage: Math.round(((amount as number) / total) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  trackByKpi(index: number, kpi: any) {
    return kpi.name;
  }

  getKpiIcon(name: string): string {
    const icons: Record<string, string> = {
      'Total Balance': '💰',
      'Monthly Income': '📈',
      'Monthly Expenses': '📉',
      'Savings Rate': '🎯'
    };
    return icons[name] || '📊';
  }

  getKpiType(name: string): string {
    if (name.includes('Balance')) return 'balance';
    if (name.includes('Income')) return 'income';
    if (name.includes('Expenses')) return 'expenses';
    if (name.includes('Savings')) return 'savings';
    return 'default';
  }

  formatKpiValue(value: number, name: string): string {
    if (name.includes('Rate') || name.includes('%')) {
      return `${value.toFixed(1)}%`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getTransactionIcon(category: string): string {
    const icons: Record<string, string> = {
      'Food & Dining': '🍽️',
      'Shopping': '🛒',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Health & Medical': '🏥',
      'Bills & Utilities': '💡',
      'Travel': '✈️',
      'Education': '📚',
      'Investment': '📈',
      'Salary': '💰',
      'Gas': '⛽',
      'Groceries': '🛒'
    };
    return icons[category] || '💳';
  }

  getActiveGoalsCount(): number {
    return this.goals?.filter(goal => goal.status === 'active').length || 0;
  }

  getBudgetStatusText(): string {
    if (!this.budgetStatus) return '';
    const percentage = (this.budgetStatus.totalSpentCents / this.budgetStatus.totalBudgetCents) * 100;
    if (percentage > 90) return 'Over budget alert';
    if (percentage > 80) return 'Approaching limit';
    return 'On track this month';
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }
}
