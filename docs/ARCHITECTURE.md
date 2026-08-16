# Architecture

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript, `src/` directory)
- **Styling**: Tailwind CSS v4 + shadcn/ui, design tokens centralized in
  `src/styles/globals.css`
- **Database**: Supabase PostgreSQL, RLS-first
- **Auth**: Supabase Auth (`src/middleware.ts` refreshes the session
  cookie on every request — deliberately using the legacy Edge-runtime
  `middleware.ts` convention rather than Next 16's `proxy.ts`, since
  `@opennextjs/cloudflare` does not yet support Node-runtime middleware)
- **Deployment target**: Cloudflare Workers via `@opennextjs/cloudflare`

## Layering

Requests flow through four layers, each with a single responsibility:

```
UI (Server/Client Components, src/app + src/components + src/features)
   -> Server Actions / Route Handlers   (thin: parse, authorize, call, respond)
      -> Service layer (src/services)   (business logic, authorization,
                                          pricing — validates with src/validations)
         -> Data access layer (src/repositories)   (typed Supabase queries only)
            -> Supabase Postgres (RLS-enforced)
```

- **UI never queries the database.** Server Components call services (or
  actions that call services), not repositories, and never construct a
  Supabase client directly.
- **Data access has no business logic.** It only translates typed calls
  into Postgres queries via a Supabase client passed in by the caller.
  See `src/repositories/README.md`.
- **Services own business rules**, including all price computation and
  authorization checks. See `src/services/README.md`.
- **Validations are shared, not duplicated.** A Zod schema in
  `src/validations` is imported by both the server (Server
  Action/service) and the client (`react-hook-form` via
  `@hookform/resolvers/zod`) for the same form.
- **Server Actions/Route Handlers are glue**, not logic. They validate
  input shape, call one service function, and map the result.

## Folder structure

```
src/
  app/            Routes (App Router) — pages, layouts, route handlers
  components/      Shared, reusable UI (shadcn/ui lives in components/ui)
  features/        Feature-sliced modules for complex domains (cart, checkout, …)
  hooks/           Client-side React hooks
  lib/             Cross-cutting utilities: env validation, Supabase clients
  services/        Business logic — the only caller of repositories
  repositories/    Typed Supabase queries — the only layer that touches the DB
  types/           Shared TypeScript types, including generated database.types.ts
  validations/     Zod schemas, shared between server and client
  config/          Static, non-editable infrastructure constants
  constants/       Fixed domain enums/literals (order status, roles, …)
  styles/          globals.css and any global (non-component) styles
```

## Supabase clients

Three client constructors exist in `src/lib/supabase`, each scoped to a
specific context:

| File          | Runs in                          | Key          | RLS applies |
|---------------|-----------------------------------|--------------|-------------|
| `client.ts`   | Client Components (browser)       | publishable  | yes         |
| `server.ts`   | Server Components/Actions/Routes  | publishable  | yes         |
| `admin.ts`    | Service layer only, explicit auth | service-role | **no**      |

`admin.ts` bypasses RLS entirely and must only be imported from
`src/services/*` modules that perform their own authorization check
before using it.

## Environment variables

Split by trust boundary — see `docs/DEVELOPMENT.md`:

- `src/lib/env/public.ts` — `NEXT_PUBLIC_*` vars, safe for the browser.
- `src/lib/env/server.ts` — server-only vars, guarded by the `server-only`
  package so an accidental client-component import fails at build time.

## Cloudflare deployment

The app is adapted for Cloudflare Workers via `@opennextjs/cloudflare`
(`open-next.config.ts`, `wrangler.jsonc`). See `docs/DEPLOYMENT.md` for
the build/preview/deploy workflow and required Cloudflare resources.

## Route groups

- `(auth)` — public auth pages (login, signup, forgot/reset password),
  shared centered-card layout
- `account/` — customer account pages, gated by `requireCustomerAccess()`
  in its layout
- `admin/login` — public admin login (outside the protected group)
- `admin/(dashboard)` — everything else under `/admin`, gated by
  `requireAdminAccess()` in its layout
- `api/*` — Route Handlers for webhooks, health checks, and
  non-Server-Action integrations (e.g. `auth/confirm` for email links)

Storefront pages (shop, product detail, cart, …) don't have a route
group yet — they'll get one as that phase lands.

## Database

Schema, RLS policy philosophy, and migration workflow are documented in
`docs/DATABASE.md` — not duplicated here.

## Authentication & authorization

Role model, permission matrix, the `requireAuth`/`requireRole`/
`requirePermission` helpers, and route protection strategy are documented
in `docs/AUTHENTICATION.md`.

## Admin dashboard

The reusable admin component library (`DataTable`, `Modal`/`Drawer`,
`ImageUploader`, etc.), order status transition rules, and per-domain
notes are documented in `docs/ADMIN.md`.

## Design tokens

All brand colors, fonts, and radii are defined once in
`src/styles/globals.css` (`:root`, `@theme inline`) and consumed via
Tailwind utilities (`bg-primary`, `text-brand-gold`, `font-heading`, …).
Changing the visual system means editing that one file, not hunting
through components.
