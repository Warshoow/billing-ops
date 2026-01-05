import Stripe from 'stripe'
import env from '#start/env'

export class StripeService {
  private stripe: Stripe | null = null

  constructor() {
    const key = env.get('STRIPE_SECRET_KEY')
    if (key) {
      this.stripe = new Stripe(key, {
        apiVersion: '2025-12-15.clover',
      })
    }
  }

  private ensureStripeInitialized(): Stripe {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized. Please set STRIPE_SECRET_KEY in your environment.')
    }
    return this.stripe
  }

  /**
   * Fetch a customer from Stripe
   */
  async getCustomer(customerId: string) {
    const stripe = this.ensureStripeInitialized()
    return stripe.customers.retrieve(customerId)
  }

  /**
   * Fetch a payment intent from Stripe
   */
  async getPayment(paymentId: string) {
    const stripe = this.ensureStripeInitialized()
    return stripe.paymentIntents.retrieve(paymentId)
  }

  /**
   * Fetch a subscription from Stripe
   */
  async getSubscription(subscriptionId: string) {
    const stripe = this.ensureStripeInitialized()
    return stripe.subscriptions.retrieve(subscriptionId)
  }

  /**
   * Retry a failed payment intent
   */
  async retryPayment(paymentIntentId: string) {
    // To retry, we generally need to confirm it again or ensuring there's a payment method attached.
    // For off-session retries, we might implicitly rely on the stored payment method.
    // This action explicitly attempts to confirm the payment intent if it requires confirmation.
    const stripe = this.ensureStripeInitialized()
    return stripe.paymentIntents.confirm(paymentIntentId)
  }

  /**
   * Cancel a subscription immediately
   */
  async cancelSubscription(subscriptionId: string) {
    const stripe = this.ensureStripeInitialized()
    return stripe.subscriptions.cancel(subscriptionId)
  }

  /**
   * Construct a webhook event from the request payload and signature
   */
  constructEvent(payload: string | Buffer, signature: string) {
    const stripe = this.ensureStripeInitialized()
    const secret = env.get('STRIPE_WEBHOOK_SECRET')
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is undefined')
    return stripe.webhooks.constructEvent(payload, signature, secret)
  }
}

const stripeService = new StripeService()
export default stripeService
