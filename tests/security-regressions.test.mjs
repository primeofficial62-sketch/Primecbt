import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('active CBT question reads never request answer-key columns directly', async () => {
  const cbt = await read('../cbt.html');
  const practice = await read('../practice.html');
  assert.doesNotMatch(cbt, /db\.from\(['"]questions['"]\)/);
  assert.match(cbt, /rpc\(['"]get_practice_questions['"]/);
  assert.match(cbt, /rpc\(['"]check_practice_answers['"]/);
  assert.match(cbt, /if \(instant\)/);
  assert.match(cbt, /restorePracticeFeedback\(\)/);
  assert.match(cbt, /rpc\(['"]submit_practice_session['"]/);
  assert.match(practice, /rpc\(['"]question_counts['"]/);
  assert.doesNotMatch(practice, /questions\(count\)/);
  const scripts = [];
  let cursor = 0;
  while ((cursor = cbt.indexOf('<script', cursor)) >= 0) {
    const open = cbt.indexOf('>', cursor);
    const close = cbt.indexOf('</script>', open);
    if (open < 0 || close < 0) break;
    const source = cbt.slice(open + 1, close);
    if (source.trim()) scripts.push(source);
    cursor = close + 9;
  }
  assert.ok(scripts.length);
  new vm.Script(scripts.at(-1));
});

test('question migration removes direct answer-key access and restricts answer RPCs', async () => {
  const migration = await read('../supabase/migrations/20261126213000_prime_cbt_critical_security_fixes.sql');
  assert.match(migration, /revoke select on table public\.questions from public, anon, authenticated/i);
  assert.match(migration, /grant select \([\s\S]*?options[\s\S]*?image_url[\s\S]*?\) on table public\.questions to anon, authenticated/i);
  assert.match(migration, /create or replace function public\.get_practice_questions/i);
  assert.match(migration, /returns table \([\s\S]*?options jsonb[\s\S]*?image_url text[\s\S]*?svg text/i);
  assert.match(migration, /create or replace function public\.check_practice_answers/i);
  assert.match(migration, /revoke all on function public\.check_practice_answers\(jsonb\) from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.check_practice_answers\(jsonb\) to authenticated/i);
  assert.match(migration, /revoke execute on function public\.pick_questions\(text, integer\) from public, anon, authenticated/i);
});

test('profile privacy keeps full access to self and exposes only approved public-card fields', async () => {
  const migration = await read('../supabase/migrations/20261126213000_prime_cbt_critical_security_fixes.sql');
  const community = await read('../community.html');
  const discussion = await read('../discussion.html');
  assert.match(migration, /drop policy if exists "profiles readable by signed-in users"/i);
  assert.match(migration, /create policy "users can read own profile"[\s\S]*?using \(\(select auth\.uid\(\)\) = id\)/i);
  const view = migration.match(/create or replace view public\.student_public_profiles[\s\S]*?from public\.profiles;/i)?.[0] || '';
  assert.ok(view);
  for (const privateColumn of ['phone', 'whatsapp', 'bio', 'settings', 'plan_code', 'plan_expires_at']) {
    assert.doesNotMatch(view, new RegExp('\\b' + privateColumn + '\\b', 'i'));
  }
  assert.match(community, /from\('student_public_profiles'\)/);
  assert.match(discussion, /from\('student_public_profiles'\)/);
});

test('PDF conversion requires the admin PIN proxy and server-only service credentials', async () => {
  const api = await read('../api/admin.js');
  const admin = await read('../admin/admin.html');
  const edge = await read('../supabase/functions/convert-to-pdf/index.ts');
  assert.match(api, /async convert_pdf\(req, res, b\)[\s\S]*?await requireAuth\(req\)/);
  assert.match(api, /target\.origin !== base\.origin/);
  assert.match(api, /target\.search \|\| target\.hash/);
  assert.match(api, /apikey: KEY[\s\S]*?Authorization: 'Bearer ' \+ KEY/);
  assert.match(admin, /api\('convert_pdf', \{ file_url: fileUrl \}, 180000\)/);
  assert.doesNotMatch(admin, /functions\/v1\/convert-to-pdf|CONVERT_KEY/);
  assert.match(edge, /authorization/);
  assert.match(edge, /serviceKey/);
  assert.match(edge, /claim_pdf_conversion_job/);
  assert.match(edge, /rate_limited/);
  assert.match(edge, /MAX_FILE_BYTES/);
  assert.match(edge, /target\.origin !== base\.origin/);
});

test('PDF conversion database locks are server-only and rate limited', async () => {
  const migration = await read('../supabase/migrations/20261126213000_prime_cbt_critical_security_fixes.sql');
  assert.match(migration, /create table if not exists public\.pdf_conversion_jobs/i);
  assert.match(migration, /create table if not exists public\.pdf_conversion_rate_limits/i);
  assert.match(migration, /alter table public\.pdf_conversion_jobs enable row level security/i);
  assert.match(migration, /revoke all on public\.pdf_conversion_jobs, public\.pdf_conversion_rate_limits from public, anon, authenticated/i);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /v_count > 5/);
  assert.match(migration, /grant execute on function public\.claim_pdf_conversion_job\(text, text, text\) to service_role/i);
});



test('student public profiles use a safe RLS-protected table, not a definer view', async () => {
  const migration = await read('../supabase/migrations/20261126222000_student_surface_hardening.sql');
  const community = await read('../community.html');
  const discussion = await read('../discussion.html');
  assert.ok(migration.includes('DROP VIEW IF EXISTS public.student_public_profiles;'));
  assert.ok(migration.includes('CREATE TABLE public.student_public_profiles'));
  assert.ok(migration.includes('ALTER TABLE public.student_public_profiles ENABLE ROW LEVEL SECURITY'));
  assert.ok(migration.includes('GRANT SELECT ON public.student_public_profiles TO authenticated'));
  assert.match(migration, /CREATE POLICY "students can read public student cards"[\s\S]*?FOR SELECT[\s\S]*?TO authenticated[\s\S]*?USING \(true\)/i);
  assert.match(migration, /CREATE TRIGGER sync_student_public_profile[\s\S]*?AFTER INSERT OR UPDATE OR DELETE ON public\.profiles/i);
  assert.ok(migration.includes('REVOKE ALL ON FUNCTION public.sync_student_public_profile() FROM PUBLIC, anon, authenticated'));
  assert.doesNotMatch(migration, /CREATE OR REPLACE VIEW public\.student_public_profiles/i);
  assert.ok(community.includes(".from('student_public_profiles')"));
  assert.ok(discussion.includes(".from('student_public_profiles')"));
});

test('student setup only requests the granted question id column for exact counts', async () => {
  const setup = await read('../practice-setup.html');
  const countBlock = setup.match(/async function countQuestions\(difficulty\)[\s\S]*?\n    }/)?.[0] || '';
  assert.ok(countBlock.includes(".select('id', { count: 'exact', head: true })"));
  assert.doesNotMatch(countBlock, /select\('\*'/);
});

test('student-only SECURITY DEFINER RPCs and trigger handlers are not callable by anon clients', async () => {
  const migration = await read('../supabase/migrations/20261126222000_student_surface_hardening.sql');
  for (const signature of [
    'pro_status()', 'join_pro_waitlist()'
  ]) {
    assert.ok(migration.includes('REVOKE EXECUTE ON FUNCTION public.' + signature + ' FROM PUBLIC, anon'));
    assert.ok(migration.includes('GRANT EXECUTE ON FUNCTION public.' + signature + ' TO authenticated'));
  }
  for (const fn of ['enqueue_notification_email', 'notify_support_email', 'profiles_set_school_id', 'queue_topic_job', 'tag_new_question', 'tag_new_topic']) {
    assert.ok(migration.includes('REVOKE ALL ON FUNCTION public.' + fn + '() FROM PUBLIC, anon, authenticated'));
  }
});


test('student performance rows stay private while leaderboard live updates use opaque markers', async () => {
  const migration = await read('../supabase/migrations/20261126222000_student_surface_hardening.sql');
  const leaderboard = await read('../leaderboard.html');
  const achievements = await read('../achievements.html');
  assert.match(migration, /drop policy if exists "read attempts" on public\.exam_attempts/i);
  assert.match(migration, /create policy "students can read own attempts"[\s\S]*?using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(migration, /create table if not exists public\.leaderboard_events/i);
  assert.match(migration, /alter table public\.leaderboard_events enable row level security/i);
  assert.match(migration, /create policy "authenticated can read leaderboard event markers"[\s\S]*?using \(true\)/i);
  assert.match(migration, /create trigger emit_leaderboard_event_after_attempt[\s\S]*?after insert on public\.exam_attempts/i);
  assert.match(migration, /create trigger emit_leaderboard_event_after_profile_update[\s\S]*?after update of full_name, level, department on public\.profiles/i);
  assert.match(migration, /revoke all on function public\.emit_leaderboard_event\(\) from public, anon, authenticated/i);
  assert.match(migration, /alter publication supabase_realtime add table public\.leaderboard_events/i);
  assert.match(leaderboard, /table: 'leaderboard_events'/);
  assert.doesNotMatch(leaderboard, /table: 'exam_attempts'/);
  assert.doesNotMatch(leaderboard, /table: 'profiles'/);
  assert.match(achievements, /db\.from\(T\.results\)\.select\('xp_earned,total_questions,correct_answers,created_at'\)[\s\S]*?\.eq\('user_id', state\.user\.id\)/);
});


test('AI quota consumption is service-role-only and plan badges are self-scoped', async () => {
  const migration = await read('../supabase/migrations/20261126222000_student_surface_hardening.sql');
  const assistant = await read('../api/assistant.js');
  const studyTools = await read('../api/study-tools.js');
  const tierBadge = await read('../tier-badge.js');
  assert.match(migration, /create or replace function public\.consume_ai_quota\(p_user_id uuid, p_limit integer\)[\s\S]*?auth\.role\(\) is distinct from 'service_role'[\s\S]*?v_count <= v_limit/i);
  assert.match(migration, /revoke all on function public\.consume_ai_quota\(uuid, integer\) from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.consume_ai_quota\(uuid, integer\) to service_role/i);
  assert.match(migration, /revoke all on function public\.ai_use_quota\(integer\) from public, anon, authenticated/i);
  assert.match(migration, /uid is distinct from auth\.uid\(\)/i);
  assert.match(migration, /revoke execute on function public\.plan_tier\(uuid\) from public, anon/i);
  assert.match(assistant, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(assistant, /consume_ai_quota/);
  assert.match(assistant, /useQuota\(user\.id\)/);
  assert.doesNotMatch(assistant, /rpc\/ai_use_quota/);
  assert.match(studyTools, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(studyTools, /consume_ai_quota/);
  assert.match(studyTools, /consumeQuota\(who\.data\.id\)/);
  assert.doesNotMatch(studyTools, /rpc\/ai_use_quota/);
  assert.match(tierBadge, /rpc\('plan_tier', \{ uid: uid \}\)/);
  assert.match(migration, /revoke all on function public\.flag_on\(text\) from public, anon, authenticated/i);
  assert.match(migration, /revoke all on function public\.get_plan_tiers\(uuid\[\]\) from public, anon, authenticated/i);
});


test('study tools fail closed when the shared AI quota service is unavailable', async () => {
  const studyTools = await read('../api/study-tools.js');
  assert.match(studyTools, /if \(!q\.ok \|\| !q\.data \|\| typeof q\.data\.allowed !== 'boolean'\)[\s\S]*?throw new HttpError\(503/);
  assert.match(studyTools, /if \(q\.data\.allowed === false\)[\s\S]*?throw new HttpError\(429/);
});


test('answer review uses the owner-checked result RPC instead of direct answer-key joins', async () => {
  const review = await read('../answer-review.html');
  assert.match(review, /rpc\('get_practice_result', \{ p_result_id: state\.result\.id \}\)/);
  assert.doesNotMatch(review, /from\(T\.answers\)[\s\S]*?questions\(question,options,explanation\)/);
  assert.match(review, /item\.question_id/);
  assert.match(review, /item\.correct_index/);
});


test('completed-session review RPCs reveal answer keys only to the owning student', async () => {
  const migration = await read('../supabase/migrations/20261126222000_student_surface_hardening.sql');
  const review = await read('../answer-review.html');
  const results = await read('../results.html');
  const cbt = await read('../cbt.html');
  assert.match(migration, /create or replace function public\.get_practice_result\(p_result_id uuid\)[\s\S]*?s\.user_id = auth\.uid\(\)[\s\S]*?s\.total_questions > 0/i);
  assert.match(migration, /create or replace function public\.get_retake_questions\(p_session_id uuid\)[\s\S]*?s\.user_id = auth\.uid\(\)[\s\S]*?s\.total_questions > 0/i);
  assert.match(migration, /revoke execute on function public\.get_practice_result\(uuid\) from public, anon/i);
  assert.match(migration, /revoke execute on function public\.get_retake_questions\(uuid\) from public, anon/i);
  assert.match(review, /rpc\('get_practice_result'/);
  assert.match(results, /rpc\('get_practice_result'/);
  assert.match(cbt, /rpc\('get_retake_questions'/);
});
