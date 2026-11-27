-- PRIME-CBT External Exams: PRIME PRO gating and trusted news feed metadata.
-- This migration only changes External Exams tables. University tables, policies,
-- authentication configuration and University CBT workflows remain untouched.
begin;

alter table public.external_exam_profiles
  add column if not exists premium_activated_at timestamptz;

alter table public.external_exam_resources
  add column if not exists is_premium boolean not null default false;

alter table public.external_exam_updates
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists source_item_id text;

create unique index if not exists external_exam_updates_source_item_uidx
  on public.external_exam_updates(source_item_id);

create index if not exists external_exam_updates_feed_order_idx
  on public.external_exam_updates(update_type, is_published, published_at desc);

-- The feed synchronizer is service-role only; browser clients cannot manipulate
-- refresh state or mark content as published.
create table if not exists public.external_exam_feed_sync_state (
  singleton boolean primary key default true check (singleton),
  last_synced_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);

insert into public.external_exam_feed_sync_state(singleton)
values (true)
on conflict (singleton) do nothing;

alter table public.external_exam_feed_sync_state enable row level security;
revoke all on public.external_exam_feed_sync_state from public, anon, authenticated;
grant all on public.external_exam_feed_sync_state to service_role;

-- Keep user-editable profile fields writable, but never let a browser user grant
-- PRIME PRO to themselves by setting premium_activated_at.
revoke insert, update on public.external_exam_profiles from authenticated;
grant insert (user_id, full_name, email, exam_interests)
  on public.external_exam_profiles to authenticated;
grant update (full_name, email, exam_interests, updated_at)
  on public.external_exam_profiles to authenticated;

drop policy if exists "published external resources readable" on public.external_exam_resources;
create policy "published external resources readable"
  on public.external_exam_resources
  for select to authenticated
  using (
    is_published
    and (
      not is_premium
      or exists (
        select 1
        from public.external_exam_profiles p
        where p.user_id = (select auth.uid())
          and p.premium_activated_at is not null
      )
    )
  );

commit;
