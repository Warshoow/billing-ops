import Stripe from 'stripe'
import stripeService from '#services/stripe_service'
import Customer from '#models/customer'
import Subscription from '#models/subscription'
import Payment from '#models/payment'
import {
  CustomerNotFoundError,
  StripeOperationError,
  InvalidBillingRequestError,
  BillingConflictError,
} from '#exceptions/billing_errors'

export class BillingService {
  /**
   * Wraps a Stripe SDK call, catching Stripe errors and converting them
   * to typed BillingService errors.
   */
  private async callStripe<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error: unknown) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new StripeOperationError(error.message, error.code)
      }
      throw error
    }
  }

  /**
   * Resolve a local Customer by externalUserId. Throws if not found.
   */
  async resolveCustomer(externalUserId: string): Promise<Customer> {
    const customer = await Customer.findBy('externalUserId', externalUserId)
    if (!customer) throw new CustomerNotFoundError(externalUserId)
    return customer
  }

  /**
   * Create a Stripe customer and link it to a local Customer record.
   */
  async createCustomer(data: { externalUserId: string; email: string; name?: string }) {
    // Check if customer already exists with a Stripe account
    const existing = await Customer.findBy('externalUserId', data.externalUserId)
    if (existing && existing.stripeCustomerId) {
      throw new BillingConflictError(
        `Customer ${data.externalUserId} already has a Stripe account`
      )
    }

    // Create Stripe customer
    const stripeCustomer = await this.callStripe(() =>
      stripeService.createCustomer({
        email: data.email,
        name: data.name,
        metadata: { externalUserId: data.externalUserId },
      })
    )

    // Create or update local record
    let customer: Customer
    if (existing) {
      existing.merge({
        email: data.email,
        stripeCustomerId: stripeCustomer.id,
      })
      await existing.save()
      customer = existing
    } else {
      customer = await Customer.create({
        externalUserId: data.externalUserId,
        email: data.email,
        stripeCustomerId: stripeCustomer.id,
        status: 'active',
        lifetimeValue: 0,
      })
    }

    return {
      customerId: customer.id,
      externalUserId: customer.externalUserId,
      email: customer.email,
      stripeCustomerId: stripeCustomer.id,
    }
  }

  /**
   * Create a Stripe Checkout Session for a subscription.
   * Returns a checkout URL — the SaaS product redirects the user there.
   * The webhook will handle the subscription creation in DB.
   */
  async createSubscription(data: {
    externalUserId: string
    priceId: string
    successUrl: string
    cancelUrl: string
  }) {
    const customer = await this.resolveCustomer(data.externalUserId)

    if (!customer.stripeCustomerId) {
      throw new InvalidBillingRequestError(
        `Customer ${data.externalUserId} does not have a Stripe account. Create one first.`
      )
    }

    const session = await this.callStripe(() =>
      stripeService.createCheckoutSession({
        customerId: customer.stripeCustomerId!,
        priceId: data.priceId,
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
      })
    )

    return {
      sessionId: session.id,
      url: session.url,
    }
  }

  /**
   * Cancel a subscription — graceful (end of period) by default.
   */
  async cancelSubscription(data: {
    externalUserId: string
    subscriptionId?: string
    cancelAtPeriodEnd?: boolean
  }) {
    const customer = await this.resolveCustomer(data.externalUserId)
    const cancelAtPeriodEnd = data.cancelAtPeriodEnd ?? true

    // Find the subscription to cancel
    let stripeSubId = data.subscriptionId
    if (!stripeSubId) {
      const activeSub = await Subscription.query()
        .where('customerId', customer.id)
        .where('status', 'active')
        .first()

      if (!activeSub) {
        throw new InvalidBillingRequestError(
          `No active subscription found for customer ${data.externalUserId}`
        )
      }
      stripeSubId = activeSub.stripeSubscriptionId
    }

    const result = await this.callStripe(() =>
      stripeService.cancelSubscriptionGraceful(stripeSubId!, cancelAtPeriodEnd)
    )

    // Update local record optimistically (webhook will also update it)
    const localSub = await Subscription.findBy('stripeSubscriptionId', stripeSubId)
    if (localSub) {
      if (cancelAtPeriodEnd) {
        localSub.cancelAtPeriodEnd = true
      } else {
        localSub.status = 'canceled'
      }
      await localSub.save()
    }

    const item = result.items.data[0]
    return {
      stripeSubscriptionId: result.id,
      status: result.status,
      cancelAtPeriodEnd: result.cancel_at_period_end,
      currentPeriodEnd: item
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
    }
  }

  /**
   * Retry a failed payment intent.
   */
  async retryPayment(data: { paymentIntentId: string }) {
    const result = await this.callStripe(() =>
      stripeService.retryPayment(data.paymentIntentId)
    )

    // Update local payment record if it exists
    const localPayment = await Payment.findBy('stripePaymentId', data.paymentIntentId)
    if (localPayment) {
      localPayment.status = result.status === 'succeeded' ? 'succeeded' : 'pending'
      await localPayment.save()
    }

    return {
      paymentIntentId: result.id,
      status: result.status,
      amount: result.amount / 100,
      currency: result.currency,
    }
  }
}

const billingService = new BillingService()
export default billingService
