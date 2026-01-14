import vine from '@vinejs/vine'

/**
 * Validator for creating a new alert
 */
export const createAlertValidator = vine.compile(
  vine.object({
    customerId: vine.string().uuid(),
    type: vine.enum(['payment_failed', 'subscription_at_risk', 'churn']),
    severity: vine.enum(['low', 'medium', 'high', 'critical']),
    message: vine.string().minLength(1).maxLength(500),
    resolved: vine.boolean().optional(),
  })
)

/**
 * Validator for updating an existing alert
 */
export const updateAlertValidator = vine.compile(
  vine.object({
    customerId: vine.string().uuid(),
    type: vine.enum(['payment_failed', 'subscription_at_risk', 'churn']).optional(),
    severity: vine.enum(['low', 'medium', 'high', 'critical']).optional(),
    message: vine.string().minLength(1).maxLength(500).optional(),
    resolved: vine.boolean().optional(),
  })
)
