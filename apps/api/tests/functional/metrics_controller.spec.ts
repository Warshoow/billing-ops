import Customer from '#models/customer'
import Payment from '#models/payment'
import Subscription from '#models/subscription'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('MetricsController', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('calcule correctement le MRR avec des subscriptions actives', async ({ client, assert }) => {
    const customer1 = await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    const customer2 = await Customer.create({
      externalUserId: 'user_2',
      email: 'user2@test.com',
      stripeCustomerId: 'cus_456',
      status: 'active',
      lifetimeValue: 0,
    })

    // Créer 2 subscriptions actives
    await Subscription.create({
      customerId: customer1.id,
      stripeSubscriptionId: 'sub_1',
      status: 'active',
      planAmount: 29.99,
      currency: 'usd',
      planInterval: 'month',
      currentPeriodStart: DateTime.now(),
      currentPeriodEnd: DateTime.now().plus({ days: 30 }),
      cancelAtPeriodEnd: false,
    })

    await Subscription.create({
      customerId: customer2.id,
      stripeSubscriptionId: 'sub_2',
      status: 'active',
      planAmount: 49.99,
      currency: 'usd',
      planInterval: 'month',
      currentPeriodStart: DateTime.now(),
      currentPeriodEnd: DateTime.now().plus({ days: 30 }),
      cancelAtPeriodEnd: false,
    })

    // Créer 1 subscription canceled (ne doit pas être comptée)
    await Subscription.create({
      customerId: customer1.id,
      stripeSubscriptionId: 'sub_3',
      status: 'canceled',
      planAmount: 19.99,
      currency: 'usd',
      planInterval: 'month',
      currentPeriodStart: DateTime.now().minus({ days: 30 }),
      currentPeriodEnd: DateTime.now(),
      cancelAtPeriodEnd: false,
    })

    // ACT - Appeler l'endpoint
    const response = await client.get('/metrics')

    // ASSERT - Vérifier les résultats
    response.assertStatus(200)

    const body = response.body()

    // MRR = 29.99 + 49.99 = 79.98 (ne compte pas la canceled)
    assert.equal(body.mrr, 79.98)
    assert.equal(body.activeSubscriptions, 2)
  })

  test('retourne 0 pour le MRR si aucune subscription active', async ({ client, assert }) => {
    // Pas de données créées = state vide

    const response = await client.get('/metrics')

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.mrr, 0)
    assert.equal(body.activeSubscriptions, 0)
  })

  test('calcule le churn rate correctement', async ({ client, assert }) => {
    const customer1 = await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    const customer2 = await Customer.create({
      externalUserId: 'user_2',
      email: 'user2@test.com',
      stripeCustomerId: 'cus_456',
      status: 'churned',
      lifetimeValue: 0,
    })

    // 2 subscriptions actives
    await Subscription.createMany([
      {
        customerId: customer1.id,
        stripeSubscriptionId: 'sub_1',
        status: 'active',
        planAmount: 29.99,
        currency: 'usd',
        planInterval: 'month',
        currentPeriodStart: DateTime.now(),
        currentPeriodEnd: DateTime.now().plus({ days: 30 }),
        cancelAtPeriodEnd: false,
      },
      {
        customerId: customer1.id,
        stripeSubscriptionId: 'sub_2',
        status: 'active',
        planAmount: 49.99,
        currency: 'usd',
        planInterval: 'month',
        currentPeriodStart: DateTime.now(),
        currentPeriodEnd: DateTime.now().plus({ days: 30 }),
        cancelAtPeriodEnd: false,
      },
    ])

    // 1 subscription canceled
    await Subscription.create({
      customerId: customer2.id,
      stripeSubscriptionId: 'sub_3',
      status: 'canceled',
      planAmount: 19.99,
      currency: 'usd',
      planInterval: 'month',
      currentPeriodStart: DateTime.now().minus({ days: 30 }),
      currentPeriodEnd: DateTime.now(),
      cancelAtPeriodEnd: false,
    })

    const response = await client.get('/metrics')

    response.assertStatus(200)

    // Churn rate = (1 canceled / 3 total) * 100 = 33.33%
    assert.approximately(response.body().churnRate, 33.33, 0.1)
  })

  test('compte correctement les paiements échoués', async ({ client, assert }) => {
    const customer = await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    // 2 paiements succeeded
    await Payment.createMany([
      {
        customerId: customer.id,
        stripePaymentId: 'pi_1',
        amount: 29.99,
        currency: 'usd',
        status: 'succeeded',
      },
      {
        customerId: customer.id,
        stripePaymentId: 'pi_2',
        amount: 49.99,
        currency: 'usd',
        status: 'succeeded',
      },
    ])

    // 3 paiements failed
    await Payment.createMany([
      {
        customerId: customer.id,
        stripePaymentId: 'pi_3',
        amount: 29.99,
        currency: 'usd',
        status: 'failed',
      },
      {
        customerId: customer.id,
        stripePaymentId: 'pi_4',
        amount: 29.99,
        currency: 'usd',
        status: 'failed',
      },
      {
        customerId: customer.id,
        stripePaymentId: 'pi_5',
        amount: 29.99,
        currency: 'usd',
        status: 'failed',
      },
    ])

    const response = await client.get('/metrics')

    response.assertStatus(200)
    assert.equal(response.body().failedPaymentsCount, 3)
  })
})
