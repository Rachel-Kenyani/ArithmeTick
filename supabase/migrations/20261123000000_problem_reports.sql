-- Problems and ideas grown-ups report from the app (Grown-ups page → Report a problem).
-- Read them in the Table Editor. Deleted with the account (on delete cascade).
-- Holds only what the grown-up types, the kind of report, an optional grade, and the app version and phone type.

create table if not exists public.problem_reports (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('broken', 'hard', 'idea', 'other')),
  message text not null check (char_length(message) between 1 and 2000),
  grade smallint check (grade between 1 and 3),
  app_version text,
  platform text,
  status text not null default 'new' check (status in ('new', 'seen', 'fixed')),
  created_at timestamptz not null default now()
);

alter table public.problem_reports enable row level security;

-- A grown-up can send reports and see their own; only you (in the dashboard) see everyone's.
drop policy if exists "send own reports" on public.problem_reports;
create policy "send own reports" on public.problem_reports
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "read own reports" on public.problem_reports;
create policy "read own reports" on public.problem_reports
  for select to authenticated using (auth.uid() = user_id);
