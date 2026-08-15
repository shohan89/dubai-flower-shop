# Architecture

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript, `src/` directory)
- **Styling**: Tailwind CSS v4 + shadcn/ui, design tokens centralized in
  `src/app/globals.css`
- **Database**: Supabase PostgreSQL, RLS-first
- **Auth**: Supabase Auth (`src/proxy.ts` refreshes the session cookie on
  every request — this is Next 16's replacement for `middleware.ts`)
- **Deployment target**: Cloudflare Workers via `@opennextjs/cloudflare`

## Layering

Requests flow through four layers, each with a single responsibility:

```
UI (Server/Client Components)
   -> Server Actions / Route Handlers   (thin: parse, authorize, call, respond)
      -> Service layer (src/server/services)   (business logic, Zod validation,
                                                  pricing, authorization)
         -> Data access layer (src/data-access)   (typed Supabase queries only)
            -> Supabase Postgres (RLS-enforced)
```

- **UI never queries the database.** Server Components call services (or
  actions that call services), not repositories, and never construct a
  Supabase client directly.
- **Data access has no business logic.** It only translates typed calls
  into Postgres queries via a Supabase client passed in by the caller.
- **Services own business rules**, including all price computation and
  authorization checks. See `src/server/services/README.md`.
- **Server Actions/Route Handlers are glue**, not logic. They validate
  input shape, call one service function, and map the result.

## Supabase clients

Three client constructors exist in `src/lib/supabase`, each scoped to a
specific context:

| File          | Runs in                          | Key       | RLS applies |
|---------------|-----------------------------------|-----------|-------------|
| `client.ts`   | Client Components (browser)       | anon      | yes         |
| `server.ts`   | Server Components/Actions/Routes  | anon      | yes         |
| `admin.ts`    | Service layer only, explicit auth | service-role | **no**   |

`admin.ts` bypasses RLS entirely and must only be imported from
`src/server/services/*` modules that perform their own authorization
check before using it.

## Environment variables

Split by trust boundary — see `docs/environment-variables.md`:

- `src/lib/env/public.ts` — `NEXT_PUBLIC_*` vars, safe for the browser.
- `src/lib/env/server.ts` — server-only vars, guarded by the `server-only`
  package so an accidental client-component import fails at build time.

## Route groups (established as the app grows)

- `(storefront)` — public customer-facing pages
- `(admin)` — dashboard, gated by role in `src/proxy.ts` / layout-level
  authorization checks
- `api/*` — Route Handlers for webhooks and non-Server-Action integrations

## Design tokens

All brand colors, fonts, and radii are defined once in
`src/app/globals.css` (`:root`, `@theme inline`) and consumed via Tailwind
utilities (`bg-primary`, `text-brand-gold`, `font-heading`, …). Changing
the visual system means editing that one file, not hunting through
components.
