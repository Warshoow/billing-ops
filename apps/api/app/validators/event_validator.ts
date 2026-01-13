import vine from '@vinejs/vine'

/**
 * Validator for user.created event
 */
const userCreatedSchema = vine.object({
  event: vine.literal('user.created'),
  data: vine.object({
    external_user_id: vine.string().minLength(1),
    email: vine.string().email(),
  }),
})

/**
 * Validator for user.updated event
 */
const userUpdatedSchema = vine.object({
  event: vine.literal('user.updated'),
  data: vine.object({
    external_user_id: vine.string().minLength(1),
    email: vine.string().email().optional(),
  }),
})

/**
 * Union validator for all billing ops events
 */
export const billingOpsEventValidator = vine.compile(
  vine.union([userCreatedSchema, userUpdatedSchema])
)
