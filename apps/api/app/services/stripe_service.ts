import Stripe from 'stripe'
import env from '#start/env'

export class StripeService {
  private stripe: Stripe

  constructor() {
    const key = env.get('STRIPE_SECRET_KEY')
    if (!key) throw new Error('STRIPE_SECRET_KEY is undefined')
    this.stripe = new Stripe(key, {
      apiVersion: '2025-12-15.clover',
    })
  }

  /**
   * Fetch a customer from Stripe
   */
  async getCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId)
  }

  /**
   * Fetch a payment intent from Stripe
   */
  async getPayment(paymentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentId)
  }

  /**
   * Fetch a subscription from Stripe
   */
  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId)
  }

  /**
   * Retry a failed payment intent
   */
  async retryPayment(paymentIntentId: string) {
    // To retry, we generally need to confirm it again or ensuring there's a payment method attached.
    // For off-session retries, we might implicitly rely on the stored payment method.
    // This action explicitly attempts to confirm the payment intent if it requires confirmation.
    return this.stripe.paymentIntents.confirm(paymentIntentId)
  }

  /**
   * Cancel a subscription immediately
   */
  async cancelSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.cancel(subscriptionId)
  }

  /**
   * Construct a webhook event from the request payload and signature
   */
  constructEvent(payload: string | Buffer, signature: string) {
    const secret = env.get('STRIPE_WEBHOOK_SECRET')
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is undefined')
    return this.stripe.webhooks.constructEvent(payload, signature, secret)
  }
}

const stripeService = new StripeService()
export default stripeService
