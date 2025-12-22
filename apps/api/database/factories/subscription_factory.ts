import factory from '@adonisjs/lucid/factories'
import Subscription from '#models/subscription'
import { DateTime } from 'luxon'

export const SubscriptionFactory = factory
  .define(Subscription, async ({ faker }) => {
    const start = DateTime.now().minus({ days: faker.number.int({ min: 1, max: 30 }) })
    const end = start.plus({ days: 30 })

    return {
      status: faker.helpers.arrayElement(['active', 'canceled', 'past_due', 'trialing']),
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: faker.datatype.boolean(),
      stripeSubscriptionId: `sub_${faker.string.alphanumeric(14)}`,
      planAmount: faker.number.float({ min: 10, max: 200, fractionDigits: 2 }),
      currency: 'usd',
    }
  })
  .build()
