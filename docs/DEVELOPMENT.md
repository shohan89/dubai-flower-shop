# Development

## Prerequisites

- Node.js 20.9+ (project uses Node 24)
- npm
- A Supabase project (URL + keys)

## Setup

```bash
cp .env.example .env.local   # fill in real values, see table below
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The health check is
at [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build locally (Node server) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Unit tests (Vitest) |
| `npm run cf:build` | Build and adapt the app for Cloudflare Workers |
| `npm run cf:preview` | Build, then run the Workers build locally via Wrangler |
| `npm run cf:deploy` | Build, then deploy to Cloudflare Workers |
| `npm run cf:typegen` | Generate `cloudflare-env.d.ts` from `wrangler.jsonc` bindings |

See `docs/DEPLOYMENT.md` for the Cloudflare workflow in detail.

## Environment variables

Copy `.env.example` to `.env.local` for local development. `.env.local`
is git-ignored; never commit real credentials. `.env.example` **is**
committed and must stay in sync with the Zod schemas below.

### Public (`NEXT_PUBLIC_*`) — bundled into the browser

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin, used for canonical URLs, sitemap, OG tags |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (RLS-scoped, safe to expose) |

Validated in `src/lib/env/public.ts`.

### Server-only — never exposed to the browser

| Variable | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS. Only ever read via `src/lib/supabase/admin.ts`, from service-layer code that has already authorized the operation. |
| `SUPABASE_DB_URL` | Direct Postgres connection string, used by migration/type-generation tooling only — not read by the running app. |

Validated in `src/lib/env/server.ts`, which imports the `server-only`
package so any accidental import from a Client Component fails the build
instead of leaking the service-role key.

### Rules

- Never add a secret with a `NEXT_PUBLIC_` prefix.
- Never import `src/lib/env/server.ts` or `src/lib/supabase/admin.ts` from
  a Client Component or any module reachable from one.
- Add new variables to both `.env.example` (placeholder) and the relevant
  Zod schema in `src/lib/env/` — the schema is the source of truth for
  what's required.

## Architecture conventions

See `docs/ARCHITECTURE.md` for the full layering model. Quick reference
per folder is in each layer's own README:
`src/repositories/README.md`, `src/services/README.md`,
`src/validations/README.md`, `src/hooks/README.md`,
`src/features/README.md`, `src/constants/README.md`.
