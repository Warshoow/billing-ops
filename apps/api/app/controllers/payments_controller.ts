import type { HttpContext } from '@adonisjs/core/http'
import type { Payment as PaymentResponse } from '@repo/shared-types'
import Payment from '#models/payment'
import stripeService from '#services/stripe_service'

export default class PaymentsController {
  async index({ request }: HttpContext): Promise<PaymentResponse[]> {
    const payments = await Payment.query()
      .preload('customer')
      .if(request.input('status'), (query) => query.where('status', request.input('status')))

    const response: PaymentResponse[] = payments.map(
      (payment) => payment.serialize() as PaymentResponse
    )

    return response
  }

  async show({ params }: HttpContext): Promise<PaymentResponse> {
    const payment = await Payment.findOrFail(params.id)

    const response: PaymentResponse = payment.serialize() as PaymentResponse

    return response
  }

  async store({ request }: HttpContext): Promise<PaymentResponse> {
    const payment = await Payment.create({
      customerId: request.input('customerId'),
      amount: request.input('amount'),
      currency: request.input('currency'),
      status: request.input('status'),
      stripePaymentId: request.input('stripePaymentId'),
    })

    const response: PaymentResponse = payment.serialize() as PaymentResponse

    return response
  }

  async update({ params, request }: HttpContext): Promise<PaymentResponse> {
    const payment = await Payment.findOrFail(params.id)

    payment.merge({
      customerId: request.input('customerId'),
      amount: request.input('amount'),
      currency: request.input('currency'),
      status: request.input('status'),
      stripePaymentId: request.input('stripePaymentId'),
    })

    await payment.save()

    const response: PaymentResponse = payment.serialize() as PaymentResponse

    return response
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
      return response.ok(result)
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }
}
