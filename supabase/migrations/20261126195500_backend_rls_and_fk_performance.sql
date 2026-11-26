-- Reduce avoidable RLS policy work and add indexes for foreign-key joins.
-- All policy predicates preserve the existing ownership/role conditions.
begin;

-- Foreign keys used by admin history and background question-generation queries.
create index if not exists payment_refunds_payment_id_idx
  on public.payment_refunds (payment_id);
create index if not exists prime_command_audit_approval_id_idx
  on public.prime_command_audit (approval_id);
create index if not exists question_jobs_course_id_idx
  on public.question_jobs (course_id);

-- These explicit anon/authenticated policies duplicate the equivalent PUBLIC policies.
drop policy if exists "Public can read departments" on public.departments;
drop policy if exists "Public can read faculties" on public.faculties;
drop policy if exists "Public can read schools" on public.schools;

-- Wrap auth lookups in scalar SELECTs so Postgres can evaluate them once per statement.
drop policy if exists "own ledger read" on public.ai_quota_ledger;
create policy "own ledger read" on public.ai_quota_ledger
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "own pq read" on public.practice_quota_sessions;
create policy "own pq read" on public.practice_quota_sessions
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "pro_payments read own" on public.pro_payments;
create policy "pro_payments read own" on public.pro_payments
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "pro_waitlist read own" on public.pro_waitlist;
create policy "pro_waitlist read own" on public.pro_waitlist
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "authorized email writes topics" on public.material_topics;
create policy "authorized email writes topics" on public.material_topics
  for all to authenticated
  using (((select auth.jwt()) ->> 'email') = 'imodumicheal519@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'imodumicheal519@gmail.com');

commit;
