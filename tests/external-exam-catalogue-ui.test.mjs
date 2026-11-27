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
  assert.ok(app.includes('More topic outlines are being verified'));
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


test('Study library opens lessons inside PRIME-CBT and has no off-site study links', async () => {
  const study = await read('external/study.html');
  const app = await read('external/app.js');
  const css = await read('external/app.css');
  assert.ok(study.includes('studyReader'));
  assert.ok(study.includes('PRIME-CBT notes and lessons'));
  assert.ok(!study.includes('href="https://') && !study.includes("href='https://"));
  assert.ok(app.includes('content_markdown'));
  assert.ok(app.includes('reader.showModal()'));
  assert.ok(app.includes('data-resource'));
  assert.ok(css.includes('.study-reader'));
});

test('PRIME PRO benefits are described without activating a wider paywall', async () => {
  const more = await read('external/more.html');
  const app = await read('external/app.js');
  assert.ok(more.includes('Planned PRIME PRO benefits'));
  assert.ok(more.includes('Downloadable revision packs'));
  assert.ok(more.includes('Free access stays available'));
  assert.ok(more.includes('paywall will not be switched on'));
  assert.ok(app.includes('Activate PRIME PRO · ₦3,000'));
});


test('Study content migration stores original reviewed lessons and sourced future events', async () => {
  const migration = await read('supabase/migrations/20261127142603_external_study_library_lessons_and_verified_events.sql');
  assert.ok(migration.includes('content_markdown'));
  assert.ok(migration.includes("'original'"));
  assert.ok(migration.includes("'editorial_reviewed'"));
  assert.ok(migration.includes('NECO_2027_SSCE_INTERNAL_WINDOW'));
  assert.ok(migration.includes('NECO_2027_BECE_WINDOW'));
  assert.doesNotMatch(migration, /insert into public\\.external_exam_questions/i);
});
