# Data access layer

Repositories in this directory own all direct Supabase queries. Rules:

- One file per aggregate (e.g. `products.repository.ts`, `orders.repository.ts`).
- Functions take a Supabase client instance as a parameter (either the
  request-scoped RLS client from `src/lib/supabase/server.ts` or, when a
  caller has already authorized an admin operation, the service-role
  client from `src/lib/supabase/admin.ts`) — never construct a client
  inside a repository function.
- No business logic, no authorization decisions, no Zod validation here —
  those belong in `src/server/services`. Repositories only translate
  between typed function calls and Postgres queries.
- Return typed rows (or thin mapped DTOs), not raw `PostgrestResponse`
  objects — unwrap `{ data, error }` and throw on error so callers don't
  each re-implement error handling.
- Never call one repository from another; compose at the service layer.
