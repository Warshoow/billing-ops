import Customer from '#models/customer'
import type { HttpContext } from '@adonisjs/core/http'
import type { Customer as CustomerResponse } from '@repo/shared-types'

export default class CustomersController {
  async index({}: HttpContext) {
    const curstomers = await Customer.all()

    const response: CustomerResponse[] = curstomers.map((customer) => {
      return {
        id: customer.id,
        externalUserId: customer.externalUserId,
        email: customer.email,
        stripeCustomerId: customer.stripeCustomerId,
        status: customer.status,
        lifetimeValue: customer.lifetimeValue,
        createdAt: customer.createdAt?.toISO() ?? null,
        updatedAt: customer.updatedAt?.toISO() ?? null,
      }
    })

    return response
  }
}
