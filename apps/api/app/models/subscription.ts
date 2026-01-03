import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Customer from './customer.js'

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare customerId: string

  @column()
  declare status: 'active' | 'canceled' | 'past_due' | 'trialing'

  @column.dateTime({
    serialize: (value: DateTime | null) => {
      return value?.toISO() ?? value
    },
  })
  declare currentPeriodStart: DateTime

  @column.dateTime({
    serialize: (value: DateTime | null) => {
      return value?.toISO() ?? value
    },
  })
  declare currentPeriodEnd: DateTime

  @column()
  declare cancelAtPeriodEnd: boolean

  @column()
  declare stripeSubscriptionId: string

  @column()
  declare planAmount: number

  @column()
  declare currency: string

  @column()
  declare planInterval: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>
}
