export class BillingError extends Error {
  public status: number
  public code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.status = status
    this.code = code
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
    }
  }
}

export class CustomerNotFoundError extends BillingError {
  constructor(identifier: string) {
    super(`Customer not found: ${identifier}`, 404, 'customer_not_found')
  }
}

export class StripeOperationError extends BillingError {
  public stripeCode?: string

  constructor(message: string, stripeCode?: string) {
    super(message, 502, 'stripe_error')
    this.stripeCode = stripeCode
  }
}

export class InvalidBillingRequestError extends BillingError {
  constructor(message: string) {
    super(message, 422, 'invalid_request')
  }
}

export class BillingConflictError extends BillingError {
  constructor(message: string) {
    super(message, 409, 'conflict')
  }
}
