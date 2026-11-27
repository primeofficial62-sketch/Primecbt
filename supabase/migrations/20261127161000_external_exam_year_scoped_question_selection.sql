-- External Exams: year-scoped question selection and attempt history.
begin;
alter table public.external_exam_attempts add column if not exists exam_year integer check (exam_year between 1990 and 2026);
create or replace function public.start_external_exam_attempt(
  p_exam_code text, p_subject_ids uuid[], p_question_count integer,
  p_duration_seconds integer, p_mode text, p_exam_year integer
) returns uuid language plpgsql security definer set search_path = pg_catalog, public as $function$
declare v_attempt_id uuid; v_count integer;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_exam_code not in ('JAMB','WAEC','NECO','GCE','POST_UTME') then raise exception 'Invalid exam'; end if;
  if p_mode not in ('practice','timed','challenge') then raise exception 'Invalid mode'; end if;
  if p_exam_year is null or p_exam_year < 1990 or p_exam_year > 2026 then raise exception 'Choose an examination year between 1990 and 2026'; end if;
  if p_subject_ids is null or cardinality(p_subject_ids) = 0 then raise exception 'Select at least one subject'; end if;
  insert into public.external_exam_attempts(user_id,exam_code,exam_year,mode,duration_seconds)
  values(auth.uid(),p_exam_code,p_exam_year,p_mode,greatest(60,least(coalesce(p_duration_seconds,7200),14400))) returning id into v_attempt_id;
  insert into public.external_exam_attempt_questions(attempt_id,question_id,position)
  select v_attempt_id,chosen.id,row_number() over(order by chosen.random_key)
  from (select q.id,random() as random_key from public.external_exam_questions q
    join public.external_exam_subjects s on s.id=q.subject_id and s.is_active
    where q.exam_code=p_exam_code and q.exam_year=p_exam_year and q.status='published'
      and q.subject_id=any(p_subject_ids) order by random()
    limit greatest(1,least(coalesce(p_question_count,40),200))) chosen;
  get diagnostics v_count = row_count;
  if v_count=0 then delete from public.external_exam_attempts where id=v_attempt_id; raise exception 'No published questions are available for the selected subjects and year yet'; end if;
  update public.external_exam_attempts set total_questions=v_count where id=v_attempt_id;
  return v_attempt_id;
end; $function$;
revoke all on function public.start_external_exam_attempt(text,uuid[],integer,integer,text,integer) from public,anon;
grant execute on function public.start_external_exam_attempt(text,uuid[],integer,integer,text,integer) to authenticated;
commit;