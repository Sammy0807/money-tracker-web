import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { AnalyticsApi } from '../../core/api/analytics.api';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, AsyncPipe, DecimalPipe],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back! Here's what's happening with your finances.</p>
      </header>

      <section *ngIf="kpis$ | async as kpis; else loading" class="kpi-section">
        <div class="kpi-grid">
          <div class="kpi-card" *ngFor="let k of kpis; trackBy: trackByKpi">
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

      <section class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <a href="/transactions" class="action-card">
            <span class="action-icon">💳</span>
            <span class="action-title">View Transactions</span>
            <span class="action-subtitle">Latest activity</span>
          </a>
          <a href="/budget" class="action-card">
            <span class="action-icon">💰</span>
            <span class="action-title">Manage Budget</span>
            <span class="action-subtitle">Track spending</span>
          </a>
          <a href="/analytics" class="action-card">
            <span class="action-icon">📈</span>
            <span class="action-title">View Analytics</span>
            <span class="action-subtitle">Financial insights</span>
          </a>
          <a href="/import" class="action-card">
            <span class="action-icon">📥</span>
            <span class="action-title">Import Data</span>
            <span class="action-subtitle">Upload transactions</span>
          </a>
        </div>
      </section>

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
      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export default class DashboardPage implements OnInit {
  private api = inject(AnalyticsApi);
  kpis$ = this.api.kpis();

  ngOnInit() {
    // Could prefetch more data here
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
}
