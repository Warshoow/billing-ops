# BillingOps

**A simple decision dashboard for Stripe (MVP).**

A test project that gives a clear view of Stripe payments and subscriptions,
without the complexity of Stripe's own interface. It keeps to what you need to
make decisions quickly.

## Features

- **Metrics**: MRR, churn rate, failed payments, revenue over 180 days
- **Management**: customers, subscriptions, payments (CRUD + actions)
- **Alerts**: automatic notifications on critical events
- **Stripe webhooks**: real-time sync
- **Simulation**: test endpoints for demos

## Stack

- **Monorepo**: Turborepo + pnpm
- **Backend**: AdonisJS 6 + PostgreSQL + Stripe SDK
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4, shadcn/ui
- **Language**: TypeScript

## Quick start

The setup script checks the prerequisites (Node.js, pnpm or npm, Docker),
installs dependencies, generates the `APP_KEY`, creates the `.env` files, starts
PostgreSQL, runs the migrations and offers to load test data.

| | pnpm (recommended) | npm |
|---|---|---|
| macOS / Linux | `./setup.sh` | `./setup-npm.sh` |
| Windows | `setup.cmd` | `setup-npm.cmd` |

Then set your Stripe keys in `apps/api/.env` and start:

- pnpm: `pnpm dev` (on Windows, `pnpm dev:safe`, see [Troubleshooting](#troubleshooting))
- npm: `cd apps/api && npm run dev`, and `cd apps/dashboard && npm run dev` in another terminal

Dashboard on http://localhost:3000, API on http://localhost:3333.

## Manual install

Prerequisites: Node.js 22.x, pnpm 9+ (`corepack enable && corepack prepare pnpm@9.0.0 --activate`), Docker and Docker Compose.

```bash
# 1. Clone and install
git clone https://github.com/Warshoow/billing-ops.git
cd billing-ops
pnpm install

# 2. Configure the API
cd apps/api
node ace generate:key   # copy the generated key
# Create apps/api/.env with:
#   APP_KEY=<generated key>
#   DB_HOST=127.0.0.1
#   DB_PORT=5432
#   DB_USER=postgres
#   DB_PASSWORD=postgres
#   DB_DATABASE=billingops
#   STRIPE_SECRET_KEY="sk_test_..."
#   STRIPE_WEBHOOK_SECRET="whsec_..."
cd ../..

# 3. Create apps/dashboard/.env.local with:
#   NEXT_PUBLIC_API_URL=http://localhost:3333

# 4. Start PostgreSQL
docker-compose up -d

# 5. Set up the database
cd apps/api
node ace migration:run
node ace db:seed        # optional: test data
cd ../..

# 6. Start
pnpm dev
```

## Layout

```
apps/
  api/            AdonisJS 6 backend
  dashboard/      Next.js 16 frontend
packages/
  shared-types/   shared TypeScript types
  ui/             reusable components
docker-compose.yml   PostgreSQL
```

```bash
pnpm dev                        # API + dashboard
docker-compose up -d            # PostgreSQL
cd apps/api && node ace test    # tests
```

## API endpoints

- `GET /metrics`: dashboard metrics
- `GET /customers`: customers
- `GET /payments`: payments
- `POST /payments/:id/retry`: retry a payment
- `GET /subscriptions`: subscriptions
- `POST /subscriptions/:id/cancel`: cancel a subscription
- `GET /alerts`: system alerts
- `POST /webhooks/stripe`: Stripe webhooks
- `POST /simulation/*`: simulation endpoints

## Stripe webhooks

BillingOps keeps its data in sync through Stripe webhooks.

Handled events:

- `customer.created` / `customer.updated` / `customer.deleted`
- `payment_intent.succeeded` / `payment_intent.payment_failed`
- `customer.subscription.created` / `customer.subscription.updated` / `customer.subscription.deleted`

### Local setup with the Stripe CLI in Docker

```bash
cd stripe
# 1. Put your API key in .env.stripe (from https://dashboard.stripe.com/test/apikeys)
# 2. Start the listener
docker-compose -f docker-compose.stripe.yml --env-file .env.stripe up -d
# 3. Read the generated webhook secret
docker-compose -f docker-compose.stripe.yml logs stripe-listen
#    look for "Ready! Your webhook signing secret is whsec_..."
# 4. Copy it into apps/api/.env as STRIPE_WEBHOOK_SECRET
# 5. Fire a test event
./stripe-trigger.sh payment_intent.succeeded    # stripe-trigger.bat on Windows
```

More in [stripe/README.stripe.md](stripe/README.stripe.md). In production, create
the endpoint in [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
and copy its `whsec_...` secret.

### Testing without Stripe

```bash
curl -X POST http://localhost:3333/simulation/payment_failed
curl -X POST http://localhost:3333/simulation/churn
curl -X POST http://localhost:3333/simulation/onboarding
```

## Troubleshooting

**The terminal crashes after Ctrl+C (Windows).** A known Turborepo bug on Windows
leaves orphan processes. Use `pnpm dev:safe` instead of `pnpm dev`. More in
[TROUBLESHOOTING.md](TROUBLESHOOTING.md).

**PostgreSQL connection error.** Check that Docker is running (`docker ps`), that
PostgreSQL is up (`docker-compose up -d`), and that the credentials in `.env`
match `docker-compose.yml` (postgres/postgres).

**Validation error on `STRIPE_SECRET_KEY`.** The Stripe keys are missing from
`apps/api/.env`.

**Stripe webhooks fail with "signature verification failed".** AdonisJS's
bodyparser consumes the HTTP stream before the signature can be checked. This is
already handled:

- the `/webhooks/stripe` route is declared **outside** the bodyparser group;
- `WebhooksController` reads the raw Node.js stream to verify the signature;
- it answers right away and processes the event in the background, to avoid timeouts.

```
/webhooks/stripe  → no bodyparser → raw stream → verify signature → process in background

router.group().use([bodyparser])  ← only here
  /customers, /payments, …        → JSON parsed
```

See [apps/api/start/routes.ts](apps/api/start/routes.ts) and
[apps/api/app/controllers/webhooks_controller.ts](apps/api/app/controllers/webhooks_controller.ts).
