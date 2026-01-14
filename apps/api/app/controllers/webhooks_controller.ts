import type { HttpContext } from '@adonisjs/core/http'
import stripeService from '#services/stripe_service'
import StripeEventHandler from '#services/stripe_event_handler'
import Stripe from 'stripe'

export default class WebhooksController {
  async handle(ctx: HttpContext) {
    const { request, response } = ctx
    const signature = request.header('stripe-signature')

    if (!signature) {
      return response.badRequest('Missing stripe-signature header')
    }

    // Read raw body from Node.js request stream (bodyparser is not applied to this route)
    const rawBody = await this.readRawBody(ctx)

    if (!rawBody || rawBody.length === 0) {
      console.error('[Webhooks] Empty or missing body')
      return response.badRequest('Empty body')
    }

    console.log('[Webhooks] Raw body size:', rawBody.length, 'bytes')

    let event: Stripe.Event

    try {
      // Verify webhook signature and construct event
      event = stripeService.constructEvent(rawBody, signature)
    } catch (err: any) {
      console.error(`[Webhooks] Signature verification failed: ${err.message}`)
      return response.badRequest(`Webhook Error: ${err.message}`)
    }

    console.log(`[Webhooks] Received event: ${event.type}`)

    // Respond immediately to avoid timeout
    response.ok({ received: true })

    // Process the event asynchronously in background
    const handler = new StripeEventHandler()

    // Don't await - let it process in background
    ;(async () => {
      try {
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
        console.log(`[Webhooks] Successfully processed event: ${event.type}`)
      } catch (error) {
        console.error(`[Webhooks] Error processing event ${event.type}:`, error)
      }
    })()

    return
  }

  /**
   * Read raw body from Node.js request stream
   * Since bodyparser is not applied to this route, we need to manually read the stream
   */
  private async readRawBody(ctx: HttpContext): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      const req = ctx.request.request

      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      req.on('end', () => {
        resolve(Buffer.concat(chunks))
      })

      req.on('error', (err) => {
        reject(err)
      })
    })
  }
}
