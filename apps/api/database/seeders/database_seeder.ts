import { CustomerFactory } from '#database/factories/customer_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Customer from '#models/customer'
import Payment from '#models/payment'
import Subscription from '#models/subscription'
import Alert from '#models/alert'

export default class extends BaseSeeder {
  async run() {
    console.log('[Seeder] Truncating existing data...')

    // Ordre important : supprimer les dépendances avant les customers
    await Alert.query().delete()
    await Payment.query().delete()
    await Subscription.query().delete()
    await Customer.query().delete()

    console.log('[Seeder] ✅ Data truncated')
    console.log('[Seeder] Creating customers with payments, subscriptions, and alerts...')

    // Scénario 1: 10 clients actifs avec abonnements et historique de paiements
    await CustomerFactory.merge({ status: 'active' })
      .with('subscriptions', 1, (subscription) => {
        subscription.merge({ status: 'active', cancelAtPeriodEnd: false })
      })
      .with('payments', 6, (payment) => {
        payment.merge({ status: 'succeeded' })
      })
      .with('alerts', 1, (alert) => {
        alert.merge({ type: 'subscription_at_risk', severity: 'low', resolved: true })
      })
      .createMany(10)

    // Scénario 2: 5 clients actifs avec des paiements échoués récents
    await CustomerFactory.merge({ status: 'active' })
      .with('subscriptions', 1, (subscription) => {
        subscription.merge({ status: 'active', cancelAtPeriodEnd: false })
      })
      .with('payments', 5, (payment) => {
        // Les 3 premiers réussis, les 2 derniers échoués
        payment.merge({ status: 'succeeded' })
      })
      .with('payments', 2, (payment) => {
        payment.merge({ status: 'failed' })
      })
      .with('alerts', 2, (alert) => {
        alert.merge({ type: 'payment_failed', severity: 'critical', resolved: false })
      })
      .createMany(5)

    // Scénario 3: 3 clients à risque avec abonnements qui vont être annulés
    await CustomerFactory.merge({ status: 'at_risk' })
      .with('subscriptions', 1, (subscription) => {
        subscription.merge({ status: 'active', cancelAtPeriodEnd: true })
      })
      .with('payments', 4, (payment) => {
        payment.merge({ status: 'succeeded' })
      })
      .with('payments', 1, (payment) => {
        payment.merge({ status: 'failed' })
      })
      .with('alerts', 3, (alert) => {
        alert.merge({ type: 'subscription_at_risk', severity: 'high', resolved: false })
      })
      .createMany(3)

    // Scénario 4: 2 clients churned (abonnements annulés)
    await CustomerFactory.merge({ status: 'churned', lifetimeValue: 0 })
      .with('subscriptions', 1, (subscription) => {
        subscription.merge({ status: 'canceled', cancelAtPeriodEnd: true })
      })
      .with('payments', 3, (payment) => {
        payment.merge({ status: 'succeeded' })
      })
      .with('alerts', 1, (alert) => {
        alert.merge({ type: 'churn', severity: 'critical', resolved: false })
      })
      .createMany(2)

    console.log('[Seeder] ✅ Created 20 customers with realistic data:')
    console.log('  - 10 active customers with successful payments')
    console.log('  - 5 active customers with failed payments')
    console.log('  - 3 at-risk customers with pending cancellations')
    console.log('  - 2 churned customers')
  }
}
