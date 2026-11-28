import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('External Exams home dashboard keeps its existing five bottom-navigation labels', async () => {
  const home = await read('external/home.html');
  const app = await read('external/app.js');
  assert.ok(home.includes('id="bottomNav"'));
  assert.match(app, /\['home','Home','home\.html'\].*\['study','Study','study\.html'\].*\['test','Test','test\.html'\].*\['chat','Chat','chat\.html'\].*\['more','More','more\.html'\]/);
  assert.ok(!home.includes('sidebar'));
  assert.ok(!home.includes('side-nav'));
});

test('External Exams redesigned home preserves the live dashboard data hooks', async () => {
  const home = await read('external/home.html');
  for (const id of ['studentName','completedCount','averageScore','studyStreak','examCountdown','examCountdownDetail','continueLearning','continueDescription','recentResults','examBrowseList','recommendedSubjects','eventsList','newsList']) {
    assert.ok(home.includes('id="' + id + '"'), 'Missing dashboard hook: ' + id);
  }
  assert.ok(home.includes('data-page="home"'));
  assert.ok(home.includes('href="test.html"'));
  assert.ok(home.includes('href="study.html"'));
});

test('External Exams home dashboard styles are scoped and responsive', async () => {
  const css = await read('external/home.css');
  assert.ok(css.includes('body[data-page="home"]'));
  assert.match(css, /@media\s*\(max-width:\s*600px\)/);
  assert.match(css, /@media\s*\(min-width:\s*900px\)/);
  assert.ok(css.includes('.bottom-nav'));
  assert.ok(css.includes('grid-template-columns:repeat(5'));
  assert.ok(!/^(?!body\[data-page="home"\])[^@/\n][^{}]*\{/.test(css.split('\n').filter(Boolean).join('\n')));
});

test('External Exams home keeps University and authentication files out of its change scope', async () => {
  const home = await read('external/home.html');
  assert.ok(home.includes('EXTERNAL EXAMINATIONS'));
  assert.ok(!home.includes('auth.html'));
});
