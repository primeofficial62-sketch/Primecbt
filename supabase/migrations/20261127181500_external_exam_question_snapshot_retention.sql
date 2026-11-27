-- Expire provider question snapshots after a student's attempt window.
-- Keep the student's attempt summary and score; do not retain a permanent question mirror.
begin;
alter table public.external_exam_api_attempt_questions
  add column if not exists expires_at timestamptz not null default (now() + interval '30 days');
create index if not exists external_exam_api_attempt_questions_expiry_idx
  on public.external_exam_api_attempt_questions(expires_at);

do $$
begin
  if not exists(select 1 from cron.job where jobname='external-exam-api-question-retention') then
    perform cron.schedule(
      'external-exam-api-question-retention',
      '17 3 * * *',
      $job$delete from public.external_exam_api_attempt_questions where expires_at <= now();$job$
    );
  end if;
end
$$;
commit;