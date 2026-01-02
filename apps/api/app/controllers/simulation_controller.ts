import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/customer'
import StripeEventHandler from '#services/stripe_event_handler'
import Stripe from 'stripe'

export default class SimulationController {
  // POST /simulation/payment_failed
  async paymentFailed({ response }: HttpContext) {
    const handler = new StripeEventHandler()

    // Ensure simulated customer exists
    await Customer.updateOrCreate(
      { stripeCustomerId: 'cus_simulated_123' },
      {
        stripeCustomerId: 'cus_simulated_123',
        email: 'simulated@demo.com',
        externalUserId: 'sim_user_123',
        status: 'active',
        lifetimeValue: 1000,
      }
    )

    // Construct a fake payment failure event
    const fakePaymentIntent: any = {
      id: `pi_sim_${Date.now()}`,
      object: 'payment_intent',
      amount: 29900,
      currency: 'usd',
      status: 'requires_payment_method',
      customer: 'cus_simulated_123',
    }

    await handler.handlePaymentIntent(fakePaymentIntent as Stripe.PaymentIntent)

    return response.ok({
      message: 'Simulated Payment Failure processed',
      fakeId: fakePaymentIntent.id,
    })
  }

  // POST /simulation/churn
  async churn({ response }: HttpContext) {
    const handler = new StripeEventHandler()

    // Ensure simulated customer exists
    await Customer.updateOrCreate(
      { stripeCustomerId: 'cus_simulated_123' },
      {
        stripeCustomerId: 'cus_simulated_123',
        email: 'simulated@demo.com',
        externalUserId: 'sim_user_123',
        status: 'active',
        lifetimeValue: 1000,
      }
    )

    const fakeSubscription: any = {
      id: `sub_sim_${Date.now()}`,
      object: 'subscription',
      status: 'canceled',
      customer: 'cus_simulated_123',
      current_period_end: Math.floor(Date.now() / 1000),
      cancel_at_period_end: false,
      items: {
        data: [
          {
            price: {
              unit_amount: 29900,
              currency: 'usd',
              recurring: { interval: 'month' },
            },
          },
        ],
      },
    }

    await handler.handleSubscription(fakeSubscription as Stripe.Subscription)

    return response.ok({ message: 'Simulated Churn processed', fakeId: fakeSubscription.id })
  }

  // POST /simulation/onboarding
  async onboarding({ response }: HttpContext) {
    const handler = new StripeEventHandler()

    // 1. Simulate Subscription Creation (Active)
    const fakeSubscription: any = {
      id: `sub_new_${Date.now()}`,
      object: 'subscription',
      status: 'active',
      customer: 'cus_new_user',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      cancel_at_period_end: false,
      items: {
        data: [
          {
            price: {
              unit_amount: 4900,
              currency: 'usd',
              recurring: { interval: 'month' },
            },
          },
        ],
      },
    }

    // 2. Simulate Customer linkage
    const fakeCustomer: any = {
      id: 'cus_new_user',
      object: 'customer',
      email: 'onboarding@demo.com',
    }

    await handler.handleCustomer(fakeCustomer as Stripe.Customer)
    await handler.handleSubscription(fakeSubscription as Stripe.Subscription)

    return response.ok({ message: 'Simulated Onboarding processed' })
  }
}
