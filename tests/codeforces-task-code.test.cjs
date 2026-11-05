'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getCodeforcesTaskCode } = require('../lib/api/codeforces-task-code.cjs');

test('Codeforces task URLs parse supported paths, indexes, query strings, and trailing slashes', () => {
  const cases = [
    ['https://codeforces.com/problemset/problem/1840/A', '1840', 'A'],
    ['https://codeforces.com/contest/1840/problem/B1?lang=en', '1840', 'B1'],
    ['https://codeforces.com/gym/102345/problem/C2/', '102345', 'C2'],
    ['https://codeforces.com/contest/1840/problem/C/?source=weekly', '1840', 'C']
  ];

  for (const [url, contestId, index] of cases) {
    assert.deepEqual(getCodeforcesTaskCode(url), { contestId, index });
  }
});

test('Codeforces task problem codes normalize common formats', () => {
  for (const problemCode of ['CF1840C', '1840C', '1840-C', '1840 C']) {
    assert.deepEqual(getCodeforcesTaskCode('', problemCode), { contestId: '1840', index: 'C' });
  }
});

test('Codeforces task code is null when neither URL nor problem code is parseable', () => {
  assert.equal(getCodeforcesTaskCode('https://codeforces.com/problemset/problem/not-a-contest/C', 'not-a-problem-code'), null);
  assert.equal(getCodeforcesTaskCode('https://codeforces.com/contest/1840/problem/C2extra'), null);
});

test('weekly verification distinguishes an unreadable task ID and refreshes Codeforces submissions uncached', () => {
  const registry = fs.readFileSync(path.join(__dirname, '..', 'lib', 'api', 'route-registry.cjs'), 'utf8');
  assert.match(registry, /return getCodeforcesTaskCode\(url, rawCode\);/);
  assert.match(registry, /Could not read the problem ID from this task \(check its URL\/problem code\)/);
  assert.match(registry, /fetchExternalJson\(`https:\/\/codeforces\.com\/api\/user\.status[^`]+`, \{ noCache: true, timeoutMs: 20000 \}\)/);
  assert.match(registry, /await reserveCodeforcesRequestSlot\(\)/);
});

test('admin blocks Codeforces tasks whose URL has no readable problem ID', () => {
  const page = fs.readFileSync(path.join(__dirname, '..', 'admin', 'app', 'tasks', 'page.tsx'), 'utf8');
  assert.match(page, /formData\.platform === 'Codeforces' && !CODEFORCES_TASK_URL_PATTERN\.test/);
  assert.match(page, /Could not read the Codeforces problem ID from this URL/);
  assert.match(page, /role="alert"/);
});
