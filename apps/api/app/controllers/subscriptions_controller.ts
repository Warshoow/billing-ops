import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import type { Subscription as SubscriptionType } from '@repo/shared-types'

export default class SubscriptionsController {
  async index({}: HttpContext) {
    const subscriptions = await Subscription.query().preload('customer')
    
    // Transformation en type partagé
    const response: SubscriptionType[] = subscriptions.map(subscription => ({
      id: subscription.id,
      customerId: subscription.customerId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISO()!, // DateTime → string ISO
      currentPeriodEnd: subscription.currentPeriodEnd.toISO()!,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      planAmount: subscription.planAmount,
      currency: subscription.currency,
      createdAt: subscription.createdAt.toISO()!,
      updatedAt: subscription.updatedAt.toISO()!,
      customer: subscription.customer
    }))

    return response
  }
}