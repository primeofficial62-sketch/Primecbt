import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('active CBT question reads never request answer-key columns directly', async () => {
  const cbt = await read('../cbt.html');
  assert.doesNotMatch(cbt, /db\.from\(['"]questions['"]\)/);
  assert.match(cbt, /rpc\(['"]get_practice_questions['"]/);
  assert.match(cbt, /rpc\(['"]check_practice_answers['"]/);
  assert.match(cbt, /if \(instant\)/);
  assert.match(cbt, /restorePracticeFeedback\(\)/);
  assert.match(cbt, /rpc\(['"]submit_practice_session['"]/);
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
