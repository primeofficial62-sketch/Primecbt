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
grant insert (user_id, full_name, email, exam_interests, updated_at)
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


-- PRIME PRO activation payments are separate from University subscription payments.
create table if not exists public.external_exam_activation_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique check (reference ~ '^PEXA_[A-Za-z0-9]{10,40}),
  amount_kobo integer not null default 300000 check (amount_kobo = 300000),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status text not null default 'initiated' check (status in ('initiated','pending','success','failed','abandoned','expired')),
  gateway_access_code text,
  authorization_url text,
  gateway_response text,
  channel text,
  paid_at timestamptz,
  expires_at timestamptz not null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists external_exam_activation_payments_owner_idx
  on public.external_exam_activation_payments(user_id, created_at desc);

alter table public.external_exam_activation_payments enable row level security;
revoke all on public.external_exam_activation_payments from public, anon, authenticated;
grant select on public.external_exam_activation_payments to authenticated;
grant all on public.external_exam_activation_payments to service_role;

create policy "external activation owner reads own payments"
  on public.external_exam_activation_payments
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Only the server-side Paystack verifier may mark an activation as paid.
create or replace function public.finalize_external_exam_activation(
  p_reference text,
  p_amount_kobo integer,
  p_currency text,
  p_channel text default null,
  p_gateway_response text default null,
  p_raw jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_user_id uuid;
  v_status text;
  v_amount integer;
  v_currency text;
begin
  select user_id, status, amount_kobo, currency
    into v_user_id, v_status, v_amount, v_currency
  from public.external_exam_activation_payments
  where reference = p_reference
  for update;

  if not found then raise exception 'Activation payment not found'; end if;
  if v_status = 'success' then
    return jsonb_build_object('ok', true, 'already_activated', true);
  end if;
  if v_status not in ('initiated','pending') then
    raise exception 'Activation payment is not payable';
  end if;
  if p_amount_kobo <> 300000 or p_amount_kobo <> v_amount
     or p_currency <> 'NGN' or p_currency <> v_currency then
    raise exception 'Payment amount or currency does not match PRIME PRO activation';
  end if;

  update public.external_exam_activation_payments
  set status = 'success',
      channel = left(coalesce(p_channel,''),80),
      gateway_response = left(coalesce(p_gateway_response,''),200),
      paid_at = now(),
      raw = coalesce(p_raw,'{}'::jsonb)
  where reference = p_reference;

  update public.external_exam_profiles
  set premium_activated_at = coalesce(premium_activated_at, now()),
      updated_at = now()
  where user_id = v_user_id;

  if not found then raise exception 'External Exams profile not found'; end if;
  return jsonb_build_object('ok', true, 'already_activated', false);
end;
$function$;

revoke all on function public.finalize_external_exam_activation(text, integer, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.finalize_external_exam_activation(text, integer, text, text, text, jsonb) to service_role;

commit;
