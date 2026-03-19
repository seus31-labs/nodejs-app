'use strict';

const crypto = require('node:crypto');
const { test } = require('node:test');
const assert = require('node:assert');
const { build } = require('../helper');

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

function tokenUserId(token) {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).id;
}

test('POST /api/v1/todos/:id/share without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/1/share',
    payload: { sharedWithUserId: 2, permission: 'view' },
  });
  assert.strictEqual(res.statusCode, 401);
});

test('POST /api/v1/todos/:id/share 無効な todoId で 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `sh-${suffix}`, email: `sh-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/abc/share',
    headers: { authorization: `Bearer ${token}` },
    payload: { sharedWithUserId: 2, permission: 'view' },
  });
  assert.strictEqual(res.statusCode, 400);
});

test('POST /api/v1/todos/:id/share 無効な sharedWithUserId で 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `sh2-${suffix}`, email: `sh2-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Todo' },
  });
  assert.strictEqual(todoRes.statusCode, 201);
  const todo = JSON.parse(todoRes.payload);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${token}` },
    payload: { sharedWithUserId: 0, permission: 'view' },
  });
  assert.strictEqual(res.statusCode, 400);
});

test('POST /api/v1/todos/:id/share Todo が存在しなければ 404', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `sh3-${suffix}`, email: `sh3-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/999999/share',
    headers: { authorization: `Bearer ${token}` },
    payload: { sharedWithUserId: 2, permission: 'view' },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('POST /api/v1/todos/:id/share 自分自身への共有で 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `sh4-${suffix}`, email: `sh4-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const me = { id: tokenUserId(token) };
  assert(me != null);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'My Todo' },
  });
  assert.strictEqual(todoRes.statusCode, 201);
  const todo = JSON.parse(todoRes.payload);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${token}` },
    payload: { sharedWithUserId: me.id, permission: 'view' },
  });
  assert.strictEqual(res.statusCode, 400);
  const body = JSON.parse(res.payload);
  assert(/yourself|Cannot share/.test(body.error));
});

test('POST /api/v1/todos/:id/share 成功で 201', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const owner = { name: `sh5o-${suffix}`, email: `sh5o-${suffix}@test.local`, password: 'pass123' };
  const other = { name: `sh5b-${suffix}`, email: `sh5b-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: owner });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: other });
  const ownerLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: owner.email, password: owner.password } });
  const otherLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: other.email, password: other.password } });
  const ownerToken = JSON.parse(ownerLogin.payload).token;
  const otherId = tokenUserId(JSON.parse(otherLogin.payload).token);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'Share me' },
  });
  assert.strictEqual(todoRes.statusCode, 201);
  const todo = JSON.parse(todoRes.payload);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { sharedWithUserId: otherId, permission: 'edit' },
  });
  assert.strictEqual(res.statusCode, 201);
  const share = JSON.parse(res.payload);
  assert.strictEqual(share.todoId, todo.id);
  assert.strictEqual(share.sharedWithUserId, otherId);
  assert.strictEqual(share.permission, 'edit');
});

test('GET /api/v1/todos/shared 成功で 200', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `sh6-${suffix}`, email: `sh6-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/shared',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.statusCode, 200);
  const list = JSON.parse(res.payload);
  assert(Array.isArray(list));
});

test('GET /api/v1/todos/shared without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({ method: 'GET', url: '/api/v1/todos/shared' });
  assert.strictEqual(res.statusCode, 401);
});

test('DELETE /api/v1/shares/:id 無効な shareId で 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `sh7-${suffix}`, email: `sh7-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const res = await app.inject({
    method: 'DELETE',
    url: '/api/v1/shares/abc',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.statusCode, 400);
});

test('DELETE /api/v1/shares/:id 共有が存在しなければ 404', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `sh8-${suffix}`, email: `sh8-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const res = await app.inject({
    method: 'DELETE',
    url: '/api/v1/shares/999999',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('DELETE /api/v1/shares/:id 成功で 204', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const owner = { name: `sh9o-${suffix}`, email: `sh9o-${suffix}@test.local`, password: 'pass123' };
  const other = { name: `sh9b-${suffix}`, email: `sh9b-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: owner });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: other });
  const ownerLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: owner.email, password: owner.password } });
  const otherLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: other.email, password: other.password } });
  const ownerToken = JSON.parse(ownerLogin.payload).token;
  const otherId = tokenUserId(JSON.parse(otherLogin.payload).token);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'To unshare' },
  });
  assert.strictEqual(todoRes.statusCode, 201);
  const todo = JSON.parse(todoRes.payload);
  const shareRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { sharedWithUserId: otherId, permission: 'view' },
  });
  assert.strictEqual(shareRes.statusCode, 201);
  const share = JSON.parse(shareRes.payload);
  const delRes = await app.inject({
    method: 'DELETE',
    url: `/api/v1/shares/${share.id}`,
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.strictEqual(delRes.statusCode, 204);
});
