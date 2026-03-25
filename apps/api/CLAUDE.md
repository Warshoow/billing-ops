# API — AdonisJS 6

## Stack

AdonisJS 6, Lucid ORM, PostgreSQL 15, Stripe SDK, VineJS validation, Japa testing.

## Key files

- `start/routes.ts` — all route definitions; webhook route is OUTSIDE the bodyparser group
- `start/kernel.ts` — middleware registration (server-level + named: `bodyparser`, `apiKey`)
- `start/env.ts` — env var schema and validation
- `adonisrc.ts` — AdonisJS providers and app config

## Route groups

| Prefix | Auth | Middleware | Purpose |
|--------|------|------------|---------|
| `/webhooks/stripe` | Stripe signature | none (raw body) | Webhook ingestion (idempotent) |
| `/` (default group) | none | none | Dashboard-facing CRUD + metrics |
| `/billing` | `x-api-key` | `bodyparser`, `apiKey` | SaaS write API |
| `/simulation` | none | none | Demo/test endpoints |

## Models (Lucid, UUID PKs)

- `Customer` — externalUserId, email, stripeCustomerId (nullable), status, lifetimeValue
- `Payment` — stripePaymentId, amount, currency, status, customerId (FK), failureCode, failureMessage, retryCount
- `Subscription` — stripeSubscriptionId, customerId (FK), status, period dates, plan details
- `Alert` — customerId (FK), type, severity, message, resolved, resolvedAt
- `StripeEvent` — eventId (PK), eventType, processedAt (used for webhook idempotency)

## Services

- `stripe_service.ts` — Stripe SDK wrapper (singleton). Read ops + write ops (createCustomer, createCheckoutSession, cancelSubscriptionGraceful, retryPayment).
- `stripe_event_handler.ts` — processes webhook events, upserts models, captures payment failure details (failure_code/message from Stripe), creates alerts on failure/churn.
- `billing_service.ts` — orchestrates billing write operations: resolves local customer, calls Stripe, updates DB optimistically.

## Validation

All CRUD controllers validate input via VineJS validators in `app/validators/`:
- `customer_validator.ts` — store/update customer (email format, status enum, lifetimeValue >= 0)
- `payment_validator.ts` — store/update payment (UUID customerId, positive amount, 3-char currency, status enum)
- `subscription_validator.ts` — store/update subscription (UUID customerId, status enum, plan interval enum, amount >= 0)
- `billing_validator.ts` — billing API endpoints (createCustomer, createSubscription, cancelSubscription, retryPayment)
- `alert_validator.ts` — store/update alerts
- `event_validator.ts` — event ingestion

## Error handling

- `billing_errors.ts` — typed error hierarchy (`BillingError` base with status/code). Subclasses: `CustomerNotFoundError` (404), `StripeOperationError` (502), `InvalidBillingRequestError` (422), `BillingConflictError` (409).
- Controller catches `BillingError` and returns structured JSON; other errors bubble to AdonisJS default handler.
- VineJS validation errors return 422 automatically via AdonisJS.

## Webhook idempotency

Processed Stripe event IDs are stored in the `stripe_events` table. When a webhook arrives, the controller checks if `event.id` already exists — if so, it returns `{ received: true, duplicate: true }` and skips processing. This prevents duplicate alerts and double-processing on Stripe retries.

## Pagination

List endpoints (`index()`) on customers, payments, and subscriptions support:
- `?page=1` — page number (default: 1)
- `?perPage=50` — items per page (default: 50)
- `?status=active` — optional status filter
- Results are ordered by `createdAt` desc and returned as Lucid paginated responses (`{ data, meta }`).

## Testing

```bash
node ace test                    # all tests
node ace test --files "tests/functional/**"  # functional only
node ace test --files "tests/unit/**"        # unit only
```

- Functional tests use `@japa/api-client` for HTTP assertions
- `billing_controller.spec.ts` — validation/error tests for billing API
- `billing_happy_path.spec.ts` — happy-path tests (validation passes, reaches Stripe layer)
- `payment_controller.spec.ts` — payment retry edge cases
- `metrics_controller.spec.ts` — MRR, churn, failed payments calculations
- `stripe_event_handler.spec.ts` — unit tests for webhook event processing
- Test bootstrap in `tests/bootstrap.ts`
- Factories in `database/factories/` for seeding test data

## Gotchas

- Stripe SDK is lazy-initialized — fails gracefully if `STRIPE_SECRET_KEY` is not set (returns null stripe instance, throws on use).
- `stripeCustomerId` is nullable on Customer — customers can exist locally before Stripe onboarding.
- Bodyparser is a named middleware, NOT global. New route groups that need JSON parsing must explicitly use `middleware.bodyparser()`.
- Payment `retryCount` is incremented on each retry attempt; `failureCode`/`failureMessage` are cleared on successful retry.
- Alert `resolvedAt` is set automatically when calling `POST /alerts/:id/resolve`.
