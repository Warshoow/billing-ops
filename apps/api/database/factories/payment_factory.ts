import factory from '@adonisjs/lucid/factories'
import Payment from '#models/payment'

export const PaymentFactory = factory
  .define(Payment, async ({ faker }) => {
    return {
      amount: faker.number.float({ min: 1, max: 100 }),
      currency: 'USD',
      status: faker.helpers.arrayElement(['succeeded', 'failed', 'pending']),
      stripe_payment_id: faker.string.uuid()
    }
  })
  .build()