import factory from '@adonisjs/lucid/factories'
import Customer from '#models/customer'
import { SubscriptionFactory } from './subscription_factory.js'
import { PaymentFactory } from './payment_factory.js'
import { AlertFactory } from './alert_factory.js'

export const CustomerFactory = factory
  .define(Customer, async ({ faker }) => {
    return {
      external_user_id: faker.string.uuid(),
      email: faker.internet.email(),
      stripe_customer_id: faker.string.uuid(),
      status: faker.helpers.arrayElement(['active', 'at_risk', 'churned']),
      lifetime_value: faker.number.float({ min: 10, max: 200, fractionDigits: 2 }),
    }
  })
  .relation('subscriptions', () => SubscriptionFactory)
  .relation('payments', () => PaymentFactory)
  .relation('alerts', () => AlertFactory)
  .build()