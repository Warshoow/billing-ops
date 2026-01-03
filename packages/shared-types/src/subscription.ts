export interface Subscription {
  id: string
  customerId: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string
  planAmount: number
  currency: string
  createdAt: string
  updatedAt: string
}

export type SubscriptionStatus = Subscription['status']