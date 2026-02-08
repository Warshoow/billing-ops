import vine from '@vinejs/vine'

export const createCustomerValidator = vine.compile(
  vine.object({
    externalUserId: vine.string().minLength(1),
    email: vine.string().email(),
    name: vine.string().optional(),
  })
)

export const createSubscriptionValidator = vine.compile(
  vine.object({
    externalUserId: vine.string().minLength(1),
    priceId: vine.string().minLength(1),
    successUrl: vine.string().url(),
    cancelUrl: vine.string().url(),
  })
)

export const cancelSubscriptionValidator = vine.compile(
  vine.object({
    externalUserId: vine.string().minLength(1),
    subscriptionId: vine.string().minLength(1).optional(),
    cancelAtPeriodEnd: vine.boolean().optional(),
  })
)

export const retryPaymentValidator = vine.compile(
  vine.object({
    paymentIntentId: vine.string().minLength(1),
  })
)
