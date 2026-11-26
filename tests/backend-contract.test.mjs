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
