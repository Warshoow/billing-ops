import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE')
      table.decimal('amount', 12, 2).notNullable()
      table.string('currency', 3).notNullable()
      table.enum('status', ['succeeded', 'failed', 'pending']).notNullable()
      table.string('stripe_payment_id').notNullable().unique()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index('customer_id')
      table.index('status')
      table.index('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}