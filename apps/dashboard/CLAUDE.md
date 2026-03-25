# Dashboard — Next.js 16

## Stack

Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (Radix primitives), Recharts, TanStack Table.

## Key files

- `app/page.tsx` — main dashboard (KPI cards, alerts, revenue chart, failed payments table)
- `app/customers/page.tsx` — customers list
- `app/subscriptions/page.tsx` — subscriptions list
- `lib/api-client.ts` — API client singleton, base URL from `NEXT_PUBLIC_API_URL`
- `hooks/useFetch.ts` — generic data-fetching hook
- `components/ui/` — shadcn/ui primitives (do not edit manually, regenerate via CLI)

## Patterns

- All pages are `'use client'` — client-side rendering with fetch on mount.
- API calls go through `apiClient` singleton (`lib/api-client.ts`) which wraps `fetch()`.
- UI components in `components/` are project-specific; `components/ui/` are shadcn/ui generated.
- Theming via `next-themes` with `theme-provider.tsx`.

## Environment

- `NEXT_PUBLIC_API_URL` — API base URL (default: `http://localhost:3333`)
