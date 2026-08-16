# Dubai Flower Shop

Premium flower and plant ecommerce platform for Dubai, UAE. Next.js (App
Router) + Supabase, deployed to Cloudflare Workers via OpenNext.

## Getting started

```bash
cp .env.example .env.local   # fill in real values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Health check at
[/api/health](http://localhost:3000/api/health).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Development](docs/DEVELOPMENT.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Database](docs/DATABASE.md)
- [Authentication & Authorization](docs/AUTHENTICATION.md)
- [Admin dashboard](docs/ADMIN.md)

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm run test` — unit tests (Vitest)
- `npm run cf:preview` / `npm run cf:deploy` — Cloudflare Workers preview/deploy
