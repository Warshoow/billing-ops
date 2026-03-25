import vine from '@vinejs/vine'

export const storeSubscriptionValidator = vine.compile(
  vine.object({
    customerId: vine.string().uuid(),
    status: vine.enum(['active', 'canceled', 'past_due', 'trialing']),
    currentPeriodStart: vine.string(),
    currentPeriodEnd: vine.string(),
    cancelAtPeriodEnd: vine.boolean().optional(),
    stripeSubscriptionId: vine.string().minLength(1),
    planAmount: vine.number().min(0),
    currency: vine.string().fixedLength(3),
    planInterval: vine.enum(['month', 'year']).optional(),
  })
)

export const updateSubscriptionValidator = vine.compile(
  vine.object({
    customerId: vine.string().uuid().optional(),
    status: vine.enum(['active', 'canceled', 'past_due', 'trialing']).optional(),
    currentPeriodStart: vine.string().optional(),
    currentPeriodEnd: vine.string().optional(),
    cancelAtPeriodEnd: vine.boolean().optional(),
    stripeSubscriptionId: vine.string().minLength(1).optional(),
    planAmount: vine.number().min(0).optional(),
    currency: vine.string().fixedLength(3).optional(),
    planInterval: vine.enum(['month', 'year']).optional(),
  })
)
