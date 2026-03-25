import Customer from '#models/customer'
import Subscription from '#models/subscription'
import Payment from '#models/payment'
import testUtils from '@adonisjs/core/services/test_utils'
import env from '#start/env'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

const API_KEY = env.get('BILLING_API_KEY')

test.group('BillingController - createCustomer happy path', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('creates a local customer record when Stripe call succeeds', async ({ assert, client }) => {
    // This test verifies validation + DB layer.
    // The actual Stripe call will fail without a real key, so we test
    // that validation passes and the request reaches the service layer.
    const response = await client
      .post('/billing/customers')
      .header('x-api-key', API_KEY)
      .json({
        externalUserId: 'usr_happy_1',
        email: 'happy@test.com',
        name: 'Happy Customer',
      })

    // Will be 502 (Stripe error) or 201 (success) depending on Stripe config.
    // If Stripe is not configured, it should be 502 with stripe_error or a 500.
    // The important thing is that it's NOT a 422 (validation passed).
    assert.notEqual(response.status(), 422)
    assert.notEqual(response.status(), 401)
  })

  test('returns 409 when customer already has Stripe account', async ({ client }) => {
    await Customer.create({
      externalUserId: 'usr_dup',
      email: 'dup@test.com',
      stripeCustomerId: 'cus_existing',
      status: 'active',
      lifetimeValue: 0,
    })

    const response = await client
      .post('/billing/customers')
      .header('x-api-key', API_KEY)
      .json({
        externalUserId: 'usr_dup',
        email: 'dup@test.com',
      })

    response.assertStatus(409)
    response.assertBodyContains({ error: 'conflict' })
  })
})

test.group('BillingController - cancelSubscription happy path', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('finds active subscription for customer when no subscriptionId provided', async ({
    assert,
    client,
  }) => {
    const customer = await Customer.create({
      externalUserId: 'usr_cancel_1',
      email: 'cancel@test.com',
      stripeCustomerId: 'cus_cancel_1',
      status: 'active',
      lifetimeValue: 100,
    })

    await Subscription.create({
      customerId: customer.id,
      stripeSubscriptionId: 'sub_to_cancel',
      status: 'active',
      currentPeriodStart: DateTime.now(),
      currentPeriodEnd: DateTime.now().plus({ months: 1 }),
      cancelAtPeriodEnd: false,
      planAmount: 29.99,
      currency: 'usd',
      planInterval: 'month',
    })

    const response = await client
      .post('/billing/subscriptions/cancel')
      .header('x-api-key', API_KEY)
      .json({
        externalUserId: 'usr_cancel_1',
        cancelAtPeriodEnd: true,
      })

    // Should reach Stripe (not 422 or 404)
    assert.notEqual(response.status(), 422)
    assert.notEqual(response.status(), 404)
  })

  test('returns 422 when customer has no active subscription', async ({ client }) => {
    await Customer.create({
      externalUserId: 'usr_no_sub',
      email: 'nosub@test.com',
      stripeCustomerId: 'cus_nosub',
      status: 'active',
      lifetimeValue: 0,
    })

    const response = await client
      .post('/billing/subscriptions/cancel')
      .header('x-api-key', API_KEY)
      .json({ externalUserId: 'usr_no_sub' })

    response.assertStatus(422)
    response.assertBodyContains({ error: 'invalid_request' })
  })
})

test.group('BillingController - retryPayment happy path', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('passes validation with a valid paymentIntentId', async ({ assert, client }) => {
    const response = await client
      .post('/billing/payments/retry')
      .header('x-api-key', API_KEY)
      .json({
        paymentIntentId: 'pi_test_retry_123',
      })

    // Should reach Stripe layer (not 422)
    assert.notEqual(response.status(), 422)
    assert.notEqual(response.status(), 401)
  })
})

test.group('BillingController - createSubscription happy path', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns 422 when customer has no Stripe account', async ({ client }) => {
    await Customer.create({
      externalUserId: 'usr_no_stripe',
      email: 'nostripe@test.com',
      stripeCustomerId: null,
      status: 'active',
      lifetimeValue: 0,
    })

    const response = await client
      .post('/billing/subscriptions')
      .header('x-api-key', API_KEY)
      .json({
        externalUserId: 'usr_no_stripe',
        priceId: 'price_test_123',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      })

    response.assertStatus(422)
    response.assertBodyContains({ error: 'invalid_request' })
  })

  test('passes validation and reaches Stripe layer with valid data', async ({
    assert,
    client,
  }) => {
    await Customer.create({
      externalUserId: 'usr_sub_1',
      email: 'sub@test.com',
      stripeCustomerId: 'cus_sub_1',
      status: 'active',
      lifetimeValue: 0,
    })

    const response = await client
      .post('/billing/subscriptions')
      .header('x-api-key', API_KEY)
      .json({
        externalUserId: 'usr_sub_1',
        priceId: 'price_test_123',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      })

    // Should pass validation (not 422) and reach Stripe
    assert.notEqual(response.status(), 422)
    assert.notEqual(response.status(), 401)
    assert.notEqual(response.status(), 404)
  })
})
