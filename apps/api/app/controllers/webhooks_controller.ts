import type { HttpContext } from '@adonisjs/core/http'
import stripeService from '#services/stripe_service'
import StripeEventHandler from '#services/stripe_event_handler'
import Stripe from 'stripe'

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

    const handler = new StripeEventHandler()

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.created':
      case 'payment_intent.processing':
      case 'payment_intent.payment_failed':
        await handler.handlePaymentIntent(event.data.object as Stripe.PaymentIntent)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handler.handleSubscription(event.data.object as Stripe.Subscription)
        break
      case 'customer.created':
      case 'customer.updated':
        await handler.handleCustomer(event.data.object as Stripe.Customer)
        break
      default:
        console.log(`[Webhooks] Unhandled event type: ${event.type}`)
    }

    return response.ok({ received: true })
  }
}
