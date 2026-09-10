alter table public.projects add column if not exists github_repo_id bigint;
alter table public.projects add column if not exists github_full_name text;
alter table public.projects add column if not exists github_synced_at timestamptz;
alter table public.projects add column if not exists github_description text;
alter table public.projects add column if not exists github_language text;
alter table public.projects add column if not exists github_topics text[] not null default '{}';
alter table public.projects add column if not exists github_stars integer not null default 0;
alter table public.projects add column if not exists github_updated_at timestamptz;

create unique index if not exists projects_github_repo_id_key
  on public.projects(github_repo_id)
  where github_repo_id is not null;

create index if not exists projects_github_full_name_idx
  on public.projects(github_full_name)
  where github_full_name is not null;

create table if not exists public.app_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

drop policy if exists "deny client access to app secrets" on public.app_secrets;
create policy "deny client access to app secrets"
  on public.app_secrets
  for select
  to anon, authenticated
  using (false);

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- The production project stores github_sync_token in app_secrets at deploy time.
-- Never commit that token. The scheduled job reads it from the protected table.
