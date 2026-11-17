-- Weekly email reports, which a grown-up turns on in the app (Grown-ups page).
-- Nothing is stored here until they do. Turning reports off deletes both tables' rows for them,
-- and deleting the account deletes them too (on delete cascade).

create table if not exists public.report_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  opted_in_at timestamptz not null default now(),
  last_sent_at timestamptz
);

-- One short summary per child, written by the app after each level. No answers, avatars or badges.
create table if not exists public.child_reports (
  user_id uuid not null references auth.users (id) on delete cascade,
  child_id text not null,
  child_name text not null,
  grade smallint not null check (grade between 1 and 3),
  levels_done smallint not null,
  level_count smallint not null,
  total_levels smallint not null,
  stars integer not null,
  skills_line text,
  practice_idea text,
  updated_at timestamptz not null default now(),
  -- What the last email reported, so the next one can say what changed. Set by the server, not the app.
  sent_levels smallint not null default 0,
  sent_stars integer not null default 0,
  primary key (user_id, child_id)
);

-- A new child starts from what they have already done, so their first report counts only this week.
create or replace function public.child_reports_start() returns trigger
language plpgsql as $$
begin
  new.sent_levels := new.total_levels;
  new.sent_stars := new.stars;
  return new;
end $$;

-- Every update from the app marks the child as played this week. The app can't change what was last sent.
create or replace function public.child_reports_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  if current_user = 'authenticated' then
    new.sent_levels := old.sent_levels;
    new.sent_stars := old.sent_stars;
  end if;
  return new;
end $$;

drop trigger if exists child_reports_start on public.child_reports;
create trigger child_reports_start before insert on public.child_reports
  for each row execute function public.child_reports_start();

drop trigger if exists child_reports_touch on public.child_reports;
create trigger child_reports_touch before update on public.child_reports
  for each row execute function public.child_reports_touch();

alter table public.report_settings enable row level security;
alter table public.child_reports enable row level security;

-- Each grown-up sees and changes only their own rows. The send-report function uses the service role.
drop policy if exists "own report settings" on public.report_settings;
create policy "own report settings" on public.report_settings
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own child reports" on public.child_reports;
create policy "own child reports" on public.child_reports
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
