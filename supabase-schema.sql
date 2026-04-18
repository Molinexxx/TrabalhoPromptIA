create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.user_quiz (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  objetivo text not null,
  nivel text not null,
  frequencia text not null,
  foco_muscular text not null,
  peso numeric(5,2) not null check (peso >= 20 and peso <= 400),
  altura numeric(5,2) not null check (altura >= 80 and altura <= 250),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.generated_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  title text not null,
  summary text not null,
  prompt text not null,
  workout_data jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  title text not null,
  plan_data jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_user_quiz_updated_at on public.user_quiz;
create trigger set_user_quiz_updated_at
before update on public.user_quiz
for each row
execute function public.handle_updated_at();

drop trigger if exists set_generated_workouts_updated_at on public.generated_workouts;
create trigger set_generated_workouts_updated_at
before update on public.generated_workouts
for each row
execute function public.handle_updated_at();

drop trigger if exists set_weekly_plans_updated_at on public.weekly_plans;
create trigger set_weekly_plans_updated_at
before update on public.weekly_plans
for each row
execute function public.handle_updated_at();

alter table public.user_quiz enable row level security;
alter table public.generated_workouts enable row level security;
alter table public.weekly_plans enable row level security;

drop policy if exists "user_quiz_select_own" on public.user_quiz;
create policy "user_quiz_select_own"
on public.user_quiz
for select
using (auth.uid() = user_id);

drop policy if exists "user_quiz_insert_own" on public.user_quiz;
create policy "user_quiz_insert_own"
on public.user_quiz
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_quiz_update_own" on public.user_quiz;
create policy "user_quiz_update_own"
on public.user_quiz
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "generated_workouts_select_own" on public.generated_workouts;
create policy "generated_workouts_select_own"
on public.generated_workouts
for select
using (auth.uid() = user_id);

drop policy if exists "generated_workouts_insert_own" on public.generated_workouts;
create policy "generated_workouts_insert_own"
on public.generated_workouts
for insert
with check (auth.uid() = user_id);

drop policy if exists "generated_workouts_update_own" on public.generated_workouts;
create policy "generated_workouts_update_own"
on public.generated_workouts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "weekly_plans_select_own" on public.weekly_plans;
create policy "weekly_plans_select_own"
on public.weekly_plans
for select
using (auth.uid() = user_id);

drop policy if exists "weekly_plans_insert_own" on public.weekly_plans;
create policy "weekly_plans_insert_own"
on public.weekly_plans
for insert
with check (auth.uid() = user_id);

drop policy if exists "weekly_plans_update_own" on public.weekly_plans;
create policy "weekly_plans_update_own"
on public.weekly_plans
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
