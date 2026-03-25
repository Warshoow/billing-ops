import Customer from '#models/customer'
import type { HttpContext } from '@adonisjs/core/http'
import type { Customer as CustomerResponse } from '@repo/shared-types'
import { storeCustomerValidator, updateCustomerValidator } from '#validators/customer_validator'

export default class CustomersController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 50)

    const query = Customer.query()
      .if(request.input('status'), (q) => q.where('status', request.input('status')))
      .orderBy('createdAt', 'desc')

    const result = await query.paginate(page, perPage)
    return result.serialize()
  }

  async show({ params }: HttpContext): Promise<CustomerResponse> {
    const customer = await Customer.findOrFail(params.id)

    const response: CustomerResponse = customer.serialize() as CustomerResponse

    return response
  }

  async store({ request }: HttpContext): Promise<CustomerResponse> {
    const data = await request.validateUsing(storeCustomerValidator)

    const customer = await Customer.create({
      externalUserId: data.externalUserId,
      email: data.email,
      stripeCustomerId: data.stripeCustomerId,
      status: data.status,
      lifetimeValue: data.lifetimeValue ?? 0,
    })

    const response: CustomerResponse = customer.serialize() as CustomerResponse

    return response
  }

  async update({ params, request }: HttpContext): Promise<CustomerResponse> {
    const customer = await Customer.findOrFail(params.id)
    const data = await request.validateUsing(updateCustomerValidator)

    customer.merge(data)
    await customer.save()

    const response: CustomerResponse = customer.serialize() as CustomerResponse

    return response
  }

  async destroy({ params }: HttpContext): Promise<void> {
    const customer = await Customer.findOrFail(params.id)

    await customer.delete()
  }
}
