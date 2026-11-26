-- External Exams follow-up: remove the unnecessary SECURITY DEFINER view,
-- expand question discussion categories, and enforce subject/exam consistency.
begin;

drop view if exists public.external_exam_public_profiles;

alter table public.external_exam_chat_messages
  drop constraint if exists external_exam_chat_messages_channel_check;
alter table public.external_exam_chat_messages
  add constraint external_exam_chat_messages_channel_check
  check (channel in ('general','question','my_question','school_question','academic_question'));

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
    join public.external_exam_subjects s on s.id = q.subject_id
      and s.is_active and s.exam_code = p_exam_code
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

revoke all on function public.start_external_exam_attempt(text, uuid[], integer, integer, text) from public, anon;
grant execute on function public.start_external_exam_attempt(text, uuid[], integer, integer, text) to authenticated;

commit;
