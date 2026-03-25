import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('failure_code').nullable()
      table.text('failure_message').nullable()
      table.integer('retry_count').defaultTo(0).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('failure_code')
      table.dropColumn('failure_message')
      table.dropColumn('retry_count')
    })
  }
}
