export interface DashboardMetrics {
  mrr: number
  activeSubscriptions: number
  failedPaymentsCount: number
  churnRate: number
  mrrGrowth: number
}

export interface RevenueDataPoint {
  date: string
  amount: number
}

export interface Alert {
  id: string
  type: 'payment_failed' | 'subscription_at_risk' | 'churn'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  customerId: string
  createdAt: string
  resolved: boolean
}