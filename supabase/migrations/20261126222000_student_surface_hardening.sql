-- Student-facing hardening after the critical question/profile/PDF remediation.
-- Keep the existing student_public_profiles REST resource name, but make it a real
-- least-privilege table so public cards do not depend on a SECURITY DEFINER view.

BEGIN;

DROP VIEW IF EXISTS public.student_public_profiles;

CREATE TABLE public.student_public_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  college text,
  department text,
  institution text,
  study_level text,
  level text,
  last_seen timestamptz
);

ALTER TABLE public.student_public_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.student_public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.student_public_profiles TO authenticated;

DROP POLICY IF EXISTS "students can read public student cards" ON public.student_public_profiles;
CREATE POLICY "students can read public student cards"
  ON public.student_public_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Backfill the public-card projection without copying private contact or account fields.
INSERT INTO public.student_public_profiles (
  id, full_name, avatar_url, college, department, institution, study_level, level, last_seen
)
SELECT
  id, full_name, avatar_url, college, department, institution, study_level, level, last_seen
FROM public.profiles
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  college = EXCLUDED.college,
  department = EXCLUDED.department,
  institution = EXCLUDED.institution,
  study_level = EXCLUDED.study_level,
  level = EXCLUDED.level,
  last_seen = EXCLUDED.last_seen;

CREATE OR REPLACE FUNCTION public.sync_student_public_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.student_public_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  INSERT INTO public.student_public_profiles (
    id, full_name, avatar_url, college, department, institution, study_level, level, last_seen
  )
  VALUES (
    NEW.id, NEW.full_name, NEW.avatar_url, NEW.college, NEW.department,
    NEW.institution, NEW.study_level, NEW.level, NEW.last_seen
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    college = EXCLUDED.college,
    department = EXCLUDED.department,
    institution = EXCLUDED.institution,
    study_level = EXCLUDED.study_level,
    level = EXCLUDED.level,
    last_seen = EXCLUDED.last_seen;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.sync_student_public_profile() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS sync_student_public_profile ON public.profiles;
CREATE TRIGGER sync_student_public_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_public_profile();

-- These RPCs serve authenticated student pages; anonymous callers have no reason
-- to enumerate course topics, topic question IDs, plan state, or waitlist status.
REVOKE EXECUTE ON FUNCTION public.get_course_topics(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_course_topics(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_topic_questions(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_topic_questions(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.pro_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pro_status() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.join_pro_waitlist() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_pro_waitlist() TO authenticated;

-- Trigger handlers are not public RPC endpoints. PostgreSQL invokes them through
-- their attached triggers; client roles do not need EXECUTE privileges.
REVOKE ALL ON FUNCTION public.enqueue_notification_email() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_support_email() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.profiles_set_school_id() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.queue_topic_job() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tag_new_question() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tag_new_topic() FROM PUBLIC, anon, authenticated;

COMMIT;
