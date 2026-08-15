# Features

Optional feature-sliced modules for domains complex enough to warrant
colocated components/hooks/types (e.g. `features/cart`,
`features/checkout`). A feature folder may contain its own
`components/`, `hooks.ts`, `types.ts` — but still calls into
`src/services` for business logic and `src/repositories` only from the
server side. Nothing here talks to Supabase directly.

Simple, single-page UI doesn't need a feature slice — put it under
`src/components` and route it from `src/app`.
