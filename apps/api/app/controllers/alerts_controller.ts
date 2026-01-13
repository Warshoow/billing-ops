import type { HttpContext } from '@adonisjs/core/http'
import Alert from '#models/alert'
import type { Alert as AlertResponse } from '@repo/shared-types'
import { createAlertValidator, updateAlertValidator } from '#validators/alert_validator'

export default class AlertsController {
  async index({}: HttpContext): Promise<AlertResponse[]> {
    const alerts = await Alert.query().preload('customer')

    const response: AlertResponse[] = alerts.map((alert) => alert.serialize() as AlertResponse)

    return response
  }

  async show({ params }: HttpContext): Promise<AlertResponse> {
    const alert = await Alert.findOrFail(params.id)

    const response: AlertResponse = alert.serialize() as AlertResponse

    return response
  }

  async store({ request }: HttpContext): Promise<AlertResponse> {
    const payload = await request.validateUsing(createAlertValidator)

    const alert = await Alert.create(payload)

    const response: AlertResponse = alert.serialize() as AlertResponse

    return response
  }

  async update({ params, request }: HttpContext): Promise<AlertResponse> {
    const alert = await Alert.findOrFail(params.id)

    const payload = await request.validateUsing(updateAlertValidator)

    alert.merge(payload)

    await alert.save()

    const response: AlertResponse = alert.serialize() as AlertResponse

    return response
  }

  async destroy({ params }: HttpContext): Promise<void> {
    const alert = await Alert.findOrFail(params.id)

    await alert.delete()
  }
}
