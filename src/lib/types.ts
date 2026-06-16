/**
 * Canonical customer record used throughout the dashboard.
 * Mirrors the well-known "Bank Customer Churn" dataset schema
 * (Churn_Modelling.csv) so real-world uploads work out of the box.
 */
export interface Customer {
  customerId: string;
  surname: string;
  creditScore: number;
  geography: string;
  gender: string;
  age: number;
  tenure: number;
  balance: number;
  numOfProducts: number;
  hasCrCard: number; // 0 | 1
  isActiveMember: number; // 0 | 1
  estimatedSalary: number;
  /** Ground-truth label: 1 = churned (exited), 0 = retained. */
  exited: number;
}

/** A customer enriched with the model's risk score and prediction. */
export interface ScoredCustomer extends Customer {
  riskScore: number; // 0..1 probability of churn
  predicted: number; // 0 | 1
  riskBand: "Low" | "Medium" | "High";
}

export interface ConfusionMatrix {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  specificity: number;
  auc: number;
  confusion: ConfusionMatrix;
}

export interface DatasetMetrics {
  totalCustomers: number;
  churnedCustomers: number;
  retainedCustomers: number;
  churnRate: number;
  avgBalance: number;
  avgCreditScore: number;
  avgAge: number;
  avgTenure: number;
  activeMembers: number;
  highRiskCount: number;
  estimatedRevenueAtRisk: number;
}

export interface BreakdownRow {
  label: string;
  total: number;
  churned: number;
  churnRate: number;
}
