# Dashboard — Next.js 16

## Stack

Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (Radix primitives), Recharts, TanStack Table.

## Key files

- `app/page.tsx` — main dashboard (KPI cards, alerts, revenue chart, failed payments table)
- `app/customers/page.tsx` — customers list
- `app/subscriptions/page.tsx` — subscriptions list
- `lib/api-client.ts` — API client singleton, base URL from `NEXT_PUBLIC_API_URL`
- `hooks/useFetch.ts` — generic data-fetching hook (returns `{ data, loading, error, refetch }`)
- `components/ui/` — shadcn/ui primitives (do not edit manually, regenerate via CLI)

## Patterns

- All pages are `'use client'` — client-side rendering with fetch on mount.
- API calls go through `apiClient` singleton (`lib/api-client.ts`) which wraps `fetch()`.
- UI components in `components/` are project-specific; `components/ui/` are shadcn/ui generated.
- Theming via `next-themes` with `theme-provider.tsx`.
- **Error states**: all pages display an error message with a Retry button when API calls fail (using `useFetch`'s `error` + `refetch`).
- **Paginated responses**: pages handle both `{ data, meta }` paginated responses and raw arrays for backwards compatibility with the API's paginated list endpoints.
- **Alert resolution**: the alerts widget allows resolving alerts directly from the UI via `POST /alerts/:id/resolve`.

## Environment

- `NEXT_PUBLIC_API_URL` — API base URL (default: `http://localhost:3333`)
