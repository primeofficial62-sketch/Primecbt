import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('External Exams uses real inline icons for every placeholder token, including inline arrows', async () => {
  const app = await read('external/app.js');
  const home = await read('external/home.html');
  assert.ok(app.includes(String.raw`value.replace(/\{\{([A-Z_]+)\}\}/g`));
  assert.ok(app.includes("ARROW:'arrow'"));
  assert.ok(home.includes('{{ARROW}}'));
  assert.ok(app.includes("icon('arrow')+'</a>'"));
  new vm.Script(app);
});

test('External Exams subject choices are compact while preserving accessible checkboxes', async () => {
  const app = await read('external/app.js');
  const css = await read('external/app.css');
  assert.ok(app.includes("subjectBox.classList.add('subject-selection-grid')"));
  assert.ok(app.includes('class="option subject-option"'));
  assert.match(css, /\.subject-selection-grid \.subject-option[\s\S]*?min-height:36px/);
  assert.match(css, /\.subject-selection-grid \.subject-option input[\s\S]*?width:14px/);
});

test('PRIME PRO activation is N3000 and premium cannot be self-granted by a browser user', async () => {
  const more = await read('external/more.html');
  const migration = await read('supabase/migrations/20261127100000_external_exam_premium_and_news_feed.sql');
  assert.ok(more.includes('₦3,000'));
  assert.ok(more.includes('id="activatePrimePro"'));
  assert.ok(migration.includes('external_exam_activation_payments'));
  assert.ok(migration.includes('finalize_external_exam_activation'));
  assert.ok(migration.includes('premium_activated_at'));
  assert.match(migration, /revoke insert, update on public\.external_exam_profiles from authenticated/i);
  assert.match(migration, /grant update \(full_name, email, exam_interests, updated_at\)/i);
  assert.match(migration, /not is_premium[\s\S]*?premium_activated_at is not null/i);
  assert.doesNotMatch(migration, /alter table public\.(profiles|courses|questions)\b/i);
});

test('Trusted news feed is restricted to approved examination and education publishers', async () => {
  const fn = await read('supabase/functions/external-exam-feed/index.ts');
  const app = await read('external/app.js');
  assert.ok(fn.includes('jamb.gov.ng'));
  assert.ok(fn.includes('waecnigeria.org'));
  assert.ok(fn.includes('neco.gov.ng'));
  assert.ok(fn.includes('education.gov.ng'));
  assert.ok(fn.includes('hostAllowed(publisherUrl)'));
  assert.ok(fn.includes('onConflict: "source_item_id"'));
  const init = await read('supabase/functions/external-exam-activation-init/index.ts');
  const verify = await read('supabase/functions/external-exam-activation-verify/index.ts');
  assert.ok(init.includes('amount: 300000'));
  assert.ok(init.includes('prime-pro-external-exams'));
  assert.ok(verify.includes('finalize_external_exam_activation'));
  assert.ok(verify.includes('Number(data.amount) !== 300000'));
  assert.ok(app.includes("functions.invoke('external-exam-feed')"));
  assert.doesNotMatch(fn, /SUPABASE_SERVICE_ROLE_KEY.{0,80}localStorage/i);
});

test('External Exams authentication supports email/password and Google without changing University routing', async () => {
  const auth = await read('auth.html');
  const isolation = await read('tests/external-exams-isolation.test.mjs');
  assert.ok(auth.includes('signInWithPassword'));
  assert.ok(auth.includes('signUp'));
  assert.ok(auth.includes("provider: 'google'"));
  assert.ok(auth.includes("window.location.replace('/external/home.html')"));
  assert.ok(isolation.includes("meta.pathway === 'institutional_learning'"));
});

test('Results page shows an empty state and the signed-in user’s own completed history', async () => {
  const html = await read('external/results.html');
  const app = await read('external/app.js');
  assert.ok(html.includes('id="resultHistory"'));
  assert.ok(app.includes("eq('user_id',profile.user.id).eq('status','submitted')"));
  assert.ok(app.includes('No completed exams yet'));
});


test('Study page exposes official source portals with accurate source labels', async () => {
  const study = await read('external/study.html');
  assert.ok(study.includes('Verified study portals'));
  assert.ok(study.includes('https://ibass.jamb.gov.ng/'));
  assert.ok(study.includes('https://www.waeconline.org.ng/e-Learning/index.htm'));
  assert.ok(study.includes('https://neco.gov.ng/exams'));
  assert.ok(study.includes('Not a NECO-issued syllabus'));
});
