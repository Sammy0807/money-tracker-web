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
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
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
