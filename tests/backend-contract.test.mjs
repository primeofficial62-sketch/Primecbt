import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const assistant = await readFile(new URL('../api/assistant.js', import.meta.url), 'utf8');
const admin = await readFile(new URL('../api/admin.js', import.meta.url), 'utf8');

test('assistant usage limits fail closed when quota service is unavailable', () => {
  assert.match(assistant, /if \(!r\.ok\) return \{ allowed: false, unavailable: true \}/);
  assert.match(assistant, /if \(quota && quota\.unavailable\)[\s\S]*?\}, 503\)/);
  assert.doesNotMatch(assistant, /if \(!r\.ok\) return \{ allowed: true \}/);
});

test('assistant limits oversized requests before expensive work', () => {
  assert.match(assistant, /contentLength > 3000000/);
  assert.match(assistant, /\}, 413\)/);
});

test('assistant sends only the fields needed for recent test-result context', () => {
  const block = assistant.match(/async function resultsBlock[\s\S]*?\n}\n/);
  assert.ok(block, 'resultsBlock should exist');
  assert.match(block[0], /select=score,total_questions,course_title,course_code,created_at/);
  assert.doesNotMatch(block[0], /select=\*/);
});

test('admin Supabase requests have a bounded timeout', () => {
  assert.match(admin, /signal: AbortSignal\.timeout\(20000\)/);
});

test('PRIME COMMAND approval decisions are pending-only and action-allowlisted', () => {
  const block = admin.match(/async pc_decide_approval\([\s\S]*?\n  },\n\n  \/\/ Common commands/);
  assert.ok(block, 'approval decision handler should exist');
  assert.match(block[0], /status=eq\.pending/);
  assert.match(block[0], /approval\.action_type === 'queue_generation'/);
  assert.match(block[0], /approval\.action_type === 'create_question'/);
  assert.match(block[0], /approval\.action_type === 'update_question'/);
  assert.match(block[0], /Approved action is not on the allowlist/);
});

test('maintenance settings are exposed only through the PIN-authenticated admin API', () => {
  const getBlock = admin.match(/async maintenance_get\([\s\S]*?\n  },/);
  const setBlock = admin.match(/async maintenance_set\([\s\S]*?\n  },/);
  assert.ok(getBlock, 'maintenance_get action should exist');
  assert.ok(setBlock, 'maintenance_set action should exist');
  assert.match(getBlock[0], /await requireAuth\(req\)/);
  assert.match(setBlock[0], /await requireAuth\(req\)/);
  assert.match(setBlock[0], /Array\.isArray\(b\.p_emails\)/);
  assert.match(setBlock[0], /allowed email addresses are invalid/);
});

test('admin maintenance UI no longer calls public maintenance RPCs directly', async () => {
  const html = await readFile(new URL('../admin/admin.html', import.meta.url), 'utf8');
  assert.match(html, /api\('maintenance_get'\)/);
  assert.match(html, /api\('maintenance_set'/);
  assert.doesNotMatch(html, /site_settings_set|site_settings_get|MM_APIKEY/);
});

test('assistant database and Gemini calls have bounded durations', () => {
  assert.match(assistant, /AbortSignal\.timeout\(8000\)/);
  assert.match(assistant, /AbortSignal\.timeout\(90000\)/);
});

test('maintenance RPC migration revokes public and authenticated access', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20261126194500_revoke_public_maintenance_settings_access.sql', import.meta.url), 'utf8');
  assert.match(migration, /revoke execute on function public\.site_settings_get\(\) from public, anon, authenticated/i);
  assert.match(migration, /revoke execute on function public\.site_settings_set\(boolean, text, text\[\]\) from public, anon, authenticated/i);
});

test('database performance migration preserves scoped RLS and adds missing FK indexes', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20261126195500_backend_rls_and_fk_performance.sql', import.meta.url), 'utf8');
  assert.match(migration, /create index if not exists question_jobs_course_id_idx/i);
  assert.match(migration, /create index if not exists prime_command_audit_approval_id_idx/i);
  assert.match(migration, /create index if not exists payment_refunds_payment_id_idx/i);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(migration, /using \(user_id = \(select auth\.uid\(\)\)\)/i);
  assert.match(migration, /drop policy if exists "Public can read schools"/i);
});

test('database migration pins function search paths and removes duplicate indexes', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20261126195500_backend_rls_and_fk_performance.sql', import.meta.url), 'utf8');
  assert.match(migration, /alter function public\._norm_school\(text\) set search_path = pg_catalog/i);
  assert.match(migration, /alter function public\.qt_text\(public\.questions\) set search_path = pg_catalog, public/i);
  assert.match(migration, /alter function tex_tmp\.pw\(text\) set search_path = pg_catalog, tex_tmp/i);
  assert.match(migration, /drop index if exists public\.departments_school_id_idx/i);
  assert.match(migration, /drop index if exists public\.idx_faculties_school_id/i);
});
