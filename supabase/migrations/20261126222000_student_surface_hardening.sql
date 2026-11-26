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

-- The practice catalogue is intentionally browsable before sign-in. These two
-- SECURITY DEFINER RPCs expose only topic labels/counts and question IDs/difficulty;
-- keep them public so practice.html and practice-setup.html retain guest discovery.
-- Pro status and waitlist actions are account-specific and remain authenticated.
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


-- 2) Student performance privacy. The leaderboard reads aggregates through the
--    owner-checked get_leaderboard() RPC; raw attempts must remain private.
DROP POLICY IF EXISTS "read attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "students can read own attempts" ON public.exam_attempts;
CREATE POLICY "students can read own attempts"
  ON public.exam_attempts
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON public.exam_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.exam_attempts TO authenticated;

-- Keep live leaderboard refreshes without exposing raw exam_attempts or profile rows
-- through Realtime. Subscribers receive only an opaque event marker and reload the
-- aggregated, authenticated get_leaderboard() RPC.
CREATE TABLE IF NOT EXISTS public.leaderboard_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('attempt', 'profile')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leaderboard_events_created_at_idx
  ON public.leaderboard_events (created_at);

ALTER TABLE public.leaderboard_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.leaderboard_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.leaderboard_events TO authenticated;

DROP POLICY IF EXISTS "authenticated can read leaderboard event markers" ON public.leaderboard_events;
CREATE POLICY "authenticated can read leaderboard event markers"
  ON public.leaderboard_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.emit_leaderboard_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  INSERT INTO public.leaderboard_events (event_type)
  VALUES (CASE WHEN TG_TABLE_NAME = 'exam_attempts' THEN 'attempt' ELSE 'profile' END);

  DELETE FROM public.leaderboard_events
  WHERE created_at < now() - interval '7 days';

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.emit_leaderboard_event() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS emit_leaderboard_event_after_attempt ON public.exam_attempts;
CREATE TRIGGER emit_leaderboard_event_after_attempt
  AFTER INSERT ON public.exam_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.emit_leaderboard_event();

DROP TRIGGER IF EXISTS emit_leaderboard_event_after_profile_update ON public.profiles;
CREATE TRIGGER emit_leaderboard_event_after_profile_update
  AFTER UPDATE OF full_name, level, department ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.emit_leaderboard_event();

DO $publication$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'leaderboard_events'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_events;
  END IF;
END;
$publication$;


-- 3) The legacy AI quota RPC accepted p_limit from the browser. A student could
--    call it directly with an arbitrarily large value and bypass the configured
--    daily cap. Keep the argument for backwards compatibility, but never trust it.
CREATE OR REPLACE FUNCTION public.ai_use_quota(p_limit integer DEFAULT 40)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  uid uuid := auth.uid();
  n integer;
  lim integer;
  user_plan text;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'used', 0, 'limit', 0);
  END IF;

  IF public.is_pro(uid) THEN
    RETURN jsonb_build_object('allowed', true, 'used', 0, 'limit', null, 'unlimited', true);
  END IF;

  SELECT p.plan INTO user_plan
  FROM public.profiles p
  WHERE p.id = uid;

  SELECT pl.daily_limit INTO lim
  FROM public.plan_limits pl
  WHERE pl.feature = 'ai'
    AND pl.plan IN (coalesce(user_plan, 'free'), 'free')
  ORDER BY (pl.plan = 'free') ASC
  LIMIT 1;

  -- Fail closed to a conservative default if the plan configuration is missing.
  IF lim IS NULL OR lim < 1 THEN
    lim := 3;
  END IF;

  INSERT INTO public.ai_usage (user_id, day, count)
  VALUES (uid, current_date, 1)
  ON CONFLICT (user_id, day)
  DO UPDATE SET count = public.ai_usage.count + 1
  RETURNING count INTO n;

  RETURN jsonb_build_object('allowed', n <= lim, 'used', n, 'limit', lim);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.ai_use_quota(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ai_use_quota(integer) TO authenticated;

-- Restrict feature-flag helpers to internal SECURITY DEFINER callers. They are
-- not student-facing RPCs and return arbitrary flag state by key.
REVOKE ALL ON FUNCTION public.flag_on(text) FROM PUBLIC, anon, authenticated;

-- plan_tier is used by the signed-in student's own avatar badge. Do not let a
-- student supply another student's UUID to inspect their plan.
CREATE OR REPLACE FUNCTION public.plan_tier(uid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL OR uid IS DISTINCT FROM auth.uid() THEN 'basic'
    WHEN public.is_pro(uid) THEN 'pro'
    WHEN EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = uid AND p.plan = 'premium'
        AND (p.plan_expires_at IS NULL OR p.plan_expires_at > now())
    ) THEN 'premium'
    ELSE 'basic'
  END;
$function$;

REVOKE EXECUTE ON FUNCTION public.plan_tier(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.plan_tier(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_plan_tiers(uuid[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._admin_key_ok(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_leaderboard(text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, text, integer) TO authenticated;

COMMIT;
