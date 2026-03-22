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

async function setupOwnerViewEdit(t, app) {
  const suffix = uniqueSuffix();
  const owner = { name: `cmt-o-${suffix}`, email: `cmt-o-${suffix}@test.local`, password: 'pass123' };
  const viewUser = { name: `cmt-v-${suffix}`, email: `cmt-v-${suffix}@test.local`, password: 'pass123' };
  const editUser = { name: `cmt-e-${suffix}`, email: `cmt-e-${suffix}@test.local`, password: 'pass123' };
  for (const u of [owner, viewUser, editUser]) {
    await app.inject({ method: 'POST', url: '/api/v1/register', payload: u });
  }
  const ownerLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: owner.email, password: owner.password } });
  const viewLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: viewUser.email, password: viewUser.password } });
  const editLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: editUser.email, password: editUser.password } });
  const ownerToken = JSON.parse(ownerLogin.payload).token;
  const viewToken = JSON.parse(viewLogin.payload).token;
  const editToken = JSON.parse(editLogin.payload).token;
  const viewId = tokenUserId(viewToken);
  const editId = tokenUserId(editToken);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'Comment test todo' },
  });
  const todo = JSON.parse(todoRes.payload);
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { sharedWithUserId: viewId, permission: 'view' },
  });
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { sharedWithUserId: editId, permission: 'edit' },
  });
  return { todo, ownerToken, viewToken, editToken };
}

test('GET /api/v1/todos/:todoId/comments without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({ method: 'GET', url: '/api/v1/todos/1/comments' });
  assert.strictEqual(res.statusCode, 401);
});

test('POST /api/v1/todos/:todoId/comments without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/1/comments',
    payload: { content: 'hello' },
  });
  assert.strictEqual(res.statusCode, 401);
});

test('comments CRUD: owner creates, lists, updates, deletes; isMine on list', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `cmt-crud-${suffix}`, email: `cmt-crud-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const userId = tokenUserId(token);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'My todo' },
  });
  const todo = JSON.parse(todoRes.payload);

  const postRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${token}` },
    payload: { content: '  first note  ' },
  });
  assert.strictEqual(postRes.statusCode, 201);
  const created = JSON.parse(postRes.payload);
  assert.strictEqual(created.content, 'first note');
  assert.strictEqual(created.isMine, true);
  assert.strictEqual(created.userId, userId);

  const listRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(listRes.statusCode, 200);
  const list = JSON.parse(listRes.payload);
  assert.strictEqual(list.length, 1);
  assert.strictEqual(list[0].isMine, true);
  assert.ok(list[0].authorName);

  const putRes = await app.inject({
    method: 'PUT',
    url: `/api/v1/comments/${created.id}`,
    headers: { authorization: `Bearer ${token}` },
    payload: { content: 'updated body' },
  });
  assert.strictEqual(putRes.statusCode, 200);
  const updated = JSON.parse(putRes.payload);
  assert.strictEqual(updated.content, 'updated body');

  const delRes = await app.inject({
    method: 'DELETE',
    url: `/api/v1/comments/${created.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(delRes.statusCode, 204);

  const listAfter = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(JSON.parse(listAfter.payload).length, 0);
});

test('POST comment: view-only share returns 403', async (t) => {
  const app = await build(t);
  const { todo, viewToken } = await setupOwnerViewEdit(t, app);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${viewToken}` },
    payload: { content: 'no' },
  });
  assert.strictEqual(res.statusCode, 403);
});

test('GET comments: view-only share returns 200 (empty or list)', async (t) => {
  const app = await build(t);
  const { todo, viewToken } = await setupOwnerViewEdit(t, app);
  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${viewToken}` },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(JSON.parse(res.payload)));
});

test('POST comment: edit share succeeds; GET list shows isMine false for other author', async (t) => {
  const app = await build(t);
  const { todo, ownerToken, editToken } = await setupOwnerViewEdit(t, app);
  const postRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${editToken}` },
    payload: { content: 'from editor' },
  });
  assert.strictEqual(postRes.statusCode, 201);

  const ownerList = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  const list = JSON.parse(ownerList.payload);
  assert.strictEqual(list.length, 1);
  assert.strictEqual(list[0].content, 'from editor');
  assert.strictEqual(list[0].isMine, false);
});

test('PUT /comments/:id by non-author returns 403', async (t) => {
  const app = await build(t);
  const { todo, ownerToken, editToken } = await setupOwnerViewEdit(t, app);
  const postRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { content: 'owner wrote' },
  });
  const c = JSON.parse(postRes.payload);
  const putRes = await app.inject({
    method: 'PUT',
    url: `/api/v1/comments/${c.id}`,
    headers: { authorization: `Bearer ${editToken}` },
    payload: { content: 'hijack' },
  });
  assert.strictEqual(putRes.statusCode, 403);
});

test('POST comment empty content returns 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `cmt-bad-${suffix}`, email: `cmt-bad-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 't' },
  });
  const todo = JSON.parse(todoRes.payload);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/comments`,
    headers: { authorization: `Bearer ${token}` },
    payload: { content: '   ' },
  });
  assert.strictEqual(res.statusCode, 400);
});

test('PUT /comments/:id invalid id returns 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `cmt-id-${suffix}`, email: `cmt-id-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const res = await app.inject({
    method: 'PUT',
    url: '/api/v1/comments/abc',
    headers: { authorization: `Bearer ${token}` },
    payload: { content: 'x' },
  });
  assert.strictEqual(res.statusCode, 400);
});
