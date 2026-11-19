import assert from 'node:assert/strict';
import { test } from 'node:test';
import { answersMatch } from '../answers.js';
import { newProgress, parseProgress } from '../progress.js';
import { readRoute, routePath } from '../routes.js';

globalThis.window = {};
await import('../content.js');
const data = window.LINUXLAB;

test('command matching keeps quoted text, expansions and syntax distinct', () => {
  assert.ok(answersMatch('  sort names.txt|   uniq; ', 'sort names.txt | uniq'));
  assert.ok(answersMatch("find /etc -name '*.conf'", 'find /etc -name "*.conf"'));
  assert.ok(!answersMatch('grep "alpha  beta" file.txt', 'grep "alpha beta" file.txt'));
  assert.ok(!answersMatch("echo '$PATH'", 'echo "$PATH"'));
  assert.ok(!answersMatch('echo "foo|bar"', 'echo "foo | bar"'));
  assert.ok(!answersMatch('sort names.txt || uniq', 'sort names.txt | uniq'));
  assert.ok(!answersMatch('echo "unterminated', 'echo "unterminated"'));
  assert.ok(!answersMatch('ls -al', 'ls -la'));
  assert.ok(!answersMatch('apt update', 'sudo apt update'));
});

test('curriculum has unique stable IDs and every explicit answer matches itself', () => {
  const ids = data.drills.map(drill => drill.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(data.drills.find(drill => drill.id === 'files-01').prompt, /текущий рабочий каталог/);
  for (const drill of data.drills) {
    assert.match(drill.id, /^[a-z0-9-]+$/);
    assert.ok(drill.prompt && drill.hint && drill.why && drill.answers.length);
    for (const answer of drill.answers) assert.ok(answersMatch(answer, answer), drill.id);
  }
  for (const incident of data.incidents) {
    for (const step of incident.steps) {
      assert.ok(step.patterns.some(pattern => new RegExp(pattern, 'i').test(step.hint)), incident.id);
    }
  }
});

test('version 1 backup round trips and rejects invalid nested fields', () => {
  const backup = {
    ...newProgress(), xp: 70,
    drills: { 'files-01': { seen: 1, correct: 1, fails: 0, streak: 1, interval: 1, due: 2, last: 1 } },
    incidents: { 'nginx-down': { done: true, completedAt: 1 } },
    daily: { '2026-11-19': { drills: 1, incidents: 1 } },
  };
  assert.deepEqual(parseProgress(JSON.stringify(backup)), backup);
  for (const invalid of [
    { version: 2 }, { drills: [] }, { drills: { 'files-01': { seen: '1' } } },
    { incidents: { 'nginx-down': { done: 'yes' } } }, { daily: { '2026-11-19': { drills: -1 } } },
    { settings: { dailyGoal: '10' } }, { xp: -1 },
  ]) {
    assert.throws(() => parseProgress(JSON.stringify({ ...backup, ...invalid })));
  }
});

test('routes round trip from the GitHub Pages fragment', () => {
  assert.deepEqual(readRoute(routePath('module', 'files'), data), { page: 'module', id: 'files' });
  assert.deepEqual(readRoute(routePath('incident', 'nginx-down'), data), { page: 'incident', id: 'nginx-down' });
  assert.deepEqual(readRoute('#/courses/unknown', data), { page: 'courses' });
  assert.deepEqual(readRoute('#/incidents/unknown', data), { page: 'incidents' });
  assert.deepEqual(readRoute('#/practice/session', data), { page: 'training' });
  assert.deepEqual(readRoute('#/constructor', data), { page: 'home' });
});
