-- Temporary, user-scoped question snapshots for live third-party CBT attempts.
-- This avoids permanently mirroring a provider's full question database.
begin;

alter table public.external_exam_attempts
  add column if not exists question_provider text not null default 'local';
alter table public.external_exam_attempts
  drop constraint if exists external_exam_attempts_question_provider_check;
alter table public.external_exam_attempts
  add constraint external_exam_attempts_question_provider_check
  check (question_provider in ('local','sdashapi'));

create table if not exists public.external_exam_api_attempt_questions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.external_exam_attempts(id) on delete cascade,
  provider_question_id text not null,
  position integer not null check (position > 0),
  subject_name text not null,
  exam_year integer not null check (exam_year between 1990 and 2026),
  question_text text not null,
  section text,
  options jsonb not null check (jsonb_typeof(options)='array' and jsonb_array_length(options) between 2 and 5),
  image_url text,
  created_at timestamptz not null default now(),
  unique(attempt_id,position),
  unique(attempt_id,provider_question_id),
  unique(attempt_id,id)
);

-- Private answer keys are never exposed through the client Data API.
create table if not exists public.external_exam_api_question_answers (
  question_id uuid primary key references public.external_exam_api_attempt_questions(id) on delete cascade,
  correct_option_index integer not null check (correct_option_index between 0 and 4),
  solution text,
  created_at timestamptz not null default now()
);

create table if not exists public.external_exam_api_user_answers (
  attempt_id uuid not null,
  question_id uuid not null,
  selected_option_index integer not null check (selected_option_index between 0 and 4),
  answered_at timestamptz not null default now(),
  primary key(attempt_id,question_id),
  foreign key(attempt_id,question_id)
    references public.external_exam_api_attempt_questions(attempt_id,id) on delete cascade
);

create index if not exists external_exam_api_questions_attempt_idx
  on public.external_exam_api_attempt_questions(attempt_id,position);
create index if not exists external_exam_api_answers_attempt_idx
  on public.external_exam_api_user_answers(attempt_id);

alter table public.external_exam_api_attempt_questions enable row level security;
alter table public.external_exam_api_question_answers enable row level security;
alter table public.external_exam_api_user_answers enable row level security;

drop policy if exists "external api attempt questions owner read" on public.external_exam_api_attempt_questions;
create policy "external api attempt questions owner read"
on public.external_exam_api_attempt_questions for select to authenticated
using (exists(select 1 from public.external_exam_attempts a where a.id=attempt_id and a.user_id=(select auth.uid())));

drop policy if exists "external api user answers owner read" on public.external_exam_api_user_answers;
create policy "external api user answers owner read"
on public.external_exam_api_user_answers for select to authenticated
using (exists(select 1 from public.external_exam_attempts a where a.id=attempt_id and a.user_id=(select auth.uid())));

revoke all on public.external_exam_api_question_answers from public,anon,authenticated;
revoke all on public.external_exam_api_attempt_questions from public,anon,authenticated;
revoke all on public.external_exam_api_user_answers from public,anon,authenticated;
grant select on public.external_exam_api_attempt_questions,public.external_exam_api_user_answers to authenticated;

commit;