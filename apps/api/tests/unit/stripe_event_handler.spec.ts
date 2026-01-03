import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import StripeEventHandler from '#services/stripe_event_handler'
import Customer from '#models/customer'
import Payment from '#models/payment'
import Alert from '#models/alert'
import type Stripe from 'stripe'

test.group('StripeEventHandler', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('crée un payment quand PaymentIntent succeeded', async ({ assert }) => {
    // ARRANGE
    const customer = await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    const mockPaymentIntent: Stripe.PaymentIntent = {
      id: 'pi_test123',
      object: 'payment_intent',
      amount: 2999, // En cents (29.99 USD)
      currency: 'usd',
      status: 'succeeded',
      customer: 'cus_123',
    } as Stripe.PaymentIntent

    const handler = new StripeEventHandler()

    // ACT
    await handler.handlePaymentIntent(mockPaymentIntent)

    // ASSERT
    const payment = await Payment.findBy('stripePaymentId', 'pi_test123')

    assert.isNotNull(payment)
    assert.equal(payment!.amount, 29.99) // Converti de cents à dollars
    assert.equal(payment!.currency, 'usd')
    assert.equal(payment!.status, 'succeeded')
    assert.equal(payment!.customerId, customer.id)
  })

  test('génère une alerte quand payment failed', async ({ assert }) => {
    // ARRANGE
    const customer = await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    const mockPaymentIntent: Stripe.PaymentIntent = {
      id: 'pi_failed123',
      object: 'payment_intent',
      amount: 4999,
      currency: 'usd',
      status: 'requires_payment_method', // = failed
      customer: 'cus_123',
    } as Stripe.PaymentIntent

    const handler = new StripeEventHandler()

    // ACT
    await handler.handlePaymentIntent(mockPaymentIntent)

    // ASSERT
    const alert = await Alert.query()
      .where('customerId', customer.id)
      .where('type', 'payment_failed')
      .first()

    assert.isNotNull(alert)
    assert.equal(alert!.severity, 'high')
    assert.equal(alert!.resolved, false)
    assert.include(alert!.message, '49.99') // Montant dans le message
  })

  test('met à jour customer status à churned quand subscription canceled', async ({ assert }) => {
    // ARRANGE
    const customer = await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    const start = Math.floor(Date.now() / 1000)
    const end = start + 30 * 24 * 60 * 60

    const mockSubscription: Stripe.Subscription = {
      id: 'sub_canceled123',
      object: 'subscription',
      customer: 'cus_123',
      status: 'canceled',
      cancel_at_period_end: false,
      items: {
        object: 'list',
        data: [
          {
            id: 'si_1',
            current_period_start: start,
            current_period_end: end,
            price: {
              id: 'price_1',
              unit_amount: 2999,
              currency: 'usd',
              recurring: { interval: 'month' },
            },
          } as Stripe.SubscriptionItem,
        ],
        has_more: false,
        url: '',
      },
    } as Stripe.Subscription

    const handler = new StripeEventHandler()

    // ACT
    await handler.handleSubscription(mockSubscription)

    // ASSERT
    await customer.refresh()
    assert.equal(customer.status, 'churned')
  })

  test('génère une alerte churn quand subscription canceled', async ({ assert }) => {
    // ARRANGE
    const customer = await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    const start = Math.floor(Date.now() / 1000)
    const end = start + 30 * 24 * 60 * 60

    const mockSubscription: Stripe.Subscription = {
      id: 'sub_canceled456',
      object: 'subscription',
      customer: 'cus_123',
      status: 'canceled',
      cancel_at_period_end: false,
      items: {
        object: 'list',
        data: [
          {
            id: 'si_1',
            current_period_start: start,
            current_period_end: end,
            price: {
              id: 'price_1',
              unit_amount: 4999,
              currency: 'usd',
              recurring: { interval: 'month' },
            },
          } as Stripe.SubscriptionItem,
        ],
        has_more: false,
        url: '',
      },
    } as Stripe.Subscription

    const handler = new StripeEventHandler()

    // ACT
    await handler.handleSubscription(mockSubscription)

    // ASSERT
    const alert = await Alert.query()
      .where('customerId', customer.id)
      .where('type', 'churn')
      .first()

    assert.isNotNull(alert)
    assert.equal(alert!.severity, 'critical')
    assert.include(alert!.message, 'sub_canceled456')
  })

  test('mappe correctement les statuts Stripe vers statuts internes', async ({ assert }) => {
    await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    const handler = new StripeEventHandler()

    // Test succeeded -> succeeded
    const succeededPI: Stripe.PaymentIntent = {
      id: 'pi_succeeded',
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
      customer: 'cus_123',
    } as Stripe.PaymentIntent

    await handler.handlePaymentIntent(succeededPI)
    let payment = await Payment.findByOrFail('stripePaymentId', 'pi_succeeded')
    assert.equal(payment.status, 'succeeded')

    // Test requires_payment_method -> failed
    const failedPI: Stripe.PaymentIntent = {
      id: 'pi_failed',
      amount: 1000,
      currency: 'usd',
      status: 'requires_payment_method',
      customer: 'cus_123',
    } as Stripe.PaymentIntent

    await handler.handlePaymentIntent(failedPI)
    payment = await Payment.findByOrFail('stripePaymentId', 'pi_failed')
    assert.equal(payment.status, 'failed')

    // Test processing -> pending
    const processingPI: Stripe.PaymentIntent = {
      id: 'pi_processing',
      amount: 1000,
      currency: 'usd',
      status: 'processing',
      customer: 'cus_123',
    } as Stripe.PaymentIntent

    await handler.handlePaymentIntent(processingPI)
    payment = await Payment.findByOrFail('stripePaymentId', 'pi_processing')
    assert.equal(payment.status, 'pending')
  })
})
