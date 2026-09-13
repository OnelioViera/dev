# ALP Lifter Selector — Next.js + Supabase

This is a rebuild of the original single-file ALP Lifter Selector (the


`localStorage`-based HTML tool) as a real multi-device app: Next.js (App
Router) on Vercel, backed by Supabase (Postgres + Auth). Each signed-in user
gets their own private job, lifter library, and saved reports — nothing is
shared between accounts unless you change the database policies.

## What ported over

- **The full calculation engine** (`src/lib/calc.ts`) — angle factors,
  dynamic load factors, tension/shear capacity lookups, edge-distance and
  slab-thickness checks, form-stripper checks — transcribed from the original
  app's JavaScript, not rewritten from scratch. `src/lib/catalog.ts` carries
  over the entire ALP lifter catalog (Utility Lift Anchors, Steel Core Lift
  Loops, ALP Lifting Pin Anchors, Lifting Eyes, ferrule inserts) verbatim.
- **The four tabs**: New Analysis, My Lifter Library, Saved Reports,
  Reference Data.
- **Auth** — Supabase email/password sign-in gates the whole app
  (`middleware` → renamed `proxy.ts` in this Next.js version).

## What's simplified vs. the original (worth revisiting)

- The original's PDF/print report view and some of the finer inline
  dimension hints aren't rebuilt yet — the Saved Reports tab shows a
  read-only summary table instead. Re-adding a print/PDF view is a
  contained follow-up (see `src/components/ReportsClient.tsx`).
- The original supported multiple *saved* rigging-settings presets; this
  version keeps one live "current job" per user (matching how the original
  actually behaved before you hit Save Report), with reports as frozen
  snapshots.
- No per-account roles/permissions yet — every signed-up user gets their own
  private workspace. If multiple people at ALP need to share one job/library,
  that needs a small "organization" layer added to the schema (see below).

## Stack

- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4
- Supabase (Postgres, Auth, Row Level Security)
- Deploys to Vercel

## 1. Create/connect a Supabase project

1. In your Supabase project, open **SQL Editor** and run
   `supabase/migrations/0001_init.sql` (paste and run once). This creates
   `profiles`, `parts`, `reports`, enables Row Level Security on all three,
   and adds a trigger so every new sign-up gets a `profiles` row seeded with
   the full lifter catalog in their library.
2. Under **Authentication → Providers**, email/password is enabled by
   default — that's all this app uses. (Turn off "Confirm email" under
   **Authentication → Settings** if you want new accounts usable
   immediately without checking their inbox.)
3. Under **Settings → API**, copy the **Project URL** and **anon public**
   key.

## 2. Local development

```bash
cp .env.local.example .env.local
# paste your Supabase URL + anon key into .env.local
npm install
npm run dev
```

Visit `http://localhost:3000`, click **Create account** on the login page,
sign in, and you'll land on New Analysis with your library pre-seeded.

## 3. Deploy to Vercel

1. Push this repo to GitHub (or your existing `lindsay-jobs` repo).
2. In Vercel, **New Project** → import the repo.
3. Add the same two environment variables from `.env.local` under
   **Settings → Environment Variables** (Production + Preview).
4. Deploy. Vercel auto-detects Next.js — no build config changes needed.

If you'd rather use the Vercel ↔ Supabase integration, it does step 3 for
you automatically when you connect the same Supabase project to the Vercel
project.

## Project structure

```
src/lib/catalog.ts        static ALP lifter/eye/ferrule reference data
src/lib/calc.ts            the engineering calculation engine (pure functions)
src/lib/types.ts           Supabase row types
src/lib/mappers.ts         DB row -> calc-engine object converters
src/lib/supabase/          browser/server/middleware Supabase clients
supabase/migrations/       schema + RLS policies
src/app/login/             sign in / sign up (Server Actions)
src/app/analysis/          New Analysis (job info, parts, rigging settings)
src/app/library/           My Lifter Library
src/app/reports/           Saved Reports
src/app/reference/         Reference Data (static catalog tables)
src/components/            client components for each tab
proxy.ts                   auth-gating middleware (Next.js 16 renamed this from middleware.ts)
```

## Extending to a shared/multi-user workspace

Right now `profiles`/`parts`/`reports` are all scoped 1:1 to `auth.uid()`.
If ALP wants a whole team to share one job list and library, the cleanest
path is adding an `organizations` table, an `organization_members` join
table, an `org_id` column on `profiles`/`parts`/`reports`, and rewriting the
RLS policies to check organization membership instead of `auth.uid() = user_id`.
Happy to build that next if it's needed.
