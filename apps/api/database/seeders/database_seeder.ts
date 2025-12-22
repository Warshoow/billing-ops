import { CustomerFactory } from '#database/factories/customer_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Créer 20 customers avec leurs relations
    await CustomerFactory
      .with('payments', 5) // 5 paiements par customer
      .with('subscriptions', 1) // 1 abonnement par customer
      .with('alerts', 2) // 2 alertes par customer
      .createMany(20)
  }
}