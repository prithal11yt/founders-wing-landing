-- Team tracker: per-action logging for the intern (leads, members, sessions,
-- WhatsApp posts, ideas, daily check-ins, targets). Everything here is additive.

-- Twitter leads live in a Google Sheet; they get synced into the same leads
-- table so the team works one list. source_ref is the stable sheet key.
alter table public.waitlist_applications
  add column if not exists twitter_handle text,
  add column if not exists product text,
  add column if not exists source_ref text;
create unique index if not exists waitlist_applications_source_ref_idx
  on public.waitlist_applications (source_ref) where source_ref is not null;

-- Each logged lead call now carries what was said + structured tags so
-- objections / asks can be aggregated into patterns.
alter table public.lead_call_events
  add column if not exists note text,
  add column if not exists tags text[] not null default '{}';
create index if not exists lead_call_events_created_idx on public.lead_call_events (created_at desc);

-- Calls / WhatsApp nudges to existing members (live-session attendance work).
create table if not exists public.fw_member_touchpoints (
  id uuid primary key default gen_random_uuid(),
  member_email text not null,
  member_name text,
  actor text not null default 'team',
  channel text not null default 'call' check (channel in ('call', 'whatsapp')),
  outcome text not null check (outcome in ('answered', 'no_answer', 'callback', 'messaged')),
  reasons text[] not null default '{}',
  wants text[] not null default '{}',
  note text,
  will_attend_next boolean,
  follow_up_at date,
  session_id uuid references public.fw_calls (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists fw_member_touchpoints_email_idx on public.fw_member_touchpoints (member_email);
create index if not exists fw_member_touchpoints_created_idx on public.fw_member_touchpoints (created_at desc);
alter table public.fw_member_touchpoints enable row level security;

-- Sessions get a topic, a target and post-session bookkeeping.
alter table public.fw_calls
  add column if not exists topic text,
  add column if not exists target_attendance integer,
  add column if not exists recap_posted boolean not null default false,
  add column if not exists notes text,
  add column if not exists created_by text;

-- Attendance can now be marked by the team from the Meet participant list,
-- not only self-marked by members.
alter table public.fw_attendance
  add column if not exists marked_by text not null default 'self';

-- One row per WhatsApp group post the team makes.
create table if not exists public.fw_whatsapp_posts (
  id uuid primary key default gen_random_uuid(),
  posted_on date not null,
  category text not null,
  content text,
  replies integer not null default 0,
  reactions integer not null default 0,
  actor text not null default 'team',
  created_at timestamptz not null default now()
);
create index if not exists fw_whatsapp_posts_day_idx on public.fw_whatsapp_posts (posted_on desc);
alter table public.fw_whatsapp_posts enable row level security;

-- Shared ideas backlog (founder + team).
create table if not exists public.fw_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text,
  category text not null default 'general',
  raised_by text not null default 'team',
  status text not null default 'inbox' check (status in ('inbox', 'planned', 'doing', 'done', 'parked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  done_at timestamptz
);
alter table public.fw_ideas enable row level security;

-- End-of-day check-in. Numbers are derived live; this is the human part.
create table if not exists public.fw_daily_checkins (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  actor text not null default 'team',
  learned text,
  blockers text,
  plan_tomorrow text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day, actor)
);
alter table public.fw_daily_checkins enable row level security;

-- Key/value settings (daily targets live here so the founder can tune them).
create table if not exists public.fw_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.fw_settings enable row level security;
insert into public.fw_settings (key, value) values
  ('team_targets', '{"lead_calls": 15, "member_calls": 5, "whatsapp_posts": 1, "session_attendance": 25, "working_days": [1,2,3,4,5,6]}')
on conflict (key) do nothing;
