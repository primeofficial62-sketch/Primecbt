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
    assert.ok(sql.includes('create table if not exists public.' + table));
    assert.ok(sql.includes('alter table public.' + table + ' enable row level security'));
    assert.ok(sql.includes('revoke all on public.' + table + ' from public, anon, authenticated'));
    assert.ok(sql.includes('grant all on public.' + table + ' to service_role'));
  }
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /alter table public\.(profiles|questions|courses|practice_sessions)\b/i);
  assert.doesNotMatch(sql, /drop policy/i);
});

test('Source registry captures access and reuse rights without copying syllabus prose', async () => {
  const sql = await read('supabase/migrations/20261127020000_external_exam_source_registry.sql');
  assert.ok(sql.includes("'curriculum_reference'"));
  assert.ok(sql.includes("'personal_study_only'"));
  assert.ok(sql.includes("'permission_required'"));
  assert.ok(sql.includes("source_url text not null check (source_url ~ '^https://')"));
  assert.ok(sql.includes('Store only syllabus taxonomy labels and source locators here'));
  assert.match(sql, /document_sha256 text[\s\S]*?\{64\}/i);
  assert.ok(sql.includes('source_locator text'));
});

test('Question provenance distinguishes official questions from original practice', async () => {
  const sql = await read('supabase/migrations/20261127020000_external_exam_source_registry.sql');
  assert.ok(sql.includes("provenance_kind in ('official_past_question','licensed_past_question','original_practice')"));
  assert.ok(sql.includes("provenance_kind = 'original_practice' and rights_status = 'original'"));
  assert.match(sql, /provenance_kind = 'original_practice'[\s\S]*?or source_id is not null/i);
});
