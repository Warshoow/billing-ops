import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Customer from '#models/customer'
import Payment from '#models/payment'

test.group('PaymentsController - Retry', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test("retry retourne 400 si le payment n\'a pas de stripePaymentId", async ({ client }) => {
    const customer = await Customer.create({
      externalUserId: 'user_1',
      email: 'user1@test.com',
      stripeCustomerId: 'cus_123',
      status: 'active',
      lifetimeValue: 0,
    })

    const payment = await Payment.create({
      customerId: customer.id,
      stripePaymentId: '', // Pas de Stripe ID
      amount: 29.99,
      currency: 'usd',
      status: 'failed',
    })

    const response = await client.post(`/payments/${payment.id}/retry`)

    // ASSERT
    response.assertStatus(400) //
    response.assertBodyContains({ message: 'No Stripe Payment ID found for this payment' })
  })

  test("retry retourne 404 si le payment n\'existe pas", async ({ client }) => {
    const fakeUuid = '99999999-9999-9999-9999-999999999999'
    const response = await client.post(`/payments/${fakeUuid}/retry`)

    // ASSERT
    response.assertStatus(404)
  })
})
