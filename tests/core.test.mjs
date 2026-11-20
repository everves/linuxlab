import assert from 'node:assert/strict';
import { test } from 'node:test';
import { answersMatch, checkAnswer, checkIncidentCommand } from '../answers.js';
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
  assert.ok(!answersMatch('ip -rb addr', 'ip -br addr'));
  assert.ok(!answersMatch('apt update', 'sudo apt update'));
});

test('the network exercise accepts netcat aliases and combined or separate TCP flags', () => {
  const { answers } = data.drills.find(drill => drill.id === 'network-05');
  for (const utility of ['nc', 'netcat']) {
    for (const flags of ['-vz', '-zv', '-v -z', '-z -v']) {
      assert.ok(checkAnswer(`${utility} ${flags} 10.10.20.15 5432`, answers).correct);
    }
  }
  const mismatches = [
    ['nc −zv 10.10.20.15 5432', /обычный дефис/],
    ['nc -zv 10.10.20.15:5432', /двумя аргументами/],
    ['nc -zv 10.10.20.15 5433', /номер порта/],
    ['nc -zv 10.10.20.16 5432', /адрес назначения/],
    ['nc -zvu 10.10.20.15 5432', /флаги TCP/],
    ['nc -zv 10.10.20.15 5432 | cat', /лишних аргументов/],
    ['ping 10.10.20.15', /другая утилита/],
  ];
  for (const [input, message] of mismatches) {
    const result = checkAnswer(input, answers);
    assert.equal(result.correct, false, input);
    assert.match(result.message, message, input);
  }
});

test('only supported boolean switches are combined and reordered', () => {
  assert.ok(answersMatch('ls -a -l', 'ls -la'));
  assert.ok(answersMatch('du -h -s /var/log', 'du -sh /var/log'));
  assert.ok(answersMatch('sudo ss -p -n -tl', 'sudo ss -lntp'));
  assert.ok(answersMatch('docker exec -t -i web sh', 'docker exec -it web sh'));
  assert.ok(!answersMatch('docker exec web sh -ti', 'docker exec web sh -it'));
  assert.ok(!answersMatch('ss -nltp', 'sudo ss -lntp'));
  assert.ok(!answersMatch('ls -- -la', 'ls -- -al'));
});

test('TCP steps in incident scenarios accept the same equivalents', () => {
  const steps = data.incidents.flatMap(incident => incident.steps).filter(step => step.command?.startsWith('nc '));
  assert.equal(steps.length, 3);
  for (const step of steps) {
    const answer = step.command.replace('nc -vz', 'netcat -z -v');
    assert.ok(checkIncidentCommand(answer, step).correct, step.command);
    assert.ok(!checkIncidentCommand(answer + ' 9999', step).correct, step.command);
  }
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
      assert.ok(checkIncidentCommand(step.hint, step).correct, incident.id);
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
