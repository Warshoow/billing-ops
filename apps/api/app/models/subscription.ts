import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Customer from './customer.js'

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare customerId: number

  @column()
  declare status: 'active' | 'canceled' | 'past_due' | 'trialing'

  @column.dateTime({ 
    serialize: (value: DateTime|null) => {
      return value?.toISO() ?? value
    }
  })
  declare currentPeriodStart: DateTime

  @column.dateTime({ 
    serialize: (value: DateTime|null) => {
      return value?.toISO() ?? value
    }
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

  @column.dateTime({ 
    autoCreate: true,
    serialize: (value: DateTime|null) => {
      return value?.toISO() ?? value
    }
  })
  declare createdAt: DateTime

  @column.dateTime({ 
    autoCreate: true,
    autoUpdate: true,
    serialize: (value: DateTime|null) => {
      return value?.toISO() ?? value
    }
  })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>
}