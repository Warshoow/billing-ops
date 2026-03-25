import type { HttpContext } from '@adonisjs/core/http'
import Payment from '#models/payment'
import stripeService from '#services/stripe_service'
import { storePaymentValidator, updatePaymentValidator } from '#validators/payment_validator'

export default class PaymentsController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 50)

    const query = Payment.query()
      .preload('customer')
      .if(request.input('status'), (q) => q.where('status', request.input('status')))
      .orderBy('createdAt', 'desc')

    const result = await query.paginate(page, perPage)
    return result.serialize()
  }

  async show({ params }: HttpContext) {
    const payment = await Payment.findOrFail(params.id)
    await payment.load('customer')

    return payment.serialize()
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(storePaymentValidator)

    const payment = await Payment.create(data)

    return payment.serialize()
  }

  async update({ params, request }: HttpContext) {
    const payment = await Payment.findOrFail(params.id)
    const data = await request.validateUsing(updatePaymentValidator)

    payment.merge(data)
    await payment.save()

    return payment.serialize()
  }

  async destroy({ params }: HttpContext): Promise<void> {
    const payment = await Payment.findOrFail(params.id)

    await payment.delete()
  }

  async retry({ params, response }: HttpContext) {
    const payment = await Payment.findOrFail(params.id)

    if (!payment.stripePaymentId) {
      return response.badRequest({ message: 'No Stripe Payment ID found for this payment' })
    }

    try {
      const result = await stripeService.retryPayment(payment.stripePaymentId)

      // Update local payment status optimistically
      payment.status = result.status === 'succeeded' ? 'succeeded' : 'pending'
      payment.retryCount = (payment.retryCount || 0) + 1
      if (result.status === 'succeeded') {
        payment.failureCode = null
        payment.failureMessage = null
      }
      await payment.save()

      return response.ok(result)
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }
}
