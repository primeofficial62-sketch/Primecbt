import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('External Exams uses the shared PRIME-CBT auth page and enters its own app', async () => {
  const legacyAuth = await read('external/auth.html');
  const sharedAuth = await read('auth.html');
  const index = await read('index.html');
  const externalStart = index.indexOf('<section class="external" id="external-exams">');
  const externalEnd = index.indexOf('<!-- PLATFORM FEATURES -->', externalStart);
  assert.ok(externalStart >= 0 && externalEnd > externalStart);
  const externalSection = index.slice(externalStart, externalEnd);
  assert.match(externalSection, /\/auth\.html\?mode=register&next=%2Fexternal%2Fhome\.html&experience=external/);
  assert.match(externalSection, /\/auth\.html\?mode=login&next=%2Fexternal%2Fhome\.html&experience=external/);
  assert.ok(legacyAuth.includes('window.location.replace(destination)'));
  assert.ok(legacyAuth.includes('experience=external'));
  assert.ok(index.includes("universityAccount ? 'home.html' : '/auth.html?mode=login'"));
  assert.match(sharedAuth, /prime_experience:\s*'external_exams'/);
  assert.ok(sharedAuth.includes("emailRedirectTo: window.location.origin + (pathway === 'exam' ? '/auth.html?mode=login&next=%2Fexternal%2Fhome.html&experience=external' : '/auth.html?mode=login')"));
  assert.match(sharedAuth, /window\.location\.replace\('\/external\/home\.html'\)/);
  assert.ok(sharedAuth.includes("urlParams.get('experience') === 'external'"));
  assert.ok(sharedAuth.includes("meta.pathway === 'institutional_learning'"));
  assert.ok(sharedAuth.includes("else if (dest.startsWith('/external/')) dest = 'home.html'"));
  assert.doesNotMatch(sharedAuth, /nextUrl\(\)\.startsWith\('\/external\/'\)/);
  const universityStart = index.indexOf('<section class="university" id="university">');
  const universityEnd = index.indexOf('<!-- EXTERNAL EXAMINATIONS -->', universityStart);
  const universitySection = index.slice(universityStart, universityEnd);
  assert.match(universitySection, /auth\.html\?mode=register/);
  assert.doesNotMatch(universitySection, /\/external\/auth\.html/);
});
test('External registration uses the shared auth page and routes to the External Exams home', async () => {
  const rootAuth = await read('auth.html');
  const legacyAuth = await read('external/auth.html');
  assert.match(rootAuth, /prime_experience:\s*'external_exams'/);
  assert.ok(rootAuth.includes("meta.pathway === 'exam_preparation'"));
  assert.ok(rootAuth.includes('const experience = await resolveExperience(session.user)'));
  assert.ok(rootAuth.includes("window.location.replace('/external/home.html')"));
  assert.ok(rootAuth.includes("sessionStorage.setItem(NEXT_KEY, '/external/home.html')"));
  assert.ok(legacyAuth.includes('window.location.replace(destination)'));
  assert.doesNotMatch(legacyAuth, /<form/i);
  assert.match(rootAuth, /if \(needsProfileSetup\(session\.user\)\)[\s\S]*?profile-setup\.html/);
});

test('External Exams uses the existing PRIME-CBT brand palette and normal responsive mobile sizing', async () => {
  const css = await read('external/app.css');
  assert.match(css, /--bg:#070D1C/);
  assert.match(css, /--surface:#10192B/);
  assert.match(css, /--green:#31D3A2/);
  assert.match(css, /max-width:520px/);
  assert.match(css, /max-width:360px/);
  assert.match(css, /safe-area-inset-bottom/);
});

test('External Exams homepage keeps the approved sections and does not put Marketplace on Home', async () => {
  const home = await read('external/home.html');
  for (const section of ['CBT Simulators','Quick Links','Upcoming Events','In the News','quickPlus','bottomNav']) {
    assert.ok(home.includes(section), 'missing homepage element: ' + section);
  }
  assert.doesNotMatch(home, /Marketplace/);
  assert.match(home, /data-action="mimi"/);
  assert.doesNotMatch(home, /data-action="group"/);
});

test('External CBT question answers are stored separately and cannot be read from the public question bank', async () => {
  const migration = await read('supabase/migrations/20261126230900_external_exams_foundation.sql');
  const followup = await read('supabase/migrations/20261126232000_external_exams_security_tidy.sql');
  assert.match(migration, /create table if not exists public\.external_exam_question_answers/i);
  assert.match(migration, /revoke all on public\.external_exam_question_answers from public, anon, authenticated/i);
  assert.match(migration, /grant select \(id, exam_code, exam_year, source_type, subject_id, topic_id, question_text, options, image_url, status, created_at\)/i);
  assert.match(migration, /create or replace function public\.start_external_exam_attempt/i);
  assert.match(migration, /create or replace function public\.save_external_exam_answer/i);
  assert.match(migration, /create or replace function public\.grade_external_exam_attempt/i);
  assert.match(migration, /security definer[\s\S]*?set search_path = pg_catalog, public/i);
});

test('External question answer-key access has an explicit deny policy', async () => {
  const policyMigration = await read('supabase/migrations/20261126233000_external_exam_answer_key_deny_policy.sql');
  assert.ok(policyMigration.includes('for all to authenticated'));
  assert.ok(policyMigration.includes('using (false)'));
  assert.ok(policyMigration.includes('with check (false)'));
});

test('External Exam data is isolated from University tables and policies', async () => {
  const migration = await read('supabase/migrations/20261126230900_external_exams_foundation.sql');
  assert.doesNotMatch(migration, /alter table public\.(profiles|questions|courses|practice_sessions)\b/i);
  assert.doesNotMatch(migration, /drop policy[\s\S]*?on public\.(profiles|questions|courses|practice_sessions)\b/i);
  assert.match(migration, /external_exam_profiles/);
  assert.match(migration, /external_exam_attempts/);
});

test('External Exam app JavaScript and auth inline script parse successfully', async () => {
  const app = await read('external/app.js');
  const auth = await read('external/auth.html');
  new vm.Script(app);
  const scripts = [...auth.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.trim());
  assert.equal(scripts.length, 1);
  new vm.Script(scripts[0]);
});

test('External study, chat, test and results screens use the External Exams shell', async () => {
  for (const page of ['study.html','test.html','chat.html','more.html','exam.html','results.html']) {
    const html = await read('external/' + page);
    assert.match(html, /app\.css/);
    assert.match(html, /app\.js/);
    assert.match(html, /bottomNav/);
  }
});
