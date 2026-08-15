# Service layer

Business logic lives here, one module per domain (e.g.
`product.service.ts`, `order.service.ts`, `pricing.service.ts`). Rules:

- Services are the only callers of `src/data-access` repositories.
- Validate all external input with Zod schemas (from `src/lib/validation`
  or colocated) before it reaches a repository call.
- Enforce authorization here: check the caller's role/session before
  performing privileged operations, even if the route/action above
  already gated on role — services must be safe to call from anywhere.
- Anything price-related (subtotal, discounts, delivery fee, tax, total)
  is computed here from server-trusted data only. Never accept a total,
  subtotal, or unit price from the client and persist it directly.
- Server Actions and Route Handlers should be thin: parse/validate input,
  call a service, map the result/error to a response. They must not
  contain Supabase queries directly.
- Multi-step writes (e.g. order creation) run inside a Postgres
  transaction (via an RPC/stored procedure, or Supabase's transaction
  support) — never as a sequence of independent inserts a partial
  failure could leave inconsistent.
