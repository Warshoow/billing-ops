import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import type { Subscription as SubscriptionResponse } from '@repo/shared-types'
import stripeService from '#services/stripe_service'
import {
  storeSubscriptionValidator,
  updateSubscriptionValidator,
} from '#validators/subscription_validator'

export default class SubscriptionsController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 50)

    const query = Subscription.query()
      .preload('customer')
      .if(request.input('status'), (q) => q.where('status', request.input('status')))
      .orderBy('createdAt', 'desc')

    const result = await query.paginate(page, perPage)
    return result.serialize()
  }

  async show({ params }: HttpContext): Promise<SubscriptionResponse> {
    const subscription = await Subscription.findOrFail(params.id)
    await subscription.load('customer')

    const response: SubscriptionResponse = subscription.serialize() as SubscriptionResponse

    return response
  }

  async store({ request }: HttpContext): Promise<SubscriptionResponse> {
    const data = await request.validateUsing(storeSubscriptionValidator)

    const subscription = await Subscription.create(data)

    const response: SubscriptionResponse = subscription.serialize() as SubscriptionResponse

    return response
  }

  async update({ params, request }: HttpContext): Promise<SubscriptionResponse> {
    const subscription = await Subscription.findOrFail(params.id)
    const data = await request.validateUsing(updateSubscriptionValidator)

    subscription.merge(data)
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

      // Update local subscription status
      subscription.status = 'canceled'
      await subscription.save()

      return response.ok(result)
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }
}
