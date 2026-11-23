-- Security hardening. Row-level security already keeps each family to its own rows; this adds limits so a signed-in
-- account can't fill the database, flood the inbox or change what only the server should set.
-- Every limit is well above what the app sends: names are at most 20 characters, a profile is a few kilobytes, a
-- family has at most 4 children, and a problem report is at most 2,000 characters.

-- 1. Size limits on everything the app writes.
alter table public.child_progress
  drop constraint if exists child_progress_child_id_len,
  add constraint child_progress_child_id_len check (char_length(child_id) between 1 and 64),
  drop constraint if exists child_progress_profile_size,
  add constraint child_progress_profile_size check (octet_length(profile::text) <= 262144);

alter table public.child_reports
  drop constraint if exists child_reports_lengths,
  add constraint child_reports_lengths check (
    char_length(child_id) between 1 and 64
    and char_length(child_name) between 1 and 40
    and char_length(coalesce(skills_line, '')) <= 600
    and char_length(coalesce(practice_idea, '')) <= 600
  ),
  drop constraint if exists child_reports_counts,
  add constraint child_reports_counts check (
    levels_done between 0 and 100 and level_count between 0 and 100 and total_levels between 0 and 1000
    and stars between 0 and 100000
  );

alter table public.problem_reports
  drop constraint if exists problem_reports_meta_len,
  add constraint problem_reports_meta_len check (
    char_length(coalesce(app_version, '')) <= 40 and char_length(coalesce(platform, '')) <= 40
  );

-- 2. A family can't create endless children (the app allows 4; 8 leaves room for removed and re-added ones).
create or replace function public.child_progress_limit() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- An upsert runs this trigger even when it ends up updating, so the child being saved is not counted.
  if (select count(*) from public.child_progress where user_id = new.user_id and child_id <> new.child_id) >= 8 then
    raise exception 'too many children for one account' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists child_progress_limit on public.child_progress;
create trigger child_progress_limit before insert on public.child_progress
  for each row execute function public.child_progress_limit();

-- 3. Problem reports: at most 10 a day per account, and only the dashboard can change their status.
create or replace function public.problem_reports_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' then
    new.status := 'new';
    new.created_at := now();
    if (select count(*) from public.problem_reports
        where user_id = new.user_id and created_at > now() - interval '1 day') >= 10 then
      raise exception 'too many reports today' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists problem_reports_guard on public.problem_reports;
create trigger problem_reports_guard before insert on public.problem_reports
  for each row execute function public.problem_reports_guard();

-- 4. The end-of-grade email goes once per grade per child. Only the server records that it was sent.
alter table public.child_reports add column if not exists grade_emailed smallint;

create or replace function public.child_reports_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if current_user = 'authenticated' then
    new.sent_levels := old.sent_levels;
    new.sent_stars := old.sent_stars;
    new.grade_emailed := old.grade_emailed;
  end if;
  return new;
end $$;

create or replace function public.child_reports_start() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.sent_levels := new.total_levels;
  new.sent_stars := new.stars;
  if current_user = 'authenticated' then
    new.grade_emailed := null;
  end if;
  return new;
end $$;

-- 5. Only the server sets when reports were last sent.
create or replace function public.report_settings_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' then
    if tg_op = 'INSERT' then
      new.opted_in_at := now();
      new.last_sent_at := null;
    else
      new.opted_in_at := old.opted_in_at;
      new.last_sent_at := old.last_sent_at;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists report_settings_guard on public.report_settings;
create trigger report_settings_guard before insert or update on public.report_settings
  for each row execute function public.report_settings_guard();

-- 6. Fix the remaining trigger function's search path, as Supabase's security advisor asks.
create or replace function public.child_progress_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
