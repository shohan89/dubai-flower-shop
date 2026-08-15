# Deployment (Cloudflare Workers)

The app deploys to Cloudflare Workers via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), which
adapts the Next.js build output into a Worker.

Config files:

- `open-next.config.ts` — OpenNext adapter config (currently configures
  the R2-backed incremental cache for ISR/data-cache).
- `wrangler.jsonc` — Worker config: assets binding, R2 bucket binding,
  self-reference service binding (used internally by OpenNext for
  on-demand revalidation), and the Cloudflare Images binding for
  `next/image` optimization.

## One-time setup before the first real deploy

1. Log in to Cloudflare:
   ```bash
   npx wrangler login
   ```
2. Create the R2 bucket used for the incremental cache (name must match
   `wrangler.jsonc`'s `r2_buckets[0].bucket_name`):
   ```bash
   npx wrangler r2 bucket create dubai-flower-shop-opennext-cache
   ```
3. Set production secrets (these are **not** read from `.env.local` when
   deployed — Workers secrets are separate):
   ```bash
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put SUPABASE_DB_URL
   ```
   Public (`NEXT_PUBLIC_*`) values are baked in at build time from
   `.env.local`/CI env, not set as Worker secrets.
4. (Optional) Generate typed bindings for editor support:
   ```bash
   npm run cf:typegen
   ```

## Local preview against the Workers runtime

Runs the actual OpenNext/Workers build locally via Wrangler (closer to
production than `next dev`):

```bash
npm run cf:preview
```

## Deploy

```bash
npm run cf:deploy
```

This runs `opennextjs-cloudflare build` (produces `.open-next/`) followed
by `opennextjs-cloudflare deploy` (publishes the Worker via Wrangler).

## Notes

- `next.config.ts` calls `initOpenNextCloudflareForDev()` so `next dev`
  can read bindings declared in `wrangler.jsonc` — this is a no-op in
  production.
- `compatibility_date` in `wrangler.jsonc` should be bumped deliberately,
  not left stale indefinitely — check
  [Cloudflare's compatibility date docs](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)
  before changing it.
- `.open-next/` and `.wrangler/` are build/local-state directories and
  are git-ignored — never commit them.
