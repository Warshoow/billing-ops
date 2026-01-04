import Payment from '#models/payment'
import LocalSubscription from '#models/subscription'
import Customer from '#models/customer'
import Alert from '#models/alert'
import Stripe from 'stripe'
import { DateTime } from 'luxon'

export default class StripeEventHandler {
  async handlePaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    // Find customer by Stripe ID to link
    let customerId: string | undefined
    let customer: Customer | null = null

    if (typeof paymentIntent.customer === 'string') {
      customer = await Customer.findBy('stripeCustomerId', paymentIntent.customer)

      // If customer doesn't exist locally, create it
      if (!customer) {
        customer = await Customer.create({
          stripeCustomerId: paymentIntent.customer,
          externalUserId: `stripe_${paymentIntent.customer}`,
          email: `unknown_${paymentIntent.customer}@stripe.webhook`,
          status: 'active',
          lifetimeValue: 0,
        })
        console.log(
          `[StripeEventHandler] Created new customer from Stripe ID: ${paymentIntent.customer}`
        )
      }

      customerId = customer.id
    }

    // Only create payment if we have a valid customer
    if (customerId) {
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
    } else {
      console.warn(
        `[StripeEventHandler] Skipping PaymentIntent ${paymentIntent.id} - no customer found`
      )
      return
    }

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
    let customerId: string | undefined
    let customer: Customer | null = null

    if (typeof subscription.customer === 'string') {
      customer = await Customer.findBy('stripeCustomerId', subscription.customer)

      // If customer doesn't exist locally, create it
      if (!customer) {
        customer = await Customer.create({
          stripeCustomerId: subscription.customer,
          externalUserId: `stripe_${subscription.customer}`,
          email: `unknown_${subscription.customer}@stripe.webhook`,
          status: 'active',
          lifetimeValue: 0,
        })
        console.log(
          `[StripeEventHandler] Created new customer from Stripe ID: ${subscription.customer}`
        )
      }

      customerId = customer.id
    }

    // Only create subscription if we have a valid customer
    if (!customerId) {
      console.warn(
        `[StripeEventHandler] Skipping Subscription ${subscription.id} - no customer found`
      )
      return
    }

    await LocalSubscription.updateOrCreate({ stripeSubscriptionId: subscription.id }, {
      stripeSubscriptionId: subscription.id,
      customerId: customerId,
      status: subscription.status as any,
      currentPeriodStart: DateTime.fromSeconds(subscription.items.data[0]?.current_period_start),
      currentPeriodEnd: DateTime.fromSeconds(subscription.items.data[0]?.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      planInterval: subscription.items.data[0]?.price.recurring?.interval || 'month',
      planAmount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
      currency: subscription.items.data[0]?.price.currency || 'usd',
    } as any)

    // Handle Churn / Cancellation Alerts or Status Updates
    if (customerId && subscription.status === 'canceled') {
      const customerRecord = await Customer.find(customerId)
      if (customerRecord) {
        customerRecord.status = 'churned'
        await customerRecord.save()

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
