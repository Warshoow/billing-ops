// === Request types ===

export interface CreateCustomerRequest {
  externalUserId: string
  email: string
  name?: string
}

export interface CreateSubscriptionRequest {
  externalUserId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}

export interface CancelSubscriptionRequest {
  externalUserId: string
  subscriptionId?: string
  cancelAtPeriodEnd?: boolean
}

export interface RetryPaymentRequest {
  paymentIntentId: string
}

// === Response types ===

export interface BillingCustomerResponse {
  customerId: string
  externalUserId: string
  email: string
  stripeCustomerId: string
}

export interface BillingSubscriptionResponse {
  sessionId: string
  url: string | null
}

export interface BillingCancelResponse {
  stripeSubscriptionId: string
  status: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string
}

export interface BillingRetryResponse {
  paymentIntentId: string
  status: string
  amount: number
  currency: string
}

// === Error response ===

export interface BillingErrorResponse {
  error: string
  message: string
}
