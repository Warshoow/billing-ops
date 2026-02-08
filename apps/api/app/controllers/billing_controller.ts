import type { HttpContext } from '@adonisjs/core/http'
import billingService from '#services/billing_service'
import { BillingError } from '#exceptions/billing_errors'
import {
  createCustomerValidator,
  createSubscriptionValidator,
  cancelSubscriptionValidator,
  retryPaymentValidator,
} from '#validators/billing_validator'

export default class BillingController {
  async createCustomer({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createCustomerValidator)
      const result = await billingService.createCustomer(data)
      return response.created(result)
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  async createSubscription({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createSubscriptionValidator)
      const result = await billingService.createSubscription(data)
      return response.created(result)
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  async cancelSubscription({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(cancelSubscriptionValidator)
      const result = await billingService.cancelSubscription(data)
      return response.ok(result)
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  async retryPayment({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(retryPaymentValidator)
      const result = await billingService.retryPayment(data)
      return response.ok(result)
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  private handleError(response: HttpContext['response'], error: unknown) {
    if (error instanceof BillingError) {
      return response.status(error.status).json(error.toJSON())
    }
    // Let VineJS validation errors and other exceptions pass through AdonisJS default handler
    throw error
  }
}
