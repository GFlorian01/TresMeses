-- TresMeses - Schema inicial
-- Ejecutar en Supabase SQL Editor

-- Habilitar UUID
create extension if not exists "uuid-ossp";

-- ─── Usuarios ───
create table if not exists users (
  id          uuid primary key,
  email       text not null unique,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Ciclos de 12 semanas ───
create table if not exists cycles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  goals       text[] not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Hábitos ───
create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  name        text not null,
  icon        text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Entradas diarias ───
create table if not exists daily_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  date             date not null,
  is_gym_day       boolean not null default false,
  is_recovery_day  boolean not null default false,
  reading_minutes  int not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(user_id, date)
);

-- ─── Checks de hábitos ───
create table if not exists habit_checks (
  id              uuid primary key default gen_random_uuid(),
  daily_entry_id  uuid not null references daily_entries(id) on delete cascade,
  habit_id        uuid not null references habits(id) on delete cascade,
  completed       boolean not null default false,
  created_at      timestamptz not null default now(),
  unique(daily_entry_id, habit_id)
);

-- ─── Tipo enum para comidas ───
create type meal_type as enum ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- ─── Entradas de comida ───
create table if not exists meal_entries (
  id              uuid primary key default gen_random_uuid(),
  daily_entry_id  uuid not null references daily_entries(id) on delete cascade,
  meal_type       meal_type not null,
  completed       boolean not null default false,
  description     text,
  created_at      timestamptz not null default now(),
  unique(daily_entry_id, meal_type)
);

-- ─── Revisiones semanales ───
create table if not exists weekly_reviews (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  cycle_id         uuid not null references cycles(id) on delete cascade,
  week_number      int not null,
  score            float,
  reflection       text,
  cause_analysis   text,
  load_adjustment  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(cycle_id, week_number)
);

-- ─── Trigger para updated_at automático ───
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on users
  for each row execute function update_updated_at();

create trigger daily_entries_updated_at
  before update on daily_entries
  for each row execute function update_updated_at();

create trigger weekly_reviews_updated_at
  before update on weekly_reviews
  for each row execute function update_updated_at();

-- ─── Row Level Security ───
alter table users enable row level security;
alter table cycles enable row level security;
alter table habits enable row level security;
alter table daily_entries enable row level security;
alter table habit_checks enable row level security;
alter table meal_entries enable row level security;
alter table weekly_reviews enable row level security;

-- Policies: cada usuario solo ve sus propios datos
create policy "users_own" on users for all using (auth.uid() = id);
create policy "cycles_own" on cycles for all using (auth.uid() = user_id);
create policy "habits_own" on habits for all using (auth.uid() = user_id);
create policy "daily_entries_own" on daily_entries for all using (auth.uid() = user_id);
create policy "weekly_reviews_own" on weekly_reviews for all using (auth.uid() = user_id);

create policy "habit_checks_own" on habit_checks for all using (
  exists (
    select 1 from daily_entries
    where daily_entries.id = habit_checks.daily_entry_id
    and daily_entries.user_id = auth.uid()
  )
);

create policy "meal_entries_own" on meal_entries for all using (
  exists (
    select 1 from daily_entries
    where daily_entries.id = meal_entries.daily_entry_id
    and daily_entries.user_id = auth.uid()
  )
);
