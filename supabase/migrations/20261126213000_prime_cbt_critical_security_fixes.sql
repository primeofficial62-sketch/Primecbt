-- PRIME-CBT critical security remediation: question keys, student profiles and PDF conversion.
-- Apply only after the matching application changes are deployed.

-- 1) Keep question-bank content readable, but never expose answer keys through table SELECT.
REVOKE SELECT ON TABLE public.questions FROM PUBLIC, anon, authenticated;
GRANT SELECT (
  id, course_id, question, options, difficulty, created_at,
  image_url, svg, source_material_id, source_quote, ai_generated
) ON TABLE public.questions TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_practice_questions(
  p_ids uuid[] DEFAULT NULL,
  p_course_ids uuid[] DEFAULT NULL,
  p_difficulty text DEFAULT 'mixed',
  p_limit integer DEFAULT 2000
)
RETURNS TABLE (
  id uuid,
  question text,
  options jsonb,
  difficulty text,
  image_url text,
  svg text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF (p_ids IS NULL OR cardinality(p_ids) = 0)
     AND (p_course_ids IS NULL OR cardinality(p_course_ids) = 0) THEN
    RAISE EXCEPTION 'A question id list or course id list is required';
  END IF;

  IF coalesce(p_difficulty, 'mixed') NOT IN ('easy', 'medium', 'hard', 'mixed') THEN
    RAISE EXCEPTION 'Invalid difficulty';
  END IF;

  RETURN QUERY
  SELECT q.id, q.question, q.options, q.difficulty, q.image_url, q.svg
  FROM public.questions AS q
  WHERE (p_ids IS NULL OR cardinality(p_ids) = 0 OR q.id = ANY(p_ids))
    AND (p_course_ids IS NULL OR cardinality(p_course_ids) = 0 OR q.course_id = ANY(p_course_ids))
    AND (coalesce(p_difficulty, 'mixed') = 'mixed' OR q.difficulty = p_difficulty)
  ORDER BY q.created_at ASC
  LIMIT greatest(1, least(coalesce(p_limit, 2000), 2000));
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_practice_answers(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'array'
     OR jsonb_array_length(p_answers) = 0
     OR jsonb_array_length(p_answers) > 200 THEN
    RAISE EXCEPTION 'Submit between 1 and 200 practice answers';
  END IF;

  SELECT coalesce(
    jsonb_agg(jsonb_build_object(
      'question_id', q.id,
      'correct_index', q.correct_index,
      'explanation', q.explanation
    )),
    '[]'::jsonb
  )
  INTO v_result
  FROM jsonb_array_elements(p_answers) AS e
  JOIN public.questions AS q
    ON q.id = (e ->> 'question_id')::uuid
  WHERE nullif(e ->> 'selected_index', '') IS NOT NULL
    AND (e ->> 'selected_index')::integer >= 0
    AND (e ->> 'selected_index')::integer < jsonb_array_length(to_jsonb(q.options));

  RETURN v_result;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_practice_questions(uuid[], uuid[], text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_practice_questions(uuid[], uuid[], text, integer) TO authenticated;
REVOKE ALL ON FUNCTION public.check_practice_answers(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_practice_answers(jsonb) TO authenticated;

-- These functions return answer keys only after a completed, user-owned session.
REVOKE EXECUTE ON FUNCTION public.get_retake_questions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_retake_questions(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_practice_result(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_practice_result(uuid) TO authenticated;

-- Legacy SECURITY DEFINER function returned complete question rows without an ownership check.
REVOKE EXECUTE ON FUNCTION public.pick_questions(text, integer) FROM PUBLIC, anon, authenticated;

-- 2) Students may read their own full profile. Other students are visible only through
--    a deliberately limited public-card view (no phone, WhatsApp, bio, settings or plan fields).
DROP POLICY IF EXISTS "profiles readable by signed-in users" ON public.profiles;
DROP POLICY IF EXISTS "users can read own profile" ON public.profiles;
CREATE POLICY "users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE OR REPLACE VIEW public.student_public_profiles
WITH (security_barrier = true, security_invoker = false)
AS
SELECT
  id,
  full_name,
  avatar_url,
  college,
  department,
  institution,
  study_level,
  level,
  last_seen
FROM public.profiles;

REVOKE ALL ON public.student_public_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.student_public_profiles TO authenticated;

-- 3) Server-only PDF conversion job locks and per-minute rate limiting.
CREATE TABLE IF NOT EXISTS public.pdf_conversion_jobs (
  bucket text NOT NULL,
  source_path text NOT NULL,
  pdf_path text NOT NULL,
  status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'completed', 'failed')),
  locked_until timestamptz,
  cloudconvert_job_id text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket, source_path)
);

CREATE TABLE IF NOT EXISTS public.pdf_conversion_rate_limits (
  window_start timestamptz PRIMARY KEY,
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0)
);

ALTER TABLE public.pdf_conversion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_conversion_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pdf_conversion_jobs, public.pdf_conversion_rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdf_conversion_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdf_conversion_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.claim_pdf_conversion_job(
  p_bucket text,
  p_source_path text,
  p_pdf_path text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_status text;
  v_locked_until timestamptz;
  v_window timestamptz := date_trunc('minute', now());
  v_count integer;
BEGIN
  IF coalesce(p_bucket, '') = '' OR coalesce(p_source_path, '') = '' OR coalesce(p_pdf_path, '') = '' THEN
    RAISE EXCEPTION 'Invalid conversion job';
  END IF;

  -- Serialise claims so simultaneous requests cannot bypass the global rate limit.
  PERFORM pg_advisory_xact_lock(hashtext('prime_pdf_conversion_rate'));

  SELECT status, locked_until
    INTO v_status, v_locked_until
  FROM public.pdf_conversion_jobs
  WHERE bucket = p_bucket AND source_path = p_source_path
  FOR UPDATE;

  IF FOUND AND v_status = 'processing' AND v_locked_until > now() THEN
    RETURN 'busy';
  END IF;

  INSERT INTO public.pdf_conversion_rate_limits(window_start, request_count)
  VALUES (v_window, 1)
  ON CONFLICT (window_start)
  DO UPDATE SET request_count = public.pdf_conversion_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  DELETE FROM public.pdf_conversion_rate_limits
  WHERE window_start < now() - interval '10 minutes';

  IF v_count > 5 THEN
    RETURN 'rate_limited';
  END IF;

  INSERT INTO public.pdf_conversion_jobs(
    bucket, source_path, pdf_path, status, locked_until,
    cloudconvert_job_id, last_error, created_at, updated_at
  )
  VALUES (
    p_bucket, p_source_path, p_pdf_path, 'processing', now() + interval '3 minutes',
    NULL, NULL, now(), now()
  )
  ON CONFLICT (bucket, source_path)
  DO UPDATE SET
    pdf_path = EXCLUDED.pdf_path,
    status = 'processing',
    locked_until = EXCLUDED.locked_until,
    cloudconvert_job_id = NULL,
    last_error = NULL,
    created_at = now(),
    updated_at = now();

  RETURN 'claimed';
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_pdf_conversion_job(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pdf_conversion_job(text, text, text) TO service_role;
