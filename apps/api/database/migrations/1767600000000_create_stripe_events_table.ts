import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stripe_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('event_id').primary()
      table.string('event_type').notNullable()
      table.timestamp('processed_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
