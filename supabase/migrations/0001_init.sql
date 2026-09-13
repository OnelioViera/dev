-- ALP Lifter Selector — initial schema
--
-- Each signed-in user gets their own private workspace: one row in `profiles`
-- (their lifter library + shared rigging/concrete settings + custom piece
-- roles + the current job's header info), a `parts` table row per part in
-- their live "New Analysis" list, and any number of `reports` rows (frozen
-- snapshots saved from Save Report / Download PDF). Row Level Security scopes
-- every table to auth.uid() so users never see each other's jobs.
--
-- Run this against your Supabase project (SQL Editor, or `supabase db push`
-- if you're using the Supabase CLI locally).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one row per user. Holds the "My Lifter Library" inventory, the
-- shared rigging/concrete settings, custom piece roles, and current job info
-- — everything that lived in state.inventory / state.settings / state.project
-- / state.pieceRoles in the old localStorage build.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,

  -- "My Lifter Library" — array of LIFTERS catalog ids the user keeps on hand.
  -- Defaults to empty; the app seeds it with the full catalog on first login.
  inventory text[] not null default '{}',
  use_full_catalog boolean not null default false,

  -- Job Information (the single "current" job header, mirrors state.project)
  customer text not null default '',
  job_name text not null default '',
  job_number text not null default '',
  structure_id text not null default '',

  -- Rigging & Concrete Settings (mirrors state.settings)
  pick_pattern text not null default '4pt-equalized',
  anchors_taking_load integer not null default 4,
  sla_deg numeric not null default 60,
  rigging_type text not null default 'cable',
  handling_condition text not null default 'stationary',
  unit_weight_pcf numeric not null default 150,
  concrete_psi numeric not null default 4000,

  -- User-editable piece roles (mirrors state.pieceRoles), stored as JSONB:
  -- [{id, label, hasWall}, ...]
  piece_roles jsonb not null default '[
    {"id":"lid","label":"Lid","hasWall":false},
    {"id":"lid_walls","label":"Lid / Walls","hasWall":true},
    {"id":"riser","label":"Riser","hasWall":true},
    {"id":"base","label":"Base","hasWall":false},
    {"id":"base_walls","label":"Base / Walls","hasWall":true}
  ]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- parts: the live "Parts List (This Structure)" for the user's current job.
-- anchor_entries mirrors part.anchorEntries from the old build — a small,
-- bounded array of {id, type, location, lifterId} — stored as JSONB rather
-- than a child table since it's never queried independently of its part.
-- ---------------------------------------------------------------------------
create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null default '',
  piece_role text not null default 'lid',
  shape text not null default 'rect' check (shape in ('rect', 'round')),
  length_in numeric not null default 0,
  width_in numeric not null default 0,
  diameter_in numeric not null default 0,
  wall_thickness_in numeric not null default 0,
  legacy_size_note text,
  weight_lbs numeric not null default 0,
  cubic_yards numeric not null default 0,
  height numeric not null default 0,
  thickness_in numeric not null default 0,
  edge_distance_top_in numeric not null default 0,
  edge_distance_bottom_in numeric not null default 0,
  edge_distance_side_in numeric not null default 0,
  lift_orientation text not null default 'tension' check (lift_orientation in ('tension', 'shear')),
  anchor_entries jsonb not null default '[]'::jsonb,
  strip_psi numeric,
  notes text not null default '',
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.parts enable row level security;

create index if not exists parts_user_id_idx on public.parts (user_id, sort_order);

create policy "parts: select own" on public.parts for select using (auth.uid() = user_id);
create policy "parts: insert own" on public.parts for insert with check (auth.uid() = user_id);
create policy "parts: update own" on public.parts for update using (auth.uid() = user_id);
create policy "parts: delete own" on public.parts for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reports: point-in-time snapshots saved from the New Analysis tab. Each
-- report freezes the job header, settings, piece roles, and full parts list
-- at save time (as JSONB) exactly as the old build's Save Report did — so
-- later edits to the live parts list never change a report that already
-- exists.
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  customer text not null default '',
  job_name text not null default '',
  job_number text not null default '',
  structure_id text not null default '',

  settings jsonb not null,
  piece_roles jsonb not null,
  parts jsonb not null,

  parts_count integer not null default 0,
  result text not null default 'incomplete' check (result in ('pass', 'fail', 'incomplete')),

  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create index if not exists reports_user_id_idx on public.reports (user_id, created_at desc);

create policy "reports: select own" on public.reports for select using (auth.uid() = user_id);
create policy "reports: insert own" on public.reports for insert with check (auth.uid() = user_id);
create policy "reports: delete own" on public.reports for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row the moment a user signs up, seeded with the full
-- lifter catalog in their inventory (matches the old build's default of
-- "every LIFTERS id" on first load). The catalog ids are duplicated here as a
-- literal array because this runs in Postgres, not Next.js — keep it in sync
-- with src/lib/catalog.ts if lifters are ever added or removed.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, inventory)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    array[
      'LUA44G','LUA54G','LUA64G','LUA56G','LUA66G','LUA86G',
      'LUL414G','LUL514G','LUL614G','LUL518G','LUL618G','LUL818G',
      'LLB','LLW','LLR','LLP','LLLG','LLC','LLDG','LLY',
      'LPA1T238G','LPA1T258G','LPA1T338G','LPA1T434G',
      'LPA2T234G','LPA2T338G','LPA2T434G','LPA2T512G','LPA2T634G','LPA2T11G',
      'LPA4T212G','LPA4T3G','LPA4T312G','LPA4T334G','LPA4T414G','LPA4T434G','LPA4T512G','LPA4T718G','LPA4T912G',
      'LPA8T434G','LPA8T6G','LPA8T634G','LPA8T834G','LPA8T10G','LPA8T1338G','LPA8T2634G',
      'LPA16T778G',
      'LPA20T10G','LPA20T16G','LPA20T1934G'
    ]
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at current on profiles/parts edits.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists parts_set_updated_at on public.parts;
create trigger parts_set_updated_at before update on public.parts
  for each row execute function public.set_updated_at();
