import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('External Exams home and study screens expose subject discovery and topic browsing', async () => {
  const home = await read('external/home.html');
  const study = await read('external/study.html');
  const app = await read('external/app.js');
  assert.ok(home.includes('examBrowseList'));
  assert.ok(study.includes('subjectsList'));
  assert.ok(study.includes('topicsList'));
  assert.ok(app.includes("from('external_exam_subjects')"));
  assert.ok(app.includes("from('external_exam_topics')"));
  assert.ok(app.includes('No subjects are listed for this examination yet'));
  assert.ok(app.includes('official topic outline is being checked'));
});

test('External subject catalogue seed is idempotent and records its official source label', async () => {
  const migration = await read('supabase/migrations/20261127030000_external_exam_subject_catalogue.sql');
  assert.match(migration, /on conflict \(exam_code,slug\) do update/i);
  assert.match(migration, /JAMB 2026 UTME Training Manual/i);
  assert.match(migration, /WAEC Nigeria FAQ/i);
  assert.match(migration, /NECO 2025 SSCE External Registration Guideline/i);
  assert.match(migration, /syllabus_version/);
  assert.doesNotMatch(migration, /insert into public\.external_exam_questions/i);
  assert.doesNotMatch(migration, /insert into public\.external_exam_topics/i);
});
