import factory from '@adonisjs/lucid/factories'
import Alert from '#models/alert'

export const AlertFactory = factory
  .define(Alert, async ({ faker }) => {
    const type = faker.helpers.arrayElement(['payment_failed', 'subscription_at_risk', 'churn'])

    const messages = {
      payment_failed: 'Payment method declined',
      subscription_at_risk: 'Subscription renewal approaching with invalid payment method',
      churn: 'Customer has canceled their subscription',
    }

    return {
      type,
      severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
      message: messages[type],
      resolved: faker.datatype.boolean({ probability: 0.3 }), // 30% de chances d'être résolu
    }
  })
  .build()
