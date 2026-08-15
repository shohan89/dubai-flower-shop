# Environment variables

Copy `.env.example` to `.env.local` and fill in real values for local
development. `.env.local` is git-ignored; never commit real credentials.

## Public (`NEXT_PUBLIC_*`) — bundled into the browser

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin, used for canonical URLs, sitemap, OG tags |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (RLS-scoped, safe to expose) |

Validated in `src/lib/env/public.ts`.

## Server-only — never exposed to the browser

| Variable | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS. Only ever read via `src/lib/supabase/admin.ts`, from service-layer code that has already authorized the operation. |
| `SUPABASE_DB_URL` | Direct Postgres connection string, used by migration/type-generation tooling only — not read by the running app. |

Validated in `src/lib/env/server.ts`, which imports the `server-only`
package so any accidental import from a Client Component fails the build
instead of leaking the service-role key.

## Rules

- Never add a secret with a `NEXT_PUBLIC_` prefix.
- Never import `src/lib/env/server.ts` or `src/lib/supabase/admin.ts` from
  a Client Component or any module reachable from one.
- Add new variables to both `.env.example` (placeholder) and the relevant
  Zod schema in `src/lib/env/` — the schema is the source of truth for
  what's required.
