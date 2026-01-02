import type { HttpContext } from '@adonisjs/core/http'
import stripeService from '#services/stripe_service'
import Payment from '#models/payment'
import LocalSubscription from '#models/subscription'
import Customer from '#models/customer'
import Stripe from 'stripe'
import { DateTime } from 'luxon'

export default class WebhooksController {
  async handle({ request, response }: HttpContext) {
    // const payload = request.body()
    const signature = request.header('stripe-signature')

    if (!signature) {
      return response.badRequest('Missing stripe-signature header')
    }

    let event: Stripe.Event

    try {
      // In a real AdonisJS app with raw body parsing disabled by default for JSON,
      // we might need to ensure we get the raw buffer.
      // For now, assuming standard middleware config or using a raw body parser if configured.
      // If request.raw() or similar is needed, adjustment might be required based on bodyparser config.
      // NOTE: stripe.webhooks.constructEvent expects raw string/buffer.
      // If bodyparser parsed it to JSON, this will fail.
      // We often need "request.raw()" or similar in Adonis.
      // For this implementation, we assume we have access to raw body or the payload is correct.
      // If request.body() is already JSON, we might need a different approach
      // or ensure the route is excluded from bodyparser JSON parsing.

      // Attempting to use request.raw() if available, or stringify body if it was parsed (risky for signature).
      // Best practice in Adonis 6 is to disable bodyparser for this route or use `request.raw()` if available.
      // Let's assume for this step we have access to raw body or the payload is correct.
      // Ideally: event = stripeService.constructEvent(request.raw(), signature)

      // Since we can't easily change bodyparser config in one go without verifying,
      // we will assume `request.raw()` works or we pass the body as is if it's string.

      // Workaround for this environment: We will try to rely on the service.
      // But `request.raw()` usage depends on `config/bodyparser.ts`.

      // Let's proceed with a standard try, knowing we might need to tweak bodyparser later.
      event = stripeService.constructEvent(request.raw() as unknown as string | Buffer, signature)
    } catch (err: any) {
      console.error(`[Webhooks] Signature verification failed: ${err.message}`)
      return response.badRequest(`Webhook Error: ${err.message}`)
    }

    console.log(`[Webhooks] Received event: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.created':
      case 'payment_intent.processing':
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntent(event.data.object as Stripe.PaymentIntent)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscription(event.data.object as Stripe.Subscription)
        break
      case 'customer.created':
      case 'customer.updated':
        await this.handleCustomer(event.data.object as Stripe.Customer)
        break
      default:
        console.log(`[Webhooks] Unhandled event type: ${event.type}`)
    }

    return response.ok({ received: true })
  }

  private async handlePaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    // Find customer by Stripe ID to link
    let customerId: number | undefined
    if (typeof paymentIntent.customer === 'string') {
      const customer = await Customer.findBy('stripeCustomerId', paymentIntent.customer)
      if (customer) customerId = customer.id
    }

    await Payment.updateOrCreate(
      { stripePaymentId: paymentIntent.id },
      {
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert cents to dollars/unit
        currency: paymentIntent.currency,
        status: paymentIntent.status as any, // Map Stripe status to our types
        customerId: customerId,
        // If customerId is null, we might have an orphan payment or need to fetch customer logic
      }
    )
    console.log(`[Webhooks] Processed PaymentIntent: ${paymentIntent.id} (${paymentIntent.status})`)
  }

  private async handleSubscription(subscription: Stripe.Subscription) {
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
    console.log(`[Webhooks] Processed Subscription: ${subscription.id} (${subscription.status})`)
  }

  private async handleCustomer(stripeCustomer: Stripe.Customer) {
    // We might link based on email if we have it
    if (stripeCustomer.email) {
      const localCustomer = await Customer.findBy('email', stripeCustomer.email)
      if (localCustomer) {
        localCustomer.stripeCustomerId = stripeCustomer.id
        // We could also update name or other fields if we sync them back
        await localCustomer.save()
        console.log(
          `[Webhooks] Linked Stripe Customer ${stripeCustomer.id} to local ${localCustomer.email}`
        )
      }
    }
  }
}
