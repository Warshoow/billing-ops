# BillingOps

Turborepo + pnpm monorepo for a Stripe billing operations platform. Ingests Stripe webhooks, mirrors billing data locally, and exposes a dashboard + a write API for SaaS integration.

## Monorepo layout

- `apps/api` — AdonisJS 6 REST API (PostgreSQL, Stripe SDK)
- `apps/dashboard` — Next.js 16 dashboard (React 19, Tailwind 4, shadcn/ui)
- `packages/shared-types` — shared TypeScript interfaces (re-exported from `@repo/shared-types`)
- `packages/ui` — shared React component library (`@repo/ui`)
- `packages/eslint-config` — shared ESLint configs
- `packages/typescript-config` — shared tsconfig presets

## Commands

```bash
pnpm install            # install all deps
pnpm dev                # turbo dev (api:3333 + dashboard:3000)
pnpm build              # turbo build
pnpm lint               # turbo lint
pnpm test               # turbo test (Japa for api)
pnpm check-types        # turbo typecheck
```

### API-specific (run from apps/api)

```bash
node ace serve --hmr     # dev server with HMR
node ace test            # run Japa tests
node ace migration:run   # run DB migrations
node ace db:seed         # seed database
```

### Infrastructure

```bash
docker-compose up -d            # PostgreSQL 15 on :5432
docker-compose -f docker-compose.dev.yml up  # dev services
```

## Environment variables

- API: `apps/api/.env` (copy `.env.example`) — DB_*, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BILLING_API_KEY
- Dashboard: `apps/dashboard/.env` — NEXT_PUBLIC_API_URL (default: http://localhost:3333)

## Architecture patterns

- **Bodyparser is NOT global** in the API. It's a named middleware applied selectively in `start/routes.ts` so the Stripe webhook route can access raw body for signature verification.
- **Named middleware** are registered in `start/kernel.ts` (`bodyparser`, `apiKey`).
- AdonisJS uses `#imports` path aliases (e.g., `#controllers/*`, `#services/*`, `#models/*`) — defined in `package.json` `imports` field, not tsconfig paths.
- Models use Lucid ORM with UUID primary keys.
- The `/billing` route group uses API key auth (`x-api-key` header) and follows an **optimistic update** pattern: call Stripe first, update local DB, webhook eventually syncs.
- **Webhook idempotency**: processed Stripe event IDs are stored in a `stripe_events` table. Duplicate webhook deliveries are detected and skipped.
- **Input validation**: all CRUD controllers validate input via VineJS validators (`app/validators/`). Validators exist for customers, payments, subscriptions, alerts, billing, and events.
- **Pagination**: list endpoints support `?page=` and `?perPage=` query params and return Lucid paginated responses (`{ data, meta }`). Dashboard pages handle both paginated and raw array responses for backwards compatibility.
- Shared types are consumed via `@repo/shared-types` workspace dependency.

## Code style

- TypeScript strict, ESM (`"type": "module"`)
- AdonisJS ESLint config for API, custom Next.js config for dashboard
- snake_case for DB columns/migrations, camelCase for TS properties (Lucid handles mapping)
- Controllers are classes with method handlers; services are singleton instances (exported as default)
- Validators use VineJS (`@vinejs/vine`)
- Tests use Japa framework (`@japa/runner`) with `@japa/api-client` for functional tests
