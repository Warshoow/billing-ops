import Customer from '#models/customer'
import testUtils from '@adonisjs/core/services/test_utils'
import env from '#start/env'
import { test } from '@japa/runner'

const API_KEY = env.get('BILLING_API_KEY')

test.group('BillingController - Auth', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns 401 without API key', async ({ client }) => {
    const response = await client.post('/billing/customers').json({
      externalUserId: 'usr_1',
      email: 'test@example.com',
    })

    response.assertStatus(401)
    response.assertBodyContains({ error: 'unauthorized' })
  })

  test('returns 401 with wrong API key', async ({ client }) => {
    const response = await client.post('/billing/customers').header('x-api-key', 'wrong_key').json({
      externalUserId: 'usr_1',
      email: 'test@example.com',
    })

    response.assertStatus(401)
    response.assertBodyContains({ error: 'unauthorized' })
  })
})

test.group('BillingController - createCustomer validation', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns 422 when externalUserId is missing', async ({ client }) => {
    const response = await client
      .post('/billing/customers')
      .header('x-api-key', API_KEY)
      .json({ email: 'test@example.com' })

    response.assertStatus(422)
  })

  test('returns 422 when email is missing', async ({ client }) => {
    const response = await client
      .post('/billing/customers')
      .header('x-api-key', API_KEY)
      .json({ externalUserId: 'usr_1' })

    response.assertStatus(422)
  })

  test('returns 422 when email is invalid', async ({ client }) => {
    const response = await client
      .post('/billing/customers')
      .header('x-api-key', API_KEY)
      .json({ externalUserId: 'usr_1', email: 'not-an-email' })

    response.assertStatus(422)
  })

  test('returns 409 when customer already has a Stripe account', async ({ client }) => {
    await Customer.create({
      externalUserId: 'usr_existing',
      email: 'existing@test.com',
      stripeCustomerId: 'cus_already_linked',
      status: 'active',
      lifetimeValue: 0,
    })

    const response = await client
      .post('/billing/customers')
      .header('x-api-key', API_KEY)
      .json({ externalUserId: 'usr_existing', email: 'existing@test.com' })

    response.assertStatus(409)
    response.assertBodyContains({ error: 'conflict' })
  })
})

test.group('BillingController - createSubscription validation', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns 422 when externalUserId is missing', async ({ client }) => {
    const response = await client.post('/billing/subscriptions').header('x-api-key', API_KEY).json({
      priceId: 'price_123',
      successUrl: 'https://app.com/success',
      cancelUrl: 'https://app.com/cancel',
    })

    response.assertStatus(422)
  })

  test('returns 422 when priceId is missing', async ({ client }) => {
    const response = await client.post('/billing/subscriptions').header('x-api-key', API_KEY).json({
      externalUserId: 'usr_1',
      successUrl: 'https://app.com/success',
      cancelUrl: 'https://app.com/cancel',
    })

    response.assertStatus(422)
  })

  test('returns 422 when URLs are missing', async ({ client }) => {
    const response = await client.post('/billing/subscriptions').header('x-api-key', API_KEY).json({
      externalUserId: 'usr_1',
      priceId: 'price_123',
    })

    response.assertStatus(422)
  })

  test('returns 404 when customer does not exist', async ({ client }) => {
    const response = await client.post('/billing/subscriptions').header('x-api-key', API_KEY).json({
      externalUserId: 'usr_nonexistent',
      priceId: 'price_123',
      successUrl: 'https://app.com/success',
      cancelUrl: 'https://app.com/cancel',
    })

    response.assertStatus(404)
    response.assertBodyContains({ error: 'customer_not_found' })
  })

  test('returns 422 when customer has no Stripe account', async ({ client }) => {
    await Customer.create({
      externalUserId: 'usr_no_stripe',
      email: 'nostripe@test.com',
      stripeCustomerId: null,
      status: 'active',
      lifetimeValue: 0,
    })

    const response = await client.post('/billing/subscriptions').header('x-api-key', API_KEY).json({
      externalUserId: 'usr_no_stripe',
      priceId: 'price_123',
      successUrl: 'https://app.com/success',
      cancelUrl: 'https://app.com/cancel',
    })

    response.assertStatus(422)
    response.assertBodyContains({ error: 'invalid_request' })
  })
})

test.group('BillingController - cancelSubscription validation', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns 422 when externalUserId is missing', async ({ client }) => {
    const response = await client
      .post('/billing/subscriptions/cancel')
      .header('x-api-key', API_KEY)
      .json({})

    response.assertStatus(422)
  })

  test('returns 404 when customer does not exist', async ({ client }) => {
    const response = await client
      .post('/billing/subscriptions/cancel')
      .header('x-api-key', API_KEY)
      .json({ externalUserId: 'usr_nonexistent' })

    response.assertStatus(404)
    response.assertBodyContains({ error: 'customer_not_found' })
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

test.group('BillingController - retryPayment validation', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('returns 422 when paymentIntentId is missing', async ({ client }) => {
    const response = await client
      .post('/billing/payments/retry')
      .header('x-api-key', API_KEY)
      .json({})

    response.assertStatus(422)
  })
})
