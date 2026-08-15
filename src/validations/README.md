# Validations

Zod schemas, one file per domain (e.g. `product.schema.ts`,
`checkout.schema.ts`). Shared by:

- Server Actions / Route Handlers, to parse and validate raw input
- `src/services`, to re-validate before trusting data crossing a
  boundary (never assume a caller already validated)
- `react-hook-form` via `@hookform/resolvers/zod` on the client, for the
  same shape used server-side — define the schema once, import it both
  places.

Schemas here describe input shape only, not business rules (e.g. "email
looks like an email" belongs here; "this coupon is still valid" belongs
in `src/services`).
