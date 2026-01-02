export interface DashboardMetrics {
  mrr: number;
  activeSubscriptions: number;
  failedPaymentsCount: number;
  churnRate: number;
  revenueHistory: RevenueDataPoint[];
}

export interface RevenueDataPoint {
  date: string;
  amount: number;
}

export interface Alert {
  id: string;
  type: "payment_failed" | "subscription_at_risk" | "churn";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  customerId: number;
  createdAt: string;
  resolved: boolean;
}
