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
| `/webhooks/stripe` | Stripe signature | none (raw body) | Webhook ingestion |
| `/` (default group) | none | none | Dashboard-facing CRUD + metrics |
| `/billing` | `x-api-key` | `bodyparser`, `apiKey` | SaaS write API |
| `/simulation` | none | none | Demo/test endpoints |

## Models (Lucid, UUID PKs)

- `Customer` — externalUserId, email, stripeCustomerId (nullable), status, lifetimeValue
- `Payment` — stripePaymentId, amount, currency, status, customerId (FK)
- `Subscription` — stripeSubscriptionId, customerId (FK), status, period dates, plan details
- `Alert` — customerId (FK), type, severity, message, resolved

## Services

- `stripe_service.ts` — Stripe SDK wrapper (singleton). Read ops + write ops (createCustomer, createCheckoutSession, cancelSubscriptionGraceful, retryPayment).
- `stripe_event_handler.ts` — processes webhook events, upserts models, creates alerts on failure/churn.
- `billing_service.ts` — orchestrates billing write operations: resolves local customer, calls Stripe, updates DB optimistically.

## Error handling

- `billing_errors.ts` — typed error hierarchy (`BillingError` base with status/code). Subclasses: `CustomerNotFoundError` (404), `StripeOperationError` (502), `InvalidBillingRequestError` (422), `BillingConflictError` (409).
- Controller catches `BillingError` and returns structured JSON; other errors bubble to AdonisJS default handler.

## Testing

```bash
node ace test                    # all tests
node ace test --files "tests/functional/**"  # functional only
node ace test --files "tests/unit/**"        # unit only
```

- Functional tests use `@japa/api-client` for HTTP assertions
- Test bootstrap in `tests/bootstrap.ts`
- Factories in `database/factories/` for seeding test data

## Gotchas

- Stripe SDK is lazy-initialized — fails gracefully if `STRIPE_SECRET_KEY` is not set (returns null stripe instance, throws on use).
- `stripeCustomerId` is nullable on Customer — customers can exist locally before Stripe onboarding.
- Bodyparser is a named middleware, NOT global. New route groups that need JSON parsing must explicitly use `middleware.bodyparser()`.
