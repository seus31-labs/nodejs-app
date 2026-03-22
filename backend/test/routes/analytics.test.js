'use strict';

const crypto = require('node:crypto');
const { test } = require('node:test');
const assert = require('node:assert');
const { build } = require('../helper');

const analyticsServiceResolved = require.resolve('../../services/analyticsService.js');
const analyticsControllerResolved = require.resolve('../../controllers/analyticsController.js');
const analyticsRoutesResolved = require.resolve('../../routes/api/v1/index.js');

function bustAnalyticsRouteCache() {
  delete require.cache[analyticsServiceResolved];
  delete require.cache[analyticsControllerResolved];
  delete require.cache[analyticsRoutesResolved];
}

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

async function registerAndLogin(app) {
  const suffix = uniqueSuffix();
  const user = { name: `u-${suffix}`, email: `u-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({
    method: 'POST',
    url: '/api/v1/login',
    payload: { email: user.email, password: user.password },
  });
  assert.strictEqual(loginRes.statusCode, 200);
  return JSON.parse(loginRes.payload).token;
}

const analyticsPaths = [
  '/api/v1/analytics/completion-rate',
  '/api/v1/analytics/by-priority',
  '/api/v1/analytics/by-tag',
  '/api/v1/analytics/by-project',
  '/api/v1/analytics/weekly',
];

for (const path of analyticsPaths) {
  test(`GET ${path} without auth returns 401`, async (t) => {
    const app = await build(t);
    const res = await app.inject({ method: 'GET', url: path });
    assert.strictEqual(res.statusCode, 401);
  });
}

test('GET /api/v1/analytics/completion-rate invalid period returns 400', async (t) => {
  const app = await build(t);
  const token = await registerAndLogin(app);
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/analytics/completion-rate',
    query: { period: 'invalid' },
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.statusCode, 400);
});

test('GET /api/v1/analytics/* with auth returns expected JSON shapes', async (t) => {
  const app = await build(t);
  const token = await registerAndLogin(app);
  const auth = { authorization: `Bearer ${token}` };

  const cr = await app.inject({
    method: 'GET',
    url: '/api/v1/analytics/completion-rate',
    query: { period: 'all' },
    headers: auth,
  });
  assert.strictEqual(cr.statusCode, 200);
  const crBody = JSON.parse(cr.payload);
  assert.strictEqual(crBody.period, 'all');
  assert.strictEqual(typeof crBody.total, 'number');
  assert.strictEqual(typeof crBody.completed, 'number');
  assert.strictEqual(typeof crBody.rate, 'number');

  const pr = await app.inject({ method: 'GET', url: '/api/v1/analytics/by-priority', headers: auth });
  assert.strictEqual(pr.statusCode, 200);
  const prBody = JSON.parse(pr.payload);
  assert.strictEqual(typeof prBody.low, 'number');
  assert.strictEqual(typeof prBody.medium, 'number');
  assert.strictEqual(typeof prBody.high, 'number');

  const tg = await app.inject({ method: 'GET', url: '/api/v1/analytics/by-tag', headers: auth });
  assert.strictEqual(tg.statusCode, 200);
  assert.ok(Array.isArray(JSON.parse(tg.payload)));

  const pj = await app.inject({ method: 'GET', url: '/api/v1/analytics/by-project', headers: auth });
  assert.strictEqual(pj.statusCode, 200);
  assert.ok(Array.isArray(JSON.parse(pj.payload)));

  const wk = await app.inject({ method: 'GET', url: '/api/v1/analytics/weekly', headers: auth });
  assert.strictEqual(wk.statusCode, 200);
  const wkBody = JSON.parse(wk.payload);
  assert.ok(Array.isArray(wkBody.days));
  assert.strictEqual(wkBody.days.length, 7);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(wkBody.days[0].date));
  assert.strictEqual(typeof wkBody.days[0].created, 'number');
  assert.strictEqual(typeof wkBody.days[0].completed, 'number');
});

test('GET /api/v1/analytics/completion-rate omits period → 200 and period all (schema default)', async (t) => {
  const app = await build(t);
  const token = await registerAndLogin(app);
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/analytics/completion-rate',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(JSON.parse(res.payload).period, 'all');
});

test('GET /api/v1/analytics/completion-rate service throws → 500 and { error: string }', async (t) => {
  bustAnalyticsRouteCache();
  const real = require('../../services/analyticsService');
  require.cache[analyticsServiceResolved].exports = {
    ...real,
    getCompletionRate: async () => {
      throw new Error('simulated service failure');
    },
  };
  t.after(() => {
    bustAnalyticsRouteCache();
  });

  const app = await build(t);
  const token = await registerAndLogin(app);
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/analytics/completion-rate',
    query: { period: 'all' },
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.statusCode, 500);
  const body = JSON.parse(res.payload);
  assert.strictEqual(typeof body.error, 'string');
  assert.ok(body.error.length > 0);
});
