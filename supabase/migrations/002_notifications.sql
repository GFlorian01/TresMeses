-- TresMeses - Push Notifications
-- Ejecutar en Supabase SQL Editor

-- ─── Suscripciones Push ───
create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

-- ─── Preferencias de notificacion ───
create table if not exists notification_preferences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  label       text not null,
  time        time not null,
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  unique(user_id, time)
);

-- ─── RLS ───
alter table push_subscriptions enable row level security;
alter table notification_preferences enable row level security;

create policy "push_subscriptions_own" on push_subscriptions for all using (auth.uid() = user_id);
create policy "notification_preferences_own" on notification_preferences for all using (auth.uid() = user_id);
