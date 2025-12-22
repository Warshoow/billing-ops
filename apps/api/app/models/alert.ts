import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Customer from './customer.js'

export default class Alert extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare customerId: number

  @column()
  declare type: 'payment_failed' | 'subscription_at_risk' | 'churn'

  @column()
  declare severity: 'low' | 'medium' | 'high' | 'critical'

  @column()
  declare message: string

  @column()
  declare resolved: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>
}