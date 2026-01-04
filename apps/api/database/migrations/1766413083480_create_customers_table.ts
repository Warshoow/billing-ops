import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('external_user_id').notNullable().unique()
      table.string('email').notNullable()
      table.string('stripe_customer_id').notNullable().unique()
      table.enum('status', ['active', 'at_risk', 'churned']).defaultTo('active')
      table.decimal('lifetime_value', 12, 2).defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
