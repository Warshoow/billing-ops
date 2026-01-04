import Customer from '#models/customer'
import type { HttpContext } from '@adonisjs/core/http'
import type { Customer as CustomerResponse } from '@repo/shared-types'

export default class CustomersController {
  async index({}: HttpContext): Promise<CustomerResponse[]> {
    const customers = await Customer.all()

    const response: CustomerResponse[] = customers.map(
      (customer) => customer.serialize() as CustomerResponse
    )

    return response
  }

  async show({ params }: HttpContext): Promise<CustomerResponse> {
    const customer = await Customer.findOrFail(params.id)

    const response: CustomerResponse = customer.serialize() as CustomerResponse

    return response
  }

  async store({ request }: HttpContext): Promise<CustomerResponse> {
    const customer = await Customer.create({
      externalUserId: request.input('externalUserId'),
      email: request.input('email'),
      stripeCustomerId: request.input('stripeCustomerId'),
      status: request.input('status'),
      lifetimeValue: request.input('lifetimeValue'),
    })

    const response: CustomerResponse = customer.serialize() as CustomerResponse

    return response
  }

  async update({ params, request }: HttpContext): Promise<CustomerResponse> {
    const customer = await Customer.findOrFail(params.id)

    customer.merge({
      externalUserId: request.input('externalUserId'),
      email: request.input('email'),
      stripeCustomerId: request.input('stripeCustomerId'),
      status: request.input('status'),
      lifetimeValue: request.input('lifetimeValue'),
    })

    await customer.save()

    const response: CustomerResponse = customer.serialize() as CustomerResponse

    return response
  }

  async destroy({ params }: HttpContext): Promise<void> {
    const customer = await Customer.findOrFail(params.id)

    await customer.delete()
  }
}
