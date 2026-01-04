import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Payment from './payment.js'
import Subscription from './subscription.js'
import Alert from './alert.js'

export default class Customer extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare externalUserId: string

  @column()
  declare email: string

  @column()
  declare stripeCustomerId: string

  @column()
  declare status: 'active' | 'at_risk' | 'churned'

  @column()
  declare lifetimeValue: number

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime | null) => {
      return value?.toISO() ?? value
    },
  })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    serialize: (value: DateTime | null) => {
      return value?.toISO() ?? value
    },
  })
  declare updatedAt: DateTime

  // Relations
  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>

  @hasMany(() => Subscription)
  declare subscriptions: HasMany<typeof Subscription>

  @hasMany(() => Alert)
  declare alerts: HasMany<typeof Alert>
}
