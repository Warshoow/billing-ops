import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Customer from './customer.js'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare customerId: number

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare status: 'succeeded' | 'failed' | 'pending'

  @column()
  declare stripePaymentId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>
}