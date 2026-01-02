import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import Payment from '#models/payment'
import { DashboardMetrics } from '@repo/shared-types'
import db from '@adonisjs/lucid/services/db'

export default class MetricsController {
  async index({ response }: HttpContext): Promise<DashboardMetrics> {
    // 1. MRR Calculation (Sum of planAmount for active subscriptions)
    // Assuming monthly billing for MVP simplicity. If yearly, we'd need to divide by 12.
    // Ideally we verify planInterval.
    const mrrResult = await Subscription.query()
      .where('status', 'active')
      .sum('plan_amount as total')
      .first()

    const mrr = mrrResult?.$extras.total || 0

    // 2. Active Subscriptions Count
    const activeSubsResult = await Subscription.query()
      .where('status', 'active')
      .count('* as total')
      .first()

    const activeSubscriptions = activeSubsResult?.$extras.total || 0

    // 3. Failed Payments Count (Total or last X days - let's do all time for now or last 30d)
    const failedPaymentsResult = await Payment.query()
      .where('status', 'failed')
      .count('* as total')
      .first()

    const failedPaymentsCount = failedPaymentsResult?.$extras.total || 0

    // 4. Churn Rate Calculation
    // Simple logic: (Cancelled Subscriptions / Total Subscriptions) * 100
    const totalSubsResult = await Subscription.query().count('* as total').first()
    const cancelledSubsResult = await Subscription.query()
      .where('status', 'canceled')
      .count('* as total')
      .first()

    const totalSubs = Number(totalSubsResult?.$extras.total || 0)
    const cancelledSubs = Number(cancelledSubsResult?.$extras.total || 0)

    const churnRate = totalSubs > 0 ? (cancelledSubs / totalSubs) * 100 : 0

    // 5. MRR Growth (Mocked for now as we don't store snapshots)
    const mrrGrowth = 0

    return {
      mrr: Number(mrr),
      activeSubscriptions: Number(activeSubscriptions),
      failedPaymentsCount: Number(failedPaymentsCount),
      churnRate: Number(churnRate),
      mrrGrowth,
    }
  }
}
