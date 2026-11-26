-- Keep the external exam answer-key table explicitly inaccessible to client roles.
-- The grading SECURITY DEFINER functions access it server-side only.
create policy "external answer keys are server only"
  on public.external_exam_question_answers
  for all to authenticated
  using (false)
  with check (false);
