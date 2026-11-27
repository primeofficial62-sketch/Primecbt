-- Enforce External Exams deadlines and validate answer payloads on the server.
-- This migration only changes External Exams functions; University Learning is untouched.

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
  v_started_at timestamptz;
  v_duration_seconds integer;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  if p_selected_option_index is null or p_selected_option_index < 0 or p_selected_option_index > 7 then
    raise exception 'Invalid selected answer';
  end if;

  select a.started_at, a.duration_seconds
    into v_started_at, v_duration_seconds
  from public.external_exam_attempts a
  join public.external_exam_attempt_questions aq on aq.attempt_id = a.id
  where a.id = p_attempt_id
    and a.user_id = auth.uid()
    and a.status = 'in_progress'
    and aq.question_id = p_question_id
  for update of a;

  if not found then
    raise exception 'Question is not part of this active attempt';
  end if;

  if clock_timestamp() >= v_started_at + make_interval(secs => v_duration_seconds) then
    raise exception 'Examination time has expired; submit the attempt to finalize saved answers';
  end if;

  select q.options into v_options
  from public.external_exam_questions q
  where q.id = p_question_id;

  if v_options is null or p_selected_option_index >= jsonb_array_length(v_options) then
    raise exception 'Selected answer is outside the available options';
  end if;

  insert into public.external_exam_attempt_answers(attempt_id, question_id, selected_option_index)
  values (p_attempt_id, p_question_id, p_selected_option_index)
  on conflict (attempt_id, question_id) do update
    set selected_option_index = excluded.selected_option_index,
        answered_at = clock_timestamp();
end;
$function$;

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
  v_started_at timestamptz;
  v_duration_seconds integer;
  v_expired boolean;
  v_item jsonb;
  v_question_id uuid;
  v_selected integer;
  v_option_count integer;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  if p_answers is null
     or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) > 200 then
    raise exception 'Invalid answer submission';
  end if;

  select a.status, a.total_questions, a.started_at, a.duration_seconds
    into v_status, v_total, v_started_at, v_duration_seconds
  from public.external_exam_attempts a
  where a.id = p_attempt_id
    and a.user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Attempt not found';
  end if;

  if v_status <> 'in_progress' then
    raise exception 'Attempt has already been submitted';
  end if;

  v_expired := clock_timestamp() >= v_started_at + make_interval(secs => v_duration_seconds);

  -- Before the deadline, validate every submitted answer against this attempt
  -- and the actual number of options. After expiry, only autosaved answers count.
  if not v_expired then
    for v_item in select value from jsonb_array_elements(p_answers)
    loop
      if jsonb_typeof(v_item) <> 'object'
         or jsonb_typeof(v_item->'question_id') <> 'string'
         or jsonb_typeof(v_item->'selected_option_index') <> 'number'
         or (v_item->>'question_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         or (v_item->>'selected_option_index') !~ '^[0-7]$' then
        raise exception 'Invalid answer item';
      end if;

      v_question_id := (v_item->>'question_id')::uuid;
      v_selected := (v_item->>'selected_option_index')::integer;

      select jsonb_array_length(q.options)
        into v_option_count
      from public.external_exam_attempt_questions aq
      join public.external_exam_questions q on q.id = aq.question_id
      where aq.attempt_id = p_attempt_id
        and aq.question_id = v_question_id;

      if not found then
        raise exception 'Submitted question is not part of this attempt';
      end if;

      if v_selected >= v_option_count then
        raise exception 'Selected answer is outside the available options';
      end if;

      insert into public.external_exam_attempt_answers(attempt_id, question_id, selected_option_index)
      values (p_attempt_id, v_question_id, v_selected)
      on conflict (attempt_id, question_id) do update
        set selected_option_index = excluded.selected_option_index,
            answered_at = clock_timestamp();
    end loop;
  end if;

  select count(*) into v_correct
  from public.external_exam_attempt_answers aa
  join public.external_exam_question_answers qa on qa.question_id = aa.question_id
  join public.external_exam_attempt_questions aq
    on aq.attempt_id = aa.attempt_id and aq.question_id = aa.question_id
  where aa.attempt_id = p_attempt_id
    and aa.selected_option_index = qa.correct_option_index;

  v_score := case
    when coalesce(v_total, 0) = 0 then 0
    else round((v_correct::numeric / v_total) * 100, 2)
  end;

  update public.external_exam_attempts
  set status = 'submitted',
      score = v_correct,
      submitted_at = clock_timestamp()
  where id = p_attempt_id
    and user_id = auth.uid();

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'total_questions', v_total,
    'correct_answers', v_correct,
    'score_percent', v_score,
    'submitted_at', clock_timestamp(),
    'auto_submitted', v_expired
  );
end;
$function$;

revoke all on function public.save_external_exam_answer(uuid, uuid, integer) from public, anon;
grant execute on function public.save_external_exam_answer(uuid, uuid, integer) to authenticated;
revoke all on function public.grade_external_exam_attempt(uuid, jsonb) from public, anon;
grant execute on function public.grade_external_exam_attempt(uuid, jsonb) to authenticated;
