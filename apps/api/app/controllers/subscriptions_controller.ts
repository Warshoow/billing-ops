import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import type { Subscription as SubscriptionResponse } from '@repo/shared-types'
import stripeService from '#services/stripe_service'

export default class SubscriptionsController {
  async index({}: HttpContext): Promise<SubscriptionResponse[]> {
    const subscriptions = await Subscription.query().preload('customer')

    const response: SubscriptionResponse[] = subscriptions.map(
      (subscription) => subscription.serialize() as SubscriptionResponse
    )

    return response
  }

  async show({ params }: HttpContext): Promise<SubscriptionResponse> {
    const subscription = await Subscription.findOrFail(params.id)

    const response: SubscriptionResponse = subscription.serialize() as SubscriptionResponse

    return response
  }

  async store({ request }: HttpContext): Promise<SubscriptionResponse> {
    const subscription = await Subscription.create({
      customerId: request.input('customerId'),
      status: request.input('status'),
      currentPeriodStart: request.input('currentPeriodStart'),
      currentPeriodEnd: request.input('currentPeriodEnd'),
      cancelAtPeriodEnd: request.input('cancelAtPeriodEnd'),
      stripeSubscriptionId: request.input('stripeSubscriptionId'),
      planAmount: request.input('planAmount'),
      currency: request.input('currency'),
    })

    const response: SubscriptionResponse = subscription.serialize() as SubscriptionResponse

    return response
  }

  async update({ params, request }: HttpContext): Promise<SubscriptionResponse> {
    const subscription = await Subscription.findOrFail(params.id)

    subscription.merge({
      customerId: request.input('customerId'),
      status: request.input('status'),
      currentPeriodStart: request.input('currentPeriodStart'),
      currentPeriodEnd: request.input('currentPeriodEnd'),
      cancelAtPeriodEnd: request.input('cancelAtPeriodEnd'),
      stripeSubscriptionId: request.input('stripeSubscriptionId'),
      planAmount: request.input('planAmount'),
      currency: request.input('currency'),
    })

    await subscription.save()

    const response: SubscriptionResponse = subscription.serialize() as SubscriptionResponse

    return response
  }

  async destroy({ params }: HttpContext): Promise<void> {
    const subscription = await Subscription.findOrFail(params.id)

    await subscription.delete()
  }

  async cancel({ params, response }: HttpContext) {
    const subscription = await Subscription.findOrFail(params.id)

    if (!subscription.stripeSubscriptionId) {
      return response.badRequest({ message: 'No Stripe Subscription ID found' })
    }

    try {
      const result = await stripeService.cancelSubscription(subscription.stripeSubscriptionId)
      return response.ok(result)
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }
}
