import type { HttpContext } from '@adonisjs/core/http'
import stripeService from '#services/stripe_service'
import StripeEventHandler from '#services/stripe_event_handler'
import Stripe from 'stripe'

export default class WebhooksController {
  async handle({ request, response }: HttpContext) {
    const signature = request.header('stripe-signature')

    if (!signature) {
      return response.badRequest('Missing stripe-signature header')
    }

    let event: Stripe.Event
    let rawBody: string | Buffer

    try {
      // Try to get raw body - AdonisJS 6 approach
      // First attempt: use request.raw() if available
      if (typeof (request as any).raw === 'function') {
        rawBody = await (request as any).raw()
      } else {
        // Fallback: Read from Node.js request stream
        const chunks: Buffer[] = []
        const nodeRequest = request.request // Access underlying Node.js IncomingMessage

        await new Promise<void>((resolve, reject) => {
          nodeRequest.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
          })
          nodeRequest.on('end', () => resolve())
          nodeRequest.on('error', (err: Error) => reject(err))
        })

        rawBody = Buffer.concat(chunks)
      }

      // Verify webhook signature and construct event
      event = stripeService.constructEvent(rawBody, signature)
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
