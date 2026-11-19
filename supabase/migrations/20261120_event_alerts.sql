-- Weekly startup-events alert sign-ups from /events pages (applied 20 Nov 2026).
create table if not exists public.fw_event_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 5 and 200),
  city_slug text not null default 'india' check (city_slug ~ '^[a-z0-9-]{1,60}$'),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unique (email, city_slug)
);
comment on table public.fw_event_alerts is 'Weekly startup-events alert sign-ups from /events pages. Written only by /api/event-alerts with the service key.';
alter table public.fw_event_alerts enable row level security;
revoke all on public.fw_event_alerts from anon, authenticated;
