# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cabinet Rimbault Admin — a real estate agency management app (French market). Next.js 15 (App Router) admin dashboard backed by PostgreSQL/Prisma. All UI text, enums, and domain terminology are in French.

The public API consumed by the storefront vitrine (`cabinet-rimbault.fr`) has been **extracted** into a separate repo `cabinet-rimbault-api`. The admin and the public API share the same Supabase Postgres database via Prisma. The admin owns the schema and runs all migrations; the API project only generates the Prisma client from a copy of the schema.

## Commands

```bash
# Dev
npm run dev            # Next.js dev server (localhost:3000)
docker-compose up -d   # PostgreSQL on port 5436

# Database
npm run db:push        # Sync Prisma schema to DB
npm run db:seed        # Seed with test data
npm run db:reset       # Force-reset DB + re-seed
npm run db:studio      # Prisma Studio GUI

# Tests (Vitest, jsdom, isolated forks)
npm run test           # Watch mode
npm run test:run       # Single run (used by CI & pre-push)
npx vitest run src/__tests__/api/properties.test.ts   # Single test file

# Lint & build
npm run lint           # ESLint (next/core-web-vitals + next/typescript)
npm run build          # prisma generate && next build

# Add a shadcn/ui component
npx shadcn@latest add <component-name>
```

## Git Hooks (Husky)

- **pre-commit**: `npm run lint`
- **pre-push**: `npm run test:run` then `npm run build`

CI (.github/workflows/ci.yml) mirrors this: lint → test:run → build.

## Architecture

### API surface

All routes under `src/app/api/` are session-protected via NextAuth (JWT strategy, credentials provider). Auth check: call `requireAuth()` from `src/lib/api-auth.ts`.

Exceptions whitelisted in `src/middleware.ts` :
- `/login`, `/api/auth`, `/api/users` (Bearer token).
- `/api/properties/recent` (legacy public list, kept for backward compat).
- `/api/evaluations` (POST public, GET checks auth in handler).

The previous `/api/public/*` surface lives now in the separate repo **`cabinet-rimbault-api`** (Railway-hosted, `api.cabinet-rimbault.fr`). Do not reintroduce public routes here — extend the API repo instead.

### Data model (Prisma)

`Property` is the central entity with six 1:1 sub-tables (Finance, Location, Characteristics, Amenities, Energy, Copro) and four 1:N collections (Image, Document, Room, Proximity). Property mutations use `prisma.$transaction` to atomically write across all sub-tables.

Other top-level models: `Evaluation` (estimation requests from the public form), `Lead` (contact form submissions), `AgencySettings` (singleton, id="default"), `User`.

All enums are in French (e.g., `VENTE`, `DISPONIBLE`, `APPARTEMENT`). The schema file is the source of truth for enum values.

### File storage (Supabase Storage)

Images, DPE/GES labels, and PDF documents are stored in Supabase Storage. Two clients exist in `src/lib/supabase.ts`:
- `supabase` — public client (respects RLS)
- `supabaseAdmin` — service-role client (bypasses RLS, server-only)

Bucket names are in the `BUCKETS` constant. The primary bucket for property files is `property-files`.

### Energy labels

`src/lib/energy-labels/` generates official French DPE and GES labels as SVG, converts them to images, and uploads to Supabase. Thresholds follow the 2021 French regulation.

### Frontend

- Route group `(authenticated)` wraps all admin pages with session check + sidebar layout.
- UI components: shadcn/ui (new-york style, Radix primitives, Tailwind CSS, lucide-react icons).
- Forms: React Hook Form + Zod validation (`src/components/admin/property-form/schema.ts`).
- Path alias: `@/` → `./src/`.

## Testing Conventions

Tests live in `src/__tests__/api/` and cover API route handlers. They mock Prisma, Supabase, and auth at the module level:

- `src/__tests__/mocks/prisma.ts` — mock Prisma client; call `resetPrismaMocks()` in `beforeEach`.
- `src/__tests__/mocks/auth.ts` — call `setAuthenticated(true/false)` to toggle admin auth.
- `src/__tests__/mocks/supabase.ts` — mock storage operations; helpers like `setUploadSuccess()`.
- `src/__tests__/mocks/fixtures.ts` — shared property/evaluation/lead fixtures.

Tests call the route handler directly (e.g., `import { GET } from '@/app/api/properties/route'`) and pass `new NextRequest(...)`.

## Environment Variables

Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN`.

`PUBLIC_API_KEY`, `RESEND_API_KEY` and `AGENCY_EMAIL_FROM` belong to the extracted public API (`cabinet-rimbault-api` repo). They no longer need to be set on the admin.
