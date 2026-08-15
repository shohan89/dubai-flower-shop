# Hooks

Client-side React hooks only (`use client` consumers — cart state,
filters, form helpers, etc.). One hook per file, `useThing.ts` naming.
Hooks call Server Actions or fetch from Route Handlers; they never
import `src/repositories` or `src/lib/supabase/admin.ts`.
