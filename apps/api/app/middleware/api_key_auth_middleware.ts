import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class ApiKeyAuthMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const apiKey = request.header('x-api-key')
    const expectedKey = env.get('BILLING_API_KEY')

    if (!apiKey || apiKey !== expectedKey) {
      return response.unauthorized({
        error: 'unauthorized',
        message: 'Invalid or missing API key. Provide a valid x-api-key header.',
      })
    }

    return next()
  }
}
