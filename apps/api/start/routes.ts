/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const CustomersController = () => import('#controllers/customers_controller')
const AlertsController = () => import('#controllers/alerts_controller')
const PaymentsController = () => import('#controllers/payments_controller')

router.get('/customers', [CustomersController, 'index'])
router.get('/customers/:id', [CustomersController, 'show'])
router.post('/customers', [CustomersController, 'store'])
router.put('/customers/:id', [CustomersController, 'update'])
router.delete('/customers/:id', [CustomersController, 'destroy'])

router.get('/alerts', [AlertsController, 'index'])
router.get('/alerts/:id', [AlertsController, 'show'])
router.post('/alerts', [AlertsController, 'store'])
router.put('/alerts/:id', [AlertsController, 'update'])
router.delete('/alerts/:id', [AlertsController, 'destroy'])

router.get('/payments', [PaymentsController, 'index'])
router.get('/payments/:id', [PaymentsController, 'show'])
router.post('/payments', [PaymentsController, 'store'])
router.put('/payments/:id', [PaymentsController, 'update'])
router.delete('/payments/:id', [PaymentsController, 'destroy'])


