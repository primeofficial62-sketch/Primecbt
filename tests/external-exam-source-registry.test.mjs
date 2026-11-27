import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('External Exams source registry is isolated and protected from client roles', async () => {
  const sql = await read('supabase/migrations/20261127020000_external_exam_source_registry.sql');
  for (const table of [
    'external_exam_sources',
    'external_exam_import_batches',
    'external_exam_syllabus_entries',
    'external_exam_question_provenance'
  ]) {
    assert.match(sql, new RegExp('create table if not exists public\\.' + table, 'i'));
    assert.match(sql, new RegExp('alter table public\\.' + table + ' enable row level security', 'i'));
    assert.match(sql, new RegExp('revoke all on public\\.' + table + ' from public, anon, authenticated', 'i'));
    assert.match(sql, new RegExp('grant all on public\\.' + table + ' to service_role', 'i'));
  }
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /alter table public\\.(profiles|questions|courses|practice_sessions)\\b/i);
  assert.doesNotMatch(sql, /drop policy/i);
});

test('Source registry captures access and reuse rights without copying syllabus prose', async () => {
  const sql = await read('supabase/migrations/20261127020000_external_exam_source_registry.sql');
  assert.match(sql, /source_kind in[\\s\\S]*?curriculum_reference/i);
  assert.match(sql, /rights_status in[\\s\\S]*?personal_study_only/i);
  assert.match(sql, /access_status in[\\s\\S]*?permission_required/i);
  assert.match(sql, /source_url text not null check \\(source_url ~ '\\^https:\/\/'\\)/i);
  assert.match(sql, /Store only syllabus taxonomy labels and source locators here/i);
  assert.match(sql, /document_sha256 text[\\s\\S]*?\{64\}/i);
  assert.match(sql, /source_locator text/i);
});

test('Question provenance distinguishes official questions from original practice', async () => {
  const sql = await read('supabase/migrations/20261127020000_external_exam_source_registry.sql');
  assert.match(sql, /provenance_kind in \\('official_past_question','licensed_past_question','original_practice'\\)/i);
  assert.match(sql, /provenance_kind = 'original_practice' and rights_status = 'original'/i);
  assert.match(sql, /provenance_kind = 'original_practice'[\\s\\S]*?or source_id is not null/i);
});
