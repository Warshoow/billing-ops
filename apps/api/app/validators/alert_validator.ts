import vine from '@vinejs/vine'

/**
 * Validator for creating a new alert
 */
export const createAlertValidator = vine.compile(
  vine.object({
    customerId: vine.number().positive(),
    type: vine.enum(['payment_failed', 'subscription_canceled', 'high_churn']),
    severity: vine.enum(['low', 'medium', 'high']),
    message: vine.string().minLength(1).maxLength(500),
    resolved: vine.boolean().optional(),
  })
)

/**
 * Validator for updating an existing alert
 */
export const updateAlertValidator = vine.compile(
  vine.object({
    customerId: vine.number().positive().optional(),
    type: vine.enum(['payment_failed', 'subscription_canceled', 'high_churn']).optional(),
    severity: vine.enum(['low', 'medium', 'high']).optional(),
    message: vine.string().minLength(1).maxLength(500).optional(),
    resolved: vine.boolean().optional(),
  })
)
