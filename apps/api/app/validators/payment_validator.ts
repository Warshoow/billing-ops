import vine from '@vinejs/vine'

export const storePaymentValidator = vine.compile(
  vine.object({
    customerId: vine.string().uuid(),
    amount: vine.number().positive(),
    currency: vine.string().fixedLength(3),
    status: vine.enum(['succeeded', 'failed', 'pending']),
    stripePaymentId: vine.string().minLength(1),
  })
)

export const updatePaymentValidator = vine.compile(
  vine.object({
    customerId: vine.string().uuid().optional(),
    amount: vine.number().positive().optional(),
    currency: vine.string().fixedLength(3).optional(),
    status: vine.enum(['succeeded', 'failed', 'pending']).optional(),
    stripePaymentId: vine.string().minLength(1).optional(),
  })
)
