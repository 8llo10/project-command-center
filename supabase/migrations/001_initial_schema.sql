-- Project Command Center
-- Owner-only admin access is restricted to: ghalaalhashmi80@gmail.com

create table if not exists public.projects (
  id text primary key,
  name text not null,
  subtitle text not null default '',
  summary text not null default '',
  status text not null check (status in ('completed','version_done','active','planned','paused')),
  progress integer not null default 0 check (progress between 0 and 100),
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  stack text[] not null default '{}',
  live_url text,
  github_url text,
  updated_at timestamptz not null default now(),
  sort_order integer not null default 100
);

create table if not exists public.project_private_notes (
  project_id text primary key references public.projects(id) on delete cascade,
  note text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.project_private_notes enable row level security;

-- Data API grants. RLS below still controls which rows/actions are allowed.
grant select on table public.projects to anon, authenticated;
grant insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.project_private_notes to authenticated;

create policy "public can read projects"
on public.projects for select
to anon, authenticated
using (true);

create policy "owner can insert projects"
on public.projects for insert
to authenticated
with check (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com');

create policy "owner can update projects"
on public.projects for update
to authenticated
using (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com')
with check (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com');

create policy "owner can delete projects"
on public.projects for delete
to authenticated
using (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com');

create policy "owner can read private notes"
on public.project_private_notes for select
to authenticated
using (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com');

create policy "owner can insert private notes"
on public.project_private_notes for insert
to authenticated
with check (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com');

create policy "owner can update private notes"
on public.project_private_notes for update
to authenticated
using (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com')
with check (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com');

create policy "owner can delete private notes"
on public.project_private_notes for delete
to authenticated
using (lower(auth.jwt() ->> 'email') = 'ghalaalhashmi80@gmail.com');
