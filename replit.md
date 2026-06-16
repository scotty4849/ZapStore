# ZapStore

ZapStore is a Codychat Addon marketplace built by XSCXRX — a cyberpunk/hacker/terminal-aesthetic storefront where users browse addons and submit order tickets, managed by admins.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/zap-store run dev` — run the frontend (port 21251)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + express-session + connect-pg-simple
- Auth: Local sessions with bcryptjs (stored in PostgreSQL)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind CSS + Space Mono font + terminal aesthetic

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle table schemas (users, products, tickets, news_updates)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/zap-store/src/pages/` — Frontend pages
- `artifacts/zap-store/src/hooks/use-auth.tsx` — Auth context provider
- `artifacts/zap-store/src/components/layout.tsx` — Site-wide nav/layout

## Architecture decisions

- Sessions stored in PostgreSQL via connect-pg-simple (no JWT, no external auth service)
- Admin check happens server-side in every admin route — role must be "admin" or "owner"
- Users submit order tickets (not direct checkout) — admin reviews and processes each one
- OpenAPI-first: all types generated from spec, frontend uses generated React Query hooks
- Terminal aesthetic enforced app-wide via CSS custom properties (no light mode)

## Product

- **Browse**: Public product catalog of Codychat addons
- **Order**: Logged-in users submit a ticket to request any addon
- **News**: Admin-posted updates/announcements visible to all
- **Tickets**: Users track their own order tickets; admins see all tickets and can update status
- **Admin**: Full CRUD on products, tickets, and news — owner/admin role required

## User preferences

- Developer branding: XSCXRX
- Store name: ZapStore
- Aesthetic: Futurist hacker/terminal — green phosphor on black, Space Mono font, CRT scanlines
- Owner account: username SCXR, password uprising (role: "owner" in DB)
- Ordering flow: ticket-based (no direct payments)

## Gotchas

- The `SESSION_SECRET` env var must be set — falls back to dev secret if missing
- Seeded admin user on first boot: username=SCXR, password=uprising
- Run `pnpm --filter @workspace/db run push` after any schema change
- `latestUpdate` in /api/stats returns the update **title** string (not a date)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
