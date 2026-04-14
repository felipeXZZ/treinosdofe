-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  body_weight numeric,
  goal text,
  workout_type text default 'upper_lower' check (workout_type in ('upper_lower', 'anterior_posterior', 'pacholok')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workout Plans
create table workout_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workout Days
create table workout_days (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references workout_plans(id) on delete cascade not null,
  name text not null,
  day_order integer not null,
  is_rest_day boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exercises
create table exercises (
  id uuid default gen_random_uuid() primary key,
  day_id uuid references workout_days(id) on delete cascade not null,
  name text not null,
  sets integer not null,
  working_sets integer, -- if set, first (sets - working_sets) are warmup; null means all sets are working sets
  reps_range text not null,
  exercise_order integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workout Logs (Sessions)
create table workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  day_id uuid references workout_days(id) on delete set null,
  date date not null default current_date,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set Logs
create table set_logs (
  id uuid default gen_random_uuid() primary key,
  workout_log_id uuid references workout_logs(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number integer not null,
  weight numeric,
  reps integer,
  completed boolean default false,
  set_type text default 'working' check (set_type in ('warmup', 'working')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cardio Logs
create table cardio_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  workout_log_id uuid references workout_logs(id) on delete set null,
  date date not null default current_date,
  type text not null,
  duration_minutes integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table profiles enable row level security;
alter table workout_plans enable row level security;
alter table workout_days enable row level security;
alter table exercises enable row level security;
alter table workout_logs enable row level security;
alter table set_logs enable row level security;
alter table cardio_logs enable row level security;

-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Workout Plans
create policy "Users can view own plans" on workout_plans for select using (auth.uid() = user_id);
create policy "Users can insert own plans" on workout_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own plans" on workout_plans for update using (auth.uid() = user_id);
create policy "Users can delete own plans" on workout_plans for delete using (auth.uid() = user_id);

-- Workout Days
create policy "Users can view own days" on workout_days for select using (
  plan_id in (select id from workout_plans where user_id = auth.uid())
);
create policy "Users can insert own days" on workout_days for insert with check (
  plan_id in (select id from workout_plans where user_id = auth.uid())
);
create policy "Users can update own days" on workout_days for update using (
  plan_id in (select id from workout_plans where user_id = auth.uid())
);
create policy "Users can delete own days" on workout_days for delete using (
  plan_id in (select id from workout_plans where user_id = auth.uid())
);

-- Exercises
create policy "Users can view own exercises" on exercises for select using (
  day_id in (select id from workout_days where plan_id in (select id from workout_plans where user_id = auth.uid()))
);
create policy "Users can insert own exercises" on exercises for insert with check (
  day_id in (select id from workout_days where plan_id in (select id from workout_plans where user_id = auth.uid()))
);
create policy "Users can update own exercises" on exercises for update using (
  day_id in (select id from workout_days where plan_id in (select id from workout_plans where user_id = auth.uid()))
);
create policy "Users can delete own exercises" on exercises for delete using (
  day_id in (select id from workout_days where plan_id in (select id from workout_plans where user_id = auth.uid()))
);

-- Workout Logs
create policy "Users can view own workout logs" on workout_logs for select using (auth.uid() = user_id);
create policy "Users can insert own workout logs" on workout_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own workout logs" on workout_logs for update using (auth.uid() = user_id);
create policy "Users can delete own workout logs" on workout_logs for delete using (auth.uid() = user_id);

-- Set Logs
create policy "Users can view own set logs" on set_logs for select using (
  workout_log_id in (select id from workout_logs where user_id = auth.uid())
);
create policy "Users can insert own set logs" on set_logs for insert with check (
  workout_log_id in (select id from workout_logs where user_id = auth.uid())
);
create policy "Users can update own set logs" on set_logs for update using (
  workout_log_id in (select id from workout_logs where user_id = auth.uid())
);
create policy "Users can delete own set logs" on set_logs for delete using (
  workout_log_id in (select id from workout_logs where user_id = auth.uid())
);

-- Cardio Logs
create policy "Users can view own cardio logs" on cardio_logs for select using (auth.uid() = user_id);
create policy "Users can insert own cardio logs" on cardio_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own cardio logs" on cardio_logs for update using (auth.uid() = user_id);
create policy "Users can delete own cardio logs" on cardio_logs for delete using (auth.uid() = user_id);

-- Function to handle new user signup — creates profile only.
-- The workout plan is created by the frontend after the user selects a plan type
-- on the onboarding screen (/onboarding).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION for existing deployments (run once if upgrading from the previous
-- schema that did not have workout_type on profiles):
--
--   alter table profiles
--     add column if not exists workout_type text
--       default 'upper_lower'
--       check (workout_type in ('upper_lower', 'anterior_posterior', 'pacholok'));
--
--   update profiles set workout_type = 'upper_lower' where workout_type is null;
-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION for adding 'pacholok' to an existing deployment:
--
--   alter table profiles
--     drop constraint if exists profiles_workout_type_check;
--
--   alter table profiles
--     add constraint profiles_workout_type_check
--       check (workout_type in ('upper_lower', 'anterior_posterior', 'pacholok'));
-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION for warmup/working sets (run once on existing deployments):
--
--   alter table exercises
--     add column if not exists working_sets integer;
--
--   alter table set_logs
--     add column if not exists set_type text
--       default 'working'
--       check (set_type in ('warmup', 'working'));
--
--   update set_logs set set_type = 'working' where set_type is null;
-- ─────────────────────────────────────────────────────────────────────────────
