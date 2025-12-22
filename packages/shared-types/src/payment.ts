export interface Payment {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending'
  customerId: number
  stripePaymentId: string
  createdAt: string
  updatedAt: string
}

export type PaymentStatus = Payment['status']

export interface PaymentListResponse {
  data: Payment[]
  pagination: {
    page: number
    perPage: number
    total: number
  }
}