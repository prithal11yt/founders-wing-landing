-- Member-facing Journey board (/members → Journey). Members read it; only the
-- team edits it, from /team/members. Everything here is additive.

-- board_summary: the one line members see about what this person is building.
-- Kept separate from `building`, which holds the team's own call notes.
-- board_hidden: leave someone off the members' board (e.g. they asked not to be shown).
alter table public.fw_crm_members
  add column if not exists board_summary text,
  add column if not exists board_hidden boolean not null default false;
