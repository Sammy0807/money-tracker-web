import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsApi } from '../../core/api/analytics.api';
import { MockDataService } from '../../core/api/mock-loader';

@Component({
  standalone: true,
  selector: 'app-analytics',
  imports: [NgFor, NgIf, DecimalPipe, TitleCasePipe, FormsModule],
  template: `
    <div class="analytics-container">
      <header class="page-header">
        <h1 class="page-title">Financial Analytics</h1>
        <p class="page-subtitle">Deep insights into your financial patterns and trends</p>
        <button class="refresh-btn" (click)="refresh()">
          <span class="refresh-icon">🔄</span>
          Refresh Data
        </button>
      </header>

      <!-- KPI Dashboard -->
      <section class="kpi-dashboard">
        <h2 class="section-title">📊 Key Performance Indicators</h2>
        <div class="kpi-grid" *ngIf="kpis">
          <div class="kpi-card" *ngFor="let kpi of kpis" [attr.data-trend]="kpi.trend">
            <div class="kpi-header">
              <h3 class="kpi-name">{{ kpi.name }}</h3>
              <span class="kpi-period">{{ kpi.period }}</span>
            </div>
            <div class="kpi-value">
              <span class="value">{{ formatKpiValue(kpi) }}</span>
              <div class="kpi-delta" [class]="kpi.trend" *ngIf="kpi.delta !== undefined">
                <span class="delta-icon">{{ getDeltaIcon(kpi.trend) }}</span>
                <span class="delta-value">{{ kpi.delta | number:'1.1-1' }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Monthly Trends Chart -->
        <section class="chart-card trends-card">
          <div class="chart-header">
            <h2 class="chart-title">📈 Monthly Trends</h2>
            <div class="chart-controls">
              <select class="metric-selector" [(ngModel)]="selectedMetric" (change)="onMetricChange()">
                <option value="netWorth">Net Worth</option>
                <option value="income">Income</option>
                <option value="expenses">Expenses</option>
                <option value="savings">Savings</option>
              </select>
            </div>
          </div>
          <div class="chart-content" *ngIf="monthlyTrends">
            <div class="trend-chart">
              <div class="trend-bars">
                <div class="trend-bar" *ngFor="let month of monthlyTrends; let i = index">
                  <div class="bar-container">
                    <div class="bar"
                         [style.height.%]="getBarHeight(month, selectedMetric)"
                         [class]="getBarClass(selectedMetric)">
                    </div>
                    <span class="bar-value">\${{ getMetricValue(month, selectedMetric) | number:'1.0-0' }}</span>
                  </div>
                  <span class="month-label">{{ formatMonth(month.month) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Category Breakdown -->
        <section class="chart-card category-card">
          <div class="chart-header">
            <h2 class="chart-title">🥧 Spending by Category</h2>
            <span class="chart-subtitle">Current month breakdown</span>
          </div>
          <div class="chart-content" *ngIf="categoryBreakdown">
            <div class="category-chart">
              <div class="category-list">
                <div class="category-item" *ngFor="let category of categoryBreakdown.slice(0, 8)">
                  <div class="category-info">
                    <span class="category-icon">{{ getCategoryIcon(category.category) }}</span>
                    <div class="category-details">
                      <span class="category-name">{{ category.category }}</span>
                      <span class="category-trend" [class]="category.trend">{{ category.trend }}</span>
                    </div>
                  </div>
                  <div class="category-metrics">
                    <span class="category-amount">\${{ category.amount | number:'1.0-0' }}</span>
                    <span class="category-percentage">{{ category.percentage | number:'1.1-1' }}%</span>
                  </div>
                  <div class="category-bar">
                    <div class="bar-fill" [style.width.%]="category.percentage"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Income Streams -->
        <section class="chart-card income-card">
          <div class="chart-header">
            <h2 class="chart-title">💰 Income Sources</h2>
            <span class="chart-subtitle">Revenue diversification</span>
          </div>
          <div class="chart-content" *ngIf="incomeStreams">
            <div class="income-chart">
              <div class="income-summary">
                <div class="total-income">
                  <span class="amount">\${{ getTotalIncome() | number:'1.0-0' }}</span>
                  <span class="label">Total Monthly Income</span>
                </div>
              </div>
              <div class="income-sources">
                <div class="income-item" *ngFor="let source of incomeStreams">
                  <div class="source-info">
                    <span class="source-icon">{{ getIncomeIcon(source.type) }}</span>
                    <div class="source-details">
                      <span class="source-name">{{ source.source }}</span>
                      <span class="source-type">{{ source.type | titlecase }}</span>
                    </div>
                  </div>
                  <div class="source-metrics">
                    <span class="source-amount">\${{ source.amount | number:'1.0-0' }}</span>
                    <span class="source-percentage">{{ source.percentage | number:'1.1-1' }}%</span>
                  </div>
                  <div class="income-bar">
                    <div class="bar-fill" [style.width.%]="source.percentage" [attr.data-type]="source.type"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Savings Analysis -->
        <section class="chart-card savings-card">
          <div class="chart-header">
            <h2 class="chart-title">🎯 Savings Analysis</h2>
            <span class="chart-subtitle">Progress toward financial goals</span>
          </div>
          <div class="chart-content">
            <div class="savings-metrics">
              <div class="metric-item">
                <span class="metric-label">Average Savings Rate</span>
                <span class="metric-value">{{ getAverageSavingsRate() | number:'1.1-1' }}%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Monthly Savings</span>
                <span class="metric-value">\${{ getAverageSavings() | number:'1.0-0' }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Savings Trend</span>
                <span class="metric-value trend" [class]="getSavingsTrend()">{{ getSavingsTrend() | titlecase }}</span>
              </div>
            </div>
            <div class="savings-chart" *ngIf="monthlyTrends">
              <div class="savings-bars">
                <div class="savings-month" *ngFor="let month of monthlyTrends.slice(-6)">
                  <div class="savings-bar">
                    <div class="income-portion" [style.height.%]="(month.income / getMaxIncome()) * 100"></div>
                    <div class="expense-portion" [style.height.%]="(month.expenses / getMaxIncome()) * 100"></div>
                    <div class="savings-portion" [style.height.%]="(month.savings / getMaxIncome()) * 100"></div>
                  </div>
                  <span class="month-label">{{ formatMonth(month.month) }}</span>
                </div>
              </div>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-color income"></span>
                  <span class="legend-label">Income</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color expenses"></span>
                  <span class="legend-label">Expenses</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color savings"></span>
                  <span class="legend-label">Savings</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Net Worth Progression -->
        <section class="chart-card networth-card">
          <div class="chart-header">
            <h2 class="chart-title">📊 Net Worth Growth</h2>
            <span class="chart-subtitle">Financial health over time</span>
          </div>
          <div class="chart-content" *ngIf="monthlyTrends">
            <div class="networth-chart">
              <div class="growth-visualization">
                <div class="networth-line">
                  <div class="networth-point"
                       *ngFor="let month of monthlyTrends; let i = index"
                       [style.left.%]="(i / (monthlyTrends.length - 1)) * 100"
                       [style.bottom.%]="((month.netWorth - getMinNetWorth()) / (getMaxNetWorth() - getMinNetWorth())) * 100"
                       [title]="formatMonth(month.month) + ': $' + (month.netWorth | number:'1.0-0')">
                  </div>
                </div>
              </div>
              <div class="networth-stats">
                <div class="stat-item">
                  <span class="stat-label">Current</span>
                  <span class="stat-value">\${{ getCurrentNetWorth() | number:'1.0-0' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Growth</span>
                  <span class="stat-value positive">\${{ getNetWorthGrowth() | number:'1.0-0' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Rate</span>
                  <span class="stat-value">{{ getNetWorthGrowthRate() | number:'1.1-1' }}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="!kpis || !monthlyTrends">
        <div class="spinner"></div>
        <span>Loading analytics data...</span>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-lg);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-2xl);
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }

    .page-subtitle {
      font-size: 1.125rem;
      color: var(--text-secondary);
      margin: var(--space-sm) 0 0 0;
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

    .refresh-icon {
      font-size: 1rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-lg);
    }

    /* KPI Dashboard */
    .kpi-dashboard {
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
    }

    .kpi-card[data-trend="up"]::before {
      background: var(--success-gradient);
    }

    .kpi-card[data-trend="down"]::before {
      background: var(--danger-gradient);
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-lg);
    }

    .kpi-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .kpi-period {
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: var(--bg-tertiary);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }

    .kpi-value {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .kpi-value .value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .kpi-delta {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.875rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
    }

    .kpi-delta.up {
      color: var(--success-color);
      background: var(--success-bg);
    }

    .kpi-delta.down {
      color: var(--danger-color);
      background: var(--danger-bg);
    }

    .kpi-delta.stable {
      color: var(--warning-color);
      background: var(--warning-bg);
    }

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: var(--space-xl);
      margin-bottom: var(--space-2xl);
    }

    .chart-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      transition: all var(--transition-base);
    }

    .chart-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-lg);
    }

    .chart-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .chart-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .chart-controls {
      display: flex;
      gap: var(--space-md);
    }

    .metric-selector {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    /* Specific Chart Styles */
    .trends-card {
      grid-column: span 2;
    }

    .trend-chart {
      height: 250px;
      position: relative;
    }

    .trend-bars {
      display: flex;
      justify-content: space-between;
      align-items: end;
      height: 200px;
      gap: var(--space-sm);
    }

    .trend-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      gap: var(--space-sm);
    }

    .bar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 150px;
      justify-content: flex-end;
      gap: var(--space-xs);
    }

    .bar {
      width: 100%;
      min-height: 4px;
      border-radius: var(--radius-sm);
      transition: all var(--transition-base);
    }

    .networth-bar {
      background: var(--accent-gradient);
    }

    .income-bar {
      background: var(--success-gradient);
    }

    .expense-bar {
      background: var(--danger-gradient);
    }

    .savings-bar {
      background: var(--primary-gradient);
    }

    .bar-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .month-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-align: center;
    }

    /* Category Chart */
    .category-chart {
      max-height: 350px;
      overflow-y: auto;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .category-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-md);
      align-items: center;
      padding: var(--space-md);
      background: var(--bg-tertiary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      transition: all var(--transition-base);
    }

    .category-item:hover {
      background: var(--bg-secondary);
      transform: translateX(4px);
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .category-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-gradient);
      border-radius: var(--radius-md);
    }

    .category-details {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .category-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .category-trend {
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      font-weight: 500;
    }

    .category-trend.up {
      background: var(--danger-bg);
      color: var(--danger-color);
    }

    .category-trend.down {
      background: var(--success-bg);
      color: var(--success-color);
    }

    .category-trend.stable {
      background: var(--warning-bg);
      color: var(--warning-color);
    }

    .category-metrics {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-xs);
    }

    .category-amount {
      font-weight: 600;
      color: var(--text-primary);
    }

    .category-percentage {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .category-bar {
      grid-column: span 2;
      height: 6px;
      background: var(--border-light);
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-top: var(--space-sm);
    }

    .bar-fill {
      height: 100%;
      background: var(--primary-gradient);
      transition: width 0.3s ease;
    }

    /* Income Chart */
    .income-chart {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .income-summary {
      text-align: center;
      padding: var(--space-lg);
      background: var(--bg-tertiary);
      border-radius: var(--radius-lg);
    }

    .total-income .amount {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      background: var(--success-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .total-income .label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .income-sources {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .income-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-md);
      align-items: center;
      padding: var(--space-md);
      background: var(--bg-tertiary);
      border-radius: var(--radius-lg);
      transition: all var(--transition-base);
    }

    .income-item:hover {
      background: var(--bg-secondary);
    }

    .source-info {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .source-icon {
      font-size: 1.25rem;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--success-gradient);
      border-radius: var(--radius-md);
    }

    .source-details {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .source-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .source-type {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .source-metrics {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-xs);
    }

    .source-amount {
      font-weight: 600;
      color: var(--text-primary);
    }

    .source-percentage {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .income-bar {
      grid-column: span 2;
      height: 6px;
      background: var(--border-light);
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-top: var(--space-sm);
    }

    .income-bar .bar-fill[data-type="salary"] {
      background: var(--primary-gradient);
    }

    .income-bar .bar-fill[data-type="freelance"] {
      background: var(--accent-gradient);
    }

    .income-bar .bar-fill[data-type="investment"] {
      background: var(--success-gradient);
    }

    .income-bar .bar-fill[data-type="business"] {
      background: var(--warning-gradient);
    }

    /* Savings Analysis */
    .savings-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-lg);
      margin-bottom: var(--space-lg);
    }

    .metric-item {
      text-align: center;
      padding: var(--space-md);
      background: var(--bg-tertiary);
      border-radius: var(--radius-lg);
    }

    .metric-label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
    }

    .metric-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .metric-value.trend.up {
      color: var(--success-color);
    }

    .metric-value.trend.down {
      color: var(--danger-color);
    }

    .savings-chart {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .savings-bars {
      display: flex;
      justify-content: space-between;
      align-items: end;
      height: 120px;
      gap: var(--space-sm);
    }

    .savings-month {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      gap: var(--space-sm);
    }

    .savings-bar {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      width: 100%;
      height: 80px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border-light);
    }

    .income-portion {
      background: var(--success-color);
      opacity: 0.3;
    }

    .expense-portion {
      background: var(--danger-color);
      opacity: 0.6;
    }

    .savings-portion {
      background: var(--primary-color);
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: var(--space-lg);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: var(--radius-sm);
    }

    .legend-color.income {
      background: var(--success-color);
      opacity: 0.3;
    }

    .legend-color.expenses {
      background: var(--danger-color);
      opacity: 0.6;
    }

    .legend-color.savings {
      background: var(--primary-color);
    }

    .legend-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    /* Net Worth Chart */
    .networth-chart {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .growth-visualization {
      height: 120px;
      position: relative;
      background: var(--bg-tertiary);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .networth-line {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .networth-point {
      position: absolute;
      width: 8px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 50%;
      transform: translate(-50%, 50%);
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .networth-point:hover {
      width: 12px;
      height: 12px;
      background: var(--accent-color);
    }

    .networth-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-lg);
    }

    .stat-item {
      text-align: center;
      padding: var(--space-md);
      background: var(--bg-tertiary);
      border-radius: var(--radius-lg);
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
    }

    .stat-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .stat-value.positive {
      color: var(--success-color);
    }

    /* Loading State */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-2xl);
      color: var(--text-secondary);
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-light);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }

      .trends-card {
        grid-column: span 1;
      }
    }

    @media (max-width: 768px) {
      .analytics-container {
        padding: var(--space-md);
      }

      .page-header {
        flex-direction: column;
        gap: var(--space-md);
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }

      .savings-metrics {
        grid-template-columns: 1fr;
      }

      .networth-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export default class AnalyticsPage implements OnInit, OnDestroy {
  private api = inject(AnalyticsApi);
  private mockDataService = inject(MockDataService);

  // Data properties
  kpis: any[] = [];
  monthlyTrends: any[] = [];
  categoryBreakdown: any[] = [];
  incomeStreams: any[] = [];

  // UI state
  selectedMetric = 'netWorth';

  // Subscriptions
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
}
