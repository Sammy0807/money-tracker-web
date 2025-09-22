import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountsApi } from '../../core/api/accounts.api';

@Component({
  standalone: true,
  selector: 'app-accounts',
  imports: [NgFor, NgIf, CurrencyPipe, DecimalPipe, TitleCasePipe, FormsModule],
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss']
})
export default class AccountsPage implements OnInit, OnDestroy {
  api = inject(AccountsApi);

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
