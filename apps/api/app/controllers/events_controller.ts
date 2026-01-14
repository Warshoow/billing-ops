import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/customer'
import { billingOpsEventValidator } from '#validators/event_validator'

export default class EventsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(billingOpsEventValidator)

    console.log(`[Events] Received event: ${payload.event}`)

    switch (payload.event) {
      case 'user.created':
        await this.handleUserCreated(payload.data)
        break
      case 'user.updated':
        await this.handleUserUpdated(payload.data)
        break
      default:
        console.warn(`[Events] Unhandled event type: ${payload.event}`)
    }

    return response.ok({ status: 'received' })
  }

  private async handleUserCreated(data: any) {
    // Upsert customer based on externalUserId or email
    await Customer.updateOrCreate(
      { externalUserId: data.external_user_id },
      {
        email: data.email,
        externalUserId: data.external_user_id,
        // name isn't in our model yet, but could be added
        status: 'active', // Default status
      }
    )
    console.log(`[Events] Customer created/updated: ${data.external_user_id}`)
  }

  private async handleUserUpdated(data: any) {
    const customer = await Customer.findBy('externalUserId', data.external_user_id)
    if (customer) {
      if (data.email) customer.email = data.email
      await customer.save()
      console.log(`[Events] Customer updated: ${data.external_user_id}`)
    } else {
      console.warn(`[Events] Customer not found for update: ${data.external_user_id}`)
    }
  }
}
