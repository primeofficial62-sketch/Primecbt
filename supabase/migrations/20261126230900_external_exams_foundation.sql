-- PRIME-CBT External Examinations: isolated schema.
-- Does not alter University tables, policies, functions, or existing auth flows.
begin;

create table if not exists public.external_exam_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  exam_interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.external_exam_subjects (
  id uuid primary key default gen_random_uuid(),
  exam_code text not null check (exam_code in ('JAMB','WAEC','NECO','GCE','POST_UTME')),
  name text not null,
  slug text not null,
  syllabus_version text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (exam_code, slug)
);

create table if not exists public.external_exam_topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.external_exam_subjects(id) on delete cascade,
  parent_topic_id uuid references public.external_exam_topics(id) on delete set null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.external_exam_resources (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.external_exam_subjects(id) on delete set null,
  topic_id uuid references public.external_exam_topics(id) on delete set null,
  exam_code text not null check (exam_code in ('JAMB','WAEC','NECO','GCE','POST_UTME')),
  resource_type text not null check (resource_type in ('past_question','video_lesson','topic_video','workbook','novel','lesson')),
  title text not null,
  description text,
  source_year integer,
  source_label text,
  storage_path text,
  external_url text,
  duration_seconds integer,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Public question content and private answer keys are deliberately separate.
create table if not exists public.external_exam_questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.external_exam_subjects(id) on delete cascade,
  topic_id uuid references public.external_exam_topics(id) on delete set null,
  exam_code text not null check (exam_code in ('JAMB','WAEC','NECO','GCE','POST_UTME')),
  exam_year integer,
  source_type text not null check (source_type in ('official_past_question','original_practice')),
  question_text text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 8),
  image_url text,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.external_exam_question_answers (
  question_id uuid primary key references public.external_exam_questions(id) on delete cascade,
  correct_option_index integer not null check (correct_option_index between 0 and 7),
  explanation text,
  updated_at timestamptz not null default now()
);

create table if not exists public.external_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_code text not null check (exam_code in ('JAMB','WAEC','NECO','GCE','POST_UTME')),
  mode text not null default 'practice' check (mode in ('practice','timed','challenge')),
  status text not null default 'in_progress' check (status in ('in_progress','submitted','abandoned')),
  total_questions integer not null default 0,
  duration_seconds integer not null default 3600,
  score integer,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.external_exam_attempt_questions (
  attempt_id uuid not null references public.external_exam_attempts(id) on delete cascade,
  question_id uuid not null references public.external_exam_questions(id) on delete restrict,
  position integer not null,
  primary key (attempt_id, question_id),
  unique (attempt_id, position)
);

create table if not exists public.external_exam_attempt_answers (
  attempt_id uuid not null,
  question_id uuid not null,
  selected_option_index integer not null check (selected_option_index between 0 and 7),
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id),
  foreign key (attempt_id, question_id)
    references public.external_exam_attempt_questions(attempt_id, question_id) on delete cascade
);

create table if not exists public.external_exam_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null default 'general' check (channel in ('general','question')),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.external_exam_groups (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 70),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.external_exam_group_members (
  group_id uuid not null references public.external_exam_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.external_exam_group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.external_exam_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.external_exam_updates (
  id uuid primary key default gen_random_uuid(),
  update_type text not null check (update_type in ('news','event')),
  title text not null,
  summary text,
  image_url text,
  target_url text,
  starts_at timestamptz,
  published_at timestamptz not null default now(),
  is_published boolean not null default false
);

create or replace view public.external_exam_public_profiles
with (security_barrier = true, security_invoker = false)
as select user_id, full_name from public.external_exam_profiles;
revoke all on public.external_exam_public_profiles from public, anon;
grant select on public.external_exam_public_profiles to authenticated;

create index if not exists external_exam_topics_subject_idx on public.external_exam_topics(subject_id, sort_order);
create index if not exists external_exam_resources_lookup_idx on public.external_exam_resources(exam_code, resource_type, is_published);
create index if not exists external_exam_questions_lookup_idx on public.external_exam_questions(exam_code, subject_id, status);
create index if not exists external_exam_attempts_owner_idx on public.external_exam_attempts(user_id, started_at desc);
create index if not exists external_exam_chat_channel_idx on public.external_exam_chat_messages(channel, created_at desc);
create index if not exists external_exam_group_messages_idx on public.external_exam_group_messages(group_id, created_at desc);
create index if not exists external_exam_updates_type_idx on public.external_exam_updates(update_type, is_published, published_at desc);

alter table public.external_exam_profiles enable row level security;
alter table public.external_exam_subjects enable row level security;
alter table public.external_exam_topics enable row level security;
alter table public.external_exam_resources enable row level security;
alter table public.external_exam_questions enable row level security;
alter table public.external_exam_question_answers enable row level security;
alter table public.external_exam_attempts enable row level security;
alter table public.external_exam_attempt_questions enable row level security;
alter table public.external_exam_attempt_answers enable row level security;
alter table public.external_exam_chat_messages enable row level security;
alter table public.external_exam_groups enable row level security;
alter table public.external_exam_group_members enable row level security;
alter table public.external_exam_group_messages enable row level security;
alter table public.external_exam_updates enable row level security;

create policy "external profile owner read" on public.external_exam_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "external profile owner insert" on public.external_exam_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "external profile owner update" on public.external_exam_profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "active external subjects readable" on public.external_exam_subjects
  for select to authenticated using (is_active);
create policy "published external topics readable" on public.external_exam_topics
  for select to authenticated using (is_published);
create policy "published external resources readable" on public.external_exam_resources
  for select to authenticated using (is_published);
create policy "published external questions readable" on public.external_exam_questions
  for select to authenticated using (status = 'published');
create policy "external updates readable" on public.external_exam_updates
  for select to authenticated using (is_published);

create policy "external attempts owner read" on public.external_exam_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "external attempt questions owner read" on public.external_exam_attempt_questions
  for select to authenticated using (
    exists (select 1 from public.external_exam_attempts a
      where a.id = attempt_id and a.user_id = (select auth.uid()))
  );
create policy "external attempt answers owner read" on public.external_exam_attempt_answers
  for select to authenticated using (
    exists (select 1 from public.external_exam_attempts a
      where a.id = attempt_id and a.user_id = (select auth.uid()))
  );

create policy "external chat readable" on public.external_exam_chat_messages
  for select to authenticated using (true);
create policy "external chat insert own" on public.external_exam_chat_messages
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "external groups readable" on public.external_exam_groups
  for select to authenticated using (true);
create policy "external groups create own" on public.external_exam_groups
  for insert to authenticated with check ((select auth.uid()) = created_by);
create or replace function public.is_external_exam_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select exists (
    select 1 from public.external_exam_group_members m
    where m.group_id = p_group_id and m.user_id = auth.uid()
  );
$function$;

revoke all on function public.is_external_exam_group_member(uuid) from public, anon;
grant execute on function public.is_external_exam_group_member(uuid) to authenticated;

create policy "external group membership readable" on public.external_exam_group_members
  for select to authenticated using (user_id = (select auth.uid()));
create policy "external group join self" on public.external_exam_group_members
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "external group messages readable by members" on public.external_exam_group_messages
  for select to authenticated using (
    public.is_external_exam_group_member(group_id)
  );
create policy "external group messages insert by members" on public.external_exam_group_messages
  for insert to authenticated with check (
    (select auth.uid()) = user_id and public.is_external_exam_group_member(group_id)
  );

-- Answer-key table has RLS enabled and intentionally has no client-facing policies.
revoke all on public.external_exam_questions from public, anon, authenticated;
revoke all on public.external_exam_question_answers from public, anon, authenticated;
grant select (id, exam_code, exam_year, source_type, subject_id, topic_id, question_text, options, image_url, status, created_at)
  on public.external_exam_questions to authenticated;
revoke all on public.external_exam_questions from anon;

grant select, insert, update on public.external_exam_profiles to authenticated;
grant select on public.external_exam_subjects, public.external_exam_topics,
  public.external_exam_resources, public.external_exam_updates to authenticated;
grant select on public.external_exam_attempts, public.external_exam_attempt_questions,
  public.external_exam_attempt_answers to authenticated;
grant select, insert on public.external_exam_chat_messages to authenticated;
grant select, insert on public.external_exam_groups, public.external_exam_group_members,
  public.external_exam_group_messages to authenticated;

-- Start a session from published questions only. Question count is capped server-side.
create or replace function public.start_external_exam_attempt(
  p_exam_code text,
  p_subject_ids uuid[],
  p_question_count integer default 40,
  p_duration_seconds integer default 7200,
  p_mode text default 'practice'
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_attempt_id uuid;
  v_count integer;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_exam_code not in ('JAMB','WAEC','NECO','GCE','POST_UTME') then raise exception 'Invalid exam'; end if;
  if p_mode not in ('practice','timed','challenge') then raise exception 'Invalid mode'; end if;
  if p_subject_ids is null or cardinality(p_subject_ids) = 0 then raise exception 'Select at least one subject'; end if;

  insert into public.external_exam_attempts(user_id, exam_code, mode, duration_seconds)
  values (auth.uid(), p_exam_code, p_mode,
    greatest(60, least(coalesce(p_duration_seconds, 7200), 14400)))
  returning id into v_attempt_id;

  insert into public.external_exam_attempt_questions(attempt_id, question_id, position)
  select v_attempt_id, chosen.id, row_number() over (order by chosen.random_key)
  from (
    select q.id, random() as random_key
    from public.external_exam_questions q
    join public.external_exam_subjects s on s.id = q.subject_id and s.is_active
    where q.exam_code = p_exam_code and q.status = 'published'
      and q.subject_id = any(p_subject_ids)
    order by random()
    limit greatest(1, least(coalesce(p_question_count, 40), 200))
  ) chosen;

  get diagnostics v_count = row_count;
  if v_count = 0 then
    delete from public.external_exam_attempts where id = v_attempt_id;
    raise exception 'No published questions are available for the selected subjects yet';
  end if;

  update public.external_exam_attempts set total_questions = v_count where id = v_attempt_id;
  return v_attempt_id;
end;
$function$;


create or replace function public.save_external_exam_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_selected_option_index integer
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_options jsonb;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_selected_option_index is null or p_selected_option_index < 0 or p_selected_option_index > 7 then
    raise exception 'Invalid selected answer';
  end if;
  if not exists (
    select 1 from public.external_exam_attempts a
    join public.external_exam_attempt_questions aq on aq.attempt_id = a.id
    where a.id = p_attempt_id and a.user_id = auth.uid()
      and a.status = 'in_progress' and aq.question_id = p_question_id
  ) then raise exception 'Question is not part of this active attempt'; end if;

  select q.options into v_options
  from public.external_exam_questions q where q.id = p_question_id;
  if v_options is null or p_selected_option_index >= jsonb_array_length(v_options) then
    raise exception 'Selected answer is outside the available options';
  end if;

  insert into public.external_exam_attempt_answers(attempt_id, question_id, selected_option_index)
  values (p_attempt_id, p_question_id, p_selected_option_index)
  on conflict (attempt_id, question_id) do update
    set selected_option_index = excluded.selected_option_index, answered_at = now();
end;
$function$;

revoke all on function public.save_external_exam_answer(uuid, uuid, integer) from public, anon;
grant execute on function public.save_external_exam_answer(uuid, uuid, integer) to authenticated;

create or replace function public.grade_external_exam_attempt(
  p_attempt_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_total integer;
  v_correct integer;
  v_score numeric;
  v_status text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) > 200 then
    raise exception 'Invalid answer submission';
  end if;

  select status, total_questions into v_status, v_total
  from public.external_exam_attempts
  where id = p_attempt_id and user_id = auth.uid()
  for update;
  if not found then raise exception 'Attempt not found'; end if;
  if v_status <> 'in_progress' then raise exception 'Attempt has already been submitted'; end if;

  insert into public.external_exam_attempt_answers(attempt_id, question_id, selected_option_index)
  select p_attempt_id, (item->>'question_id')::uuid, (item->>'selected_option_index')::integer
  from jsonb_array_elements(p_answers) item
  where exists (
    select 1 from public.external_exam_attempt_questions aq
    where aq.attempt_id = p_attempt_id and aq.question_id = (item->>'question_id')::uuid
  )
  on conflict (attempt_id, question_id) do update
    set selected_option_index = excluded.selected_option_index, answered_at = now();

  select count(*) into v_correct
  from public.external_exam_attempt_answers aa
  join public.external_exam_question_answers qa on qa.question_id = aa.question_id
  where aa.attempt_id = p_attempt_id and aa.selected_option_index = qa.correct_option_index;

  v_score := case when coalesce(v_total,0) = 0 then 0 else round((v_correct::numeric / v_total) * 100, 2) end;
  update public.external_exam_attempts
  set status = 'submitted', score = v_correct, submitted_at = now()
  where id = p_attempt_id and user_id = auth.uid();

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'total_questions', v_total,
    'correct_answers', v_correct,
    'score_percent', v_score,
    'submitted_at', now()
  );
end;
$function$;

revoke all on function public.start_external_exam_attempt(text, uuid[], integer, integer, text) from public, anon;
grant execute on function public.start_external_exam_attempt(text, uuid[], integer, integer, text) to authenticated;
revoke all on function public.grade_external_exam_attempt(uuid, jsonb) from public, anon;
grant execute on function public.grade_external_exam_attempt(uuid, jsonb) to authenticated;

commit;
