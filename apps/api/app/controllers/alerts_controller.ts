import type { HttpContext } from '@adonisjs/core/http'
import Alert from '#models/alert'
import type { Alert as AlertType } from '@repo/shared-types'

export default class AlertsController {
  async index({}: HttpContext) {
    const alerts = await Alert.query().preload('customer')
    
    // Transformation en type partagé
    const response: AlertType[] = alerts.map(alert => ({
      id: alert.id,
      customerId: alert.customerId,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      resolved: alert.resolved,
      createdAt: alert.createdAt.toISO()!, // DateTime → string ISO
      updatedAt: alert.updatedAt.toISO()!,
      customer: alert.customer
    }))

    return response
  }
}