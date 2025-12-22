import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alerts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE')
      table.enum('type', ['payment_failed', 'subscription_at_risk', 'churn']).notNullable()
      table.enum('severity', ['low', 'medium', 'high', 'critical']).notNullable()
      table.text('message').notNullable()
      table.boolean('resolved').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index('customer_id')
      table.index('type')
      table.index('severity')
      table.index('resolved')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}