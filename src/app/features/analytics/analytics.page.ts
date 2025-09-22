import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsApi } from '../../core/api/analytics.api';
import { MockDataService } from '../../core/api/mock-loader';

@Component({
  standalone: true,
  selector: 'app-analytics',
  imports: [NgFor, NgIf, DecimalPipe, TitleCasePipe, FormsModule],
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss']
})
export default class AnalyticsPage implements OnInit, OnDestroy {
  private api = inject(AnalyticsApi);
  private mockDataService = inject(MockDataService);

  // Data properties
  kpis: any[] = [];
  monthlyTrends: any[] = [];
  categoryBreakdown: any[] = [];
  incomeStreams: any[] = [];
  cashFlowData: any[] = [];
  investmentData: any[] = [];
  budgetVariance: any[] = [];
  financialRatios: any = {};

  // UI state
  selectedMetric = 'netWorth';  // Subscriptions
  private subscriptions: any[] = [];

  ngOnInit() {
    this.refresh();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub?.unsubscribe());
  }

  refresh() {
    // Unsubscribe from previous subscriptions
    this.subscriptions.forEach(sub => sub?.unsubscribe());
    this.subscriptions = [];

    // Load data from mock service
    this.subscriptions.push(
      this.mockDataService.getMockData<any[]>('analytics.kpis').subscribe(data => {
        this.kpis = data || [];
      })
    );

    this.subscriptions.push(
      this.mockDataService.getMockData<any[]>('analytics.monthlyTrends').subscribe(data => {
        this.monthlyTrends = data || [];
      })
    );

    this.subscriptions.push(
      this.mockDataService.getMockData<any[]>('analytics.categoryBreakdown').subscribe(data => {
        this.categoryBreakdown = data || [];
      })
    );

    this.subscriptions.push(
      this.mockDataService.getMockData<any[]>('analytics.incomeStreams').subscribe(data => {
        this.incomeStreams = data || [];
      })
    );

    // Load advanced analytics data
    this.subscriptions.push(
      this.mockDataService.getMockData<any[]>('analytics.advancedMetrics.cashFlowAnalysis').subscribe(data => {
        this.cashFlowData = data || [];
      })
    );

    this.subscriptions.push(
      this.mockDataService.getMockData<any[]>('analytics.advancedMetrics.investmentPerformance').subscribe(data => {
        this.investmentData = data || [];
      })
    );

    this.subscriptions.push(
      this.mockDataService.getMockData<any[]>('analytics.advancedMetrics.budgetVariance').subscribe(data => {
        this.budgetVariance = data || [];
      })
    );

    this.subscriptions.push(
      this.mockDataService.getMockData<any>('analytics.advancedMetrics.financialRatios').subscribe(data => {
        this.financialRatios = data || {};
      })
    );
  }

  // KPI Methods
  formatKpiValue(kpi: any): string {
    if (kpi.name.includes('Rate') || kpi.name.includes('Ratio')) {
      return `${kpi.value.toFixed(1)}%`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(kpi.value);
  }

  getDeltaIcon(trend: string): string {
    const icons = {
      'up': '↗️',
      'down': '↘️',
      'stable': '→'
    };
    return icons[trend as keyof typeof icons] || '→';
  }

  // Chart Methods
  onMetricChange(): void {
    // Trigger any additional logic when metric changes
  }

  getBarHeight(month: any, metric: string): number {
    const maxValue = this.getMaxValue(metric);
    const value = this.getMetricValue(month, metric);
    return (value / maxValue) * 100;
  }

  getBarClass(metric: string): string {
    const classes = {
      'netWorth': 'networth-bar',
      'income': 'income-bar',
      'expenses': 'expense-bar',
      'savings': 'savings-bar'
    };
    return classes[metric as keyof typeof classes] || 'default-bar';
  }

  getMetricValue(month: any, metric: string): number {
    return month[metric] || 0;
  }

  getMaxValue(metric: string): number {
    if (!this.monthlyTrends.length) return 1;
    return Math.max(...this.monthlyTrends.map(m => this.getMetricValue(m, metric)));
  }

  formatMonth(monthStr: string): string {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  // Category Methods
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Housing': '🏠',
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Utilities': '💡',
      'Healthcare': '🏥',
      'Entertainment': '🎬',
      'Shopping': '🛒',
      'Insurance': '🛡️',
      'Debt Payments': '💳',
      'Miscellaneous': '📦'
    };
    return icons[category] || '💰';
  }

  // Income Methods
  getTotalIncome(): number {
    return this.incomeStreams.reduce((total, stream) => total + stream.amount, 0);
  }

  getIncomeIcon(type: string): string {
    const icons: Record<string, string> = {
      'salary': '💼',
      'freelance': '💻',
      'investment': '📈',
      'business': '🏢'
    };
    return icons[type] || '💰';
  }

  // Savings Methods
  getAverageSavingsRate(): number {
    if (!this.monthlyTrends.length) return 0;
    const rates = this.monthlyTrends.map(m => (m.savings / m.income) * 100);
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  }

  getAverageSavings(): number {
    if (!this.monthlyTrends.length) return 0;
    const totalSavings = this.monthlyTrends.reduce((sum, m) => sum + m.savings, 0);
    return totalSavings / this.monthlyTrends.length;
  }

  getSavingsTrend(): string {
    if (this.monthlyTrends.length < 2) return 'stable';
    const recent = this.monthlyTrends.slice(-3);
    const older = this.monthlyTrends.slice(-6, -3);

    const recentAvg = recent.reduce((sum, m) => sum + m.savings, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.savings, 0) / older.length;

    if (recentAvg > olderAvg * 1.05) return 'up';
    if (recentAvg < olderAvg * 0.95) return 'down';
    return 'stable';
  }

  getMaxIncome(): number {
    if (!this.monthlyTrends.length) return 1;
    return Math.max(...this.monthlyTrends.map(m => m.income));
  }

  // Net Worth Methods
  getCurrentNetWorth(): number {
    if (!this.monthlyTrends.length) return 0;
    return this.monthlyTrends[this.monthlyTrends.length - 1].netWorth;
  }

  getNetWorthGrowth(): number {
    if (this.monthlyTrends.length < 2) return 0;
    const current = this.getCurrentNetWorth();
    const previous = this.monthlyTrends[0].netWorth;
    return current - previous;
  }

  getNetWorthGrowthRate(): number {
    if (this.monthlyTrends.length < 2) return 0;
    const current = this.getCurrentNetWorth();
    const previous = this.monthlyTrends[0].netWorth;
    return ((current - previous) / previous) * 100;
  }

  getMinNetWorth(): number {
    if (!this.monthlyTrends.length) return 0;
    return Math.min(...this.monthlyTrends.map(m => m.netWorth));
  }

  getMaxNetWorth(): number {
    if (!this.monthlyTrends.length) return 1;
    return Math.max(...this.monthlyTrends.map(m => m.netWorth));
  }

  // Cash Flow Methods
  getAverageCashFlow(metric: string): number {
    if (!this.cashFlowData.length) return 0;
    const total = this.cashFlowData.reduce((sum, item) => sum + (item[metric] || 0), 0);
    return total / this.cashFlowData.length;
  }

  getMaxCashFlow(): number {
    if (!this.cashFlowData.length) return 1;
    const maxInflow = Math.max(...this.cashFlowData.map(m => m.inflow));
    const maxOutflow = Math.max(...this.cashFlowData.map(m => m.outflow));
    return Math.max(maxInflow, maxOutflow);
  }

  // Investment Methods
  getTotalPortfolioValue(): number {
    return this.investmentData.reduce((total, asset) => total + asset.value, 0);
  }

  getTotalGainLoss(): number {
    return this.investmentData.reduce((total, asset) => total + asset.gainLoss, 0);
  }

  // Budget Variance Methods
  getCategoriesOverBudget(): number {
    return this.budgetVariance.filter(item => item.variance > 0).length;
  }

  getCategoriesUnderBudget(): number {
    return this.budgetVariance.filter(item => item.variance < 0).length;
  }

  getTotalVariance(): number {
    return this.budgetVariance.reduce((total, item) => total + item.variance, 0);
  }

  // Financial Ratios Methods
  getFormattedRatios(): any[] {
    const ratioDefinitions = [
      { key: 'currentRatio', name: 'Current Ratio', benchmark: '2.0+', target: 2.0 },
      { key: 'debtToIncomeRatio', name: 'Debt-to-Income', benchmark: '<36%', target: 36, isPercentage: true, reverse: true },
      { key: 'savingsRate', name: 'Savings Rate', benchmark: '20%+', target: 20, isPercentage: true },
      { key: 'emergencyFundMonths', name: 'Emergency Fund', benchmark: '6+ months', target: 6 },
      { key: 'investmentRatio', name: 'Investment Ratio', benchmark: '15%+', target: 15, isPercentage: true },
      { key: 'netWorthGrowthRate', name: 'Net Worth Growth', benchmark: '7%+', target: 7, isPercentage: true }
    ];

    return ratioDefinitions.map(def => {
      const value = this.financialRatios[def.key] || 0;
      const percentage = def.reverse
        ? Math.max(0, 100 - (value / def.target) * 100)
        : (value / def.target) * 100;

      let status = 'poor';
      if (def.reverse) {
        if (value <= def.target * 0.8) status = 'excellent';
        else if (value <= def.target) status = 'good';
        else if (value <= def.target * 1.2) status = 'fair';
      } else {
        if (value >= def.target) status = 'excellent';
        else if (value >= def.target * 0.8) status = 'good';
        else if (value >= def.target * 0.6) status = 'fair';
      }

      return {
        name: def.name,
        value: value,
        displayValue: def.isPercentage ? `${value.toFixed(1)}%` : value.toFixed(1),
        benchmark: def.benchmark,
        percentage: Math.min(100, percentage),
        status: status
      };
    });
  }
}
