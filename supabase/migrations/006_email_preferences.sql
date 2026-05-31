-- TresMeses - Email Preferences
-- Ejecutar en Supabase SQL Editor

create table if not exists email_preferences (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references users(id) on delete cascade unique,
  morning_enabled     boolean not null default true,
  morning_time        time not null default '08:30:00',
  evening_enabled     boolean not null default true,
  evening_time        time not null default '20:30:00',
  weekly_enabled      boolean not null default true,
  weekly_time         time not null default '21:30:00',
  morning_sent_date   date,
  evening_sent_date   date,
  weekly_sent_date    date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table email_preferences enable row level security;
create policy "email_preferences_own" on email_preferences for all using (auth.uid() = user_id);
