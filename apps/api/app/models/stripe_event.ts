import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class StripeEvent extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare eventId: string

  @column()
  declare eventType: string

  @column.dateTime()
  declare processedAt: DateTime
}
