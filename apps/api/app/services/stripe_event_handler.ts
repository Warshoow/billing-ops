import Payment from '#models/payment'
import LocalSubscription from '#models/subscription'
import Customer from '#models/customer'
import Alert from '#models/alert'
import Stripe from 'stripe'
import { DateTime } from 'luxon'

export default class StripeEventHandler {
  async handlePaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    // Find customer by Stripe ID to link
    let customerId: number | undefined
    let customer: Customer | null = null

    if (typeof paymentIntent.customer === 'string') {
      customer = await Customer.findBy('stripeCustomerId', paymentIntent.customer)
      if (customer) customerId = customer.id
    }

    await Payment.updateOrCreate(
      { stripePaymentId: paymentIntent.id },
      {
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert cents to dollars/unit
        currency: paymentIntent.currency,
        status: this.mapPaymentStatus(paymentIntent.status),
        customerId: customerId,
      }
    )

    // [NEW] Generate Alert if payment failed
    if (
      paymentIntent.status === 'requires_payment_method' ||
      paymentIntent.status === 'canceled' ||
      (paymentIntent as any).status === 'failed'
    ) {
      // 'failed' is typical in legacy/webhooks sometimes, but usually it's requires_payment_method for intents
      // Note: Stripe PaymentIntent status 'succeeded' | 'processing' | 'requires_payment_method' etc.
      // The event type 'payment_intent.payment_failed' usually comes with status 'requires_payment_method' + last_payment_error.

      if (customerId) {
        await Alert.create({
          customerId,
          type: 'payment_failed',
          severity: 'high', // Critical/High for payment failure
          message: `Payment of ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()} failed.`,
          resolved: false,
        })
        console.log(`[StripeEventHandler] Generated Alert for Payment ${paymentIntent.id}`)
      }
    }

    console.log(
      `[StripeEventHandler] Processed PaymentIntent: ${paymentIntent.id} (${paymentIntent.status})`
    )
  }

  async handleSubscription(subscription: Stripe.Subscription) {
    let customerId: number | undefined
    if (typeof subscription.customer === 'string') {
      const customer = await Customer.findBy('stripeCustomerId', subscription.customer)
      if (customer) customerId = customer.id
    }

    await LocalSubscription.updateOrCreate({ stripeSubscriptionId: subscription.id }, {
      stripeSubscriptionId: subscription.id,
      customerId: customerId,
      status: subscription.status as any,
      currentPeriodEnd: DateTime.fromSeconds(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      planInterval: subscription.items.data[0]?.price.recurring?.interval || 'month',
      planAmount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
      currency: subscription.items.data[0]?.price.currency || 'usd',
    } as any)

    // Handle Churn / Cancellation Alerts or Status Updates
    if (customerId && subscription.status === 'canceled') {
      const customer = await Customer.find(customerId)
      if (customer) {
        customer.status = 'churned'
        await customer.save()

        await Alert.create({
          customerId,
          type: 'churn',
          severity: 'critical',
          message: `Subscription ${subscription.id} indicates customer churn.`,
          resolved: false,
        })
      }
    }

    console.log(
      `[StripeEventHandler] Processed Subscription: ${subscription.id} (${subscription.status})`
    )
  }

  async handleCustomer(stripeCustomer: Stripe.Customer) {
    if (stripeCustomer.email) {
      const localCustomer = await Customer.findBy('email', stripeCustomer.email)
      if (localCustomer) {
        localCustomer.stripeCustomerId = stripeCustomer.id
        // If they have a stripe ID, they might be active now?
        // Logic depends on subscription, but associating is key.
        await localCustomer.save()
        console.log(
          `[StripeEventHandler] Linked Stripe Customer ${stripeCustomer.id} to local ${localCustomer.email}`
        )
      }
    }
  }
  private mapPaymentStatus(stripeStatus: string): 'succeeded' | 'failed' | 'pending' {
    switch (stripeStatus) {
      case 'succeeded':
        return 'succeeded'
      case 'requires_payment_method':
      case 'requires_action':
      case 'canceled':
        return 'failed'
      default:
        return 'pending'
    }
  }
}
