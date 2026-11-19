-- Each child's progress, saved with the parent's account so it comes back on a new phone or after a reinstall.
-- Written by the app after each change; read when a parent signs in. Deleted with the account (on delete cascade).
-- Holds: first name, animal, grade, stars, badges, level progress and recent answers. No unfinished boards.

create table if not exists public.child_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  child_id text not null,
  profile jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, child_id)
);

create or replace function public.child_progress_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists child_progress_touch on public.child_progress;
create trigger child_progress_touch before insert or update on public.child_progress
  for each row execute function public.child_progress_touch();

alter table public.child_progress enable row level security;

-- Each parent reads and writes only their own family.
drop policy if exists "own child progress" on public.child_progress;
create policy "own child progress" on public.child_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
