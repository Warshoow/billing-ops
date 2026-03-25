import vine from '@vinejs/vine'

export const storeCustomerValidator = vine.compile(
  vine.object({
    externalUserId: vine.string().minLength(1),
    email: vine.string().email(),
    stripeCustomerId: vine.string().optional(),
    status: vine.enum(['active', 'at_risk', 'churned']),
    lifetimeValue: vine.number().min(0).optional(),
  })
)

export const updateCustomerValidator = vine.compile(
  vine.object({
    externalUserId: vine.string().minLength(1).optional(),
    email: vine.string().email().optional(),
    stripeCustomerId: vine.string().optional(),
    status: vine.enum(['active', 'at_risk', 'churned']).optional(),
    lifetimeValue: vine.number().min(0).optional(),
  })
)
