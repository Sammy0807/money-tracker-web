export type UUID = string;

export interface User {
  id: UUID;
  email: string;
  name?: string;
  locale?: string;
  currency?: string;
  timezone?: string;
  featureFlagsJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: UUID;
  userId: UUID; // owner reference
  name: string;
  institution?: string;
  type: 'CASH'|'CHECKING'|'SAVINGS'|'CREDIT'|'LOAN'|'INVESTMENT'|'OTHER';
  currency: string;
  balanceCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: UUID;
  accountId: UUID;
  amountCents: number;
  currency: string;
  merchant?: string;
  category?: string;
  occurredAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  month: string;        // YYYY-MM
  incomeCents: number;
  expenseCents: number;
  savingsRate: number;  // 0..1
}

export interface AnalyticsKpi {
  name: string;
  value: number;
  delta?: number;
}

export interface Rule {
  id: UUID;
  name: string;
  predicate: string;    // DSL or JSON
  action: string;       // e.g. "categorize:Groceries"
  active: boolean;
}
