/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const WebhooksController = () => import('#controllers/webhooks_controller')
const EventsController = () => import('#controllers/events_controller')
const SubscriptionsController = () => import('#controllers/subscriptions_controller')
const CustomersController = () => import('#controllers/customers_controller')
const AlertsController = () => import('#controllers/alerts_controller')
const PaymentsController = () => import('#controllers/payments_controller')
const MetricsController = () => import('#controllers/metrics_controller')

// Metrics
router.get('/metrics', [MetricsController, 'index'])

// Customers
router.get('/customers', [CustomersController, 'index'])
router.get('/customers/:id', [CustomersController, 'show'])
router.post('/customers', [CustomersController, 'store'])
router.put('/customers/:id', [CustomersController, 'update'])
router.delete('/customers/:id', [CustomersController, 'destroy'])

// Alerts
router.get('/alerts', [AlertsController, 'index'])
router.get('/alerts/:id', [AlertsController, 'show'])
router.post('/alerts', [AlertsController, 'store'])
router.put('/alerts/:id', [AlertsController, 'update'])
router.delete('/alerts/:id', [AlertsController, 'destroy'])

// Payments
router.get('/payments', [PaymentsController, 'index'])
router.get('/payments/:id', [PaymentsController, 'show'])
router.post('/payments', [PaymentsController, 'store'])
router.post('/payments/:id/retry', [PaymentsController, 'retry']) // [NEW] Retry action
router.put('/payments/:id', [PaymentsController, 'update'])
router.delete('/payments/:id', [PaymentsController, 'destroy'])

// Subscriptions
router.get('/subscriptions', [SubscriptionsController, 'index'])
router.get('/subscriptions/:id', [SubscriptionsController, 'show'])
router.post('/subscriptions', [SubscriptionsController, 'store'])
router.post('/subscriptions/:id/cancel', [SubscriptionsController, 'cancel']) // [NEW] Cancel action
router.put('/subscriptions/:id', [SubscriptionsController, 'update'])
router.delete('/subscriptions/:id', [SubscriptionsController, 'destroy'])

// Ingestion
router.post('/events', [EventsController, 'store']) // SaaS Events
router.post('/webhooks/stripe', [WebhooksController, 'handle']) // Stripe Webhooks

// Simulation (Demo only)
const SimulationController = () => import('#controllers/simulation_controller')
router
  .group(() => {
    router.post('/payment_failed', [SimulationController, 'paymentFailed'])
    router.post('/churn', [SimulationController, 'churn'])
    router.post('/onboarding', [SimulationController, 'onboarding'])
  })
  .prefix('/simulation')
