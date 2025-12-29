import type { HttpContext } from '@adonisjs/core/http'
import Alert from '#models/alert'
import type { Alert as AlertResponse } from '@repo/shared-types'

export default class AlertsController {
  async index({}: HttpContext): Promise<AlertResponse[]> {
    const alerts = await Alert.query().preload('customer')
    
    const response: AlertResponse[] = alerts.map(
      (alert) => alert.serialize() as AlertResponse
    )

    return response
  }

  async show({ params }: HttpContext): Promise<AlertResponse> {
    const alert = await Alert.findOrFail(params.id)

    const response: AlertResponse = alert.serialize() as AlertResponse

    return response
  }

  async store({ request }: HttpContext): Promise<AlertResponse> {
    const alert = await Alert.create({
      customerId: request.input('customerId'),
      type: request.input('type'),
      severity: request.input('severity'),
      message: request.input('message'),
      resolved: request.input('resolved'),
    })

    const response: AlertResponse = alert.serialize() as AlertResponse

    return response
  }

  async update({ params, request }: HttpContext): Promise<AlertResponse> {
    const alert = await Alert.findOrFail(params.id)

    alert.merge({
      customerId: request.input('customerId'),
      type: request.input('type'),
      severity: request.input('severity'),
      message: request.input('message'),
      resolved: request.input('resolved'),
    })

    await alert.save()

    const response: AlertResponse = alert.serialize() as AlertResponse

    return response
  }

  async destroy({ params }: HttpContext): Promise<void> {
    const alert = await Alert.findOrFail(params.id)

    await alert.delete()
  }
}