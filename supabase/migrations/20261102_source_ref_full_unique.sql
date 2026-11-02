-- The unique index on source_ref was partial (WHERE source_ref IS NOT NULL), which
-- ON CONFLICT (source_ref) can't use, so every Twitter sheet sync with new rows
-- failed with 42P10. A plain unique index gives the same guarantee, because
-- Postgres treats NULLs as distinct, and works with ON CONFLICT.
create unique index if not exists waitlist_applications_source_ref_key
  on public.waitlist_applications (source_ref);
drop index if exists public.waitlist_applications_source_ref_idx;
