import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE')
      table.enum('status', ['active', 'canceled', 'past_due', 'trialing']).notNullable()
      table.timestamp('current_period_start', { useTz: true }).notNullable()
      table.timestamp('current_period_end', { useTz: true }).notNullable()
      table.boolean('cancel_at_period_end').defaultTo(false)
      table.string('stripe_subscription_id').notNullable().unique()
      table.decimal('plan_amount', 12, 2).notNullable()
      table.string('currency', 3).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index('customer_id')
      table.index('status')
      table.index('current_period_end')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}