import type { HttpContext } from '@adonisjs/core/http'
import type { Payment as PaymentType } from '@repo/shared-types'
import Payment from '#models/payment'

export default class PaymentsController {
  async index({}: HttpContext) {
    const payments = await Payment.query().preload('customer')
    
    // Transformation en type partagé
    const response: PaymentType[] = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      customerId: payment.customerId,
      stripePaymentId: payment.stripePaymentId,
      createdAt: payment.createdAt.toISO()!, // DateTime → string ISO
      updatedAt: payment.updatedAt.toISO()!,
      customer: payment.customer
    }))

    return response
  }
}