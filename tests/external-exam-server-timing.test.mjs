import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('External Exams server grading enforces deadline and validates submitted answers', async () => {
  const migration = await read('supabase/migrations/20261127010000_external_exam_server_enforced_timing.sql');
  assert.match(migration, /clock_timestamp\(\) >= v_started_at \+ make_interval\(secs => v_duration_seconds\)/);
  assert.match(migration, /if not v_expired then[\s\S]*?for v_item in select value from jsonb_array_elements\(p_answers\)/);
  assert.match(migration, /Submitted question is not part of this attempt/);
  assert.match(migration, /Selected answer is outside the available options/);
  assert.match(migration, /After expiry, only autosaved answers count/);
  assert.match(migration, /'auto_submitted', v_expired/);
  assert.match(migration, /revoke all on function public\.grade_external_exam_attempt\(uuid, jsonb\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.grade_external_exam_attempt\(uuid, jsonb\) to authenticated/i);
});

test('External Exams answer saving refuses writes after the server deadline', async () => {
  const migration = await read('supabase/migrations/20261127010000_external_exam_server_enforced_timing.sql');
  assert.match(migration, /Examination time has expired; submit the attempt to finalize saved answers/);
  assert.match(migration, /a\.user_id = auth\.uid\(\)/);
  assert.match(migration, /a\.status = 'in_progress'/);
});
