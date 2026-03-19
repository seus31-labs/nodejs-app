'use strict';

/**
 * 11.5 共有チェック: view/edit で取得・更新が制御されることを検証する。
 */
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

async function setupOwnerViewEditUnshared(t, app) {
  const suffix = uniqueSuffix();
  const owner = { name: `tsa-owner-${suffix}`, email: `tsa-owner-${suffix}@test.local`, password: 'pass123' };
  const viewUser = { name: `tsa-view-${suffix}`, email: `tsa-view-${suffix}@test.local`, password: 'pass123' };
  const editUser = { name: `tsa-edit-${suffix}`, email: `tsa-edit-${suffix}@test.local`, password: 'pass123' };
  const unshared = { name: `tsa-out-${suffix}`, email: `tsa-out-${suffix}@test.local`, password: 'pass123' };
  for (const u of [owner, viewUser, editUser, unshared]) {
    await app.inject({ method: 'POST', url: '/api/v1/register', payload: u });
  }
  const ownerLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: owner.email, password: owner.password } });
  const viewLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: viewUser.email, password: viewUser.password } });
  const editLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: editUser.email, password: editUser.password } });
  const unsharedLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: unshared.email, password: unshared.password } });
  const ownerToken = JSON.parse(ownerLogin.payload).token;
  const viewToken = JSON.parse(viewLogin.payload).token;
  const editToken = JSON.parse(editLogin.payload).token;
  const viewId = tokenUserId(viewToken);
  const editId = tokenUserId(editToken);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'Shared todo' },
  });
  assert.strictEqual(todoRes.statusCode, 201);
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
  return {
    todo,
    ownerToken,
    viewToken,
    editToken,
    unsharedToken: JSON.parse(unsharedLogin.payload).token,
  };
}

test('getTodoById: view 共有先は todo を取得できる', async (t) => {
  const app = await build(t);
  const { todo, viewToken } = await setupOwnerViewEditUnshared(t, app);
  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo.id}`,
    headers: { authorization: `Bearer ${viewToken}` },
  });
  assert.strictEqual(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.strictEqual(body.id, todo.id);
  assert.strictEqual(body.title, 'Shared todo');
});

test('getTodoById: 未共有のユーザーは 404', async (t) => {
  const app = await build(t);
  const { todo, unsharedToken } = await setupOwnerViewEditUnshared(t, app);
  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo.id}`,
    headers: { authorization: `Bearer ${unsharedToken}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('updateTodo: view 権限のみの共有ユーザーは 404', async (t) => {
  const app = await build(t);
  const { todo, viewToken } = await setupOwnerViewEditUnshared(t, app);
  const res = await app.inject({
    method: 'PUT',
    url: `/api/v1/todos/${todo.id}`,
    headers: { authorization: `Bearer ${viewToken}` },
    payload: { title: 'Updated by view' },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('updateTodo: edit 権限の共有ユーザーは更新できる', async (t) => {
  const app = await build(t);
  const { todo, editToken } = await setupOwnerViewEditUnshared(t, app);
  const res = await app.inject({
    method: 'PUT',
    url: `/api/v1/todos/${todo.id}`,
    headers: { authorization: `Bearer ${editToken}` },
    payload: { title: 'Updated by edit' },
  });
  assert.strictEqual(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.strictEqual(body.title, 'Updated by edit');
});

test('deleteTodo: view 権限のみは 404', async (t) => {
  const app = await build(t);
  const { todo, viewToken } = await setupOwnerViewEditUnshared(t, app);
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/todos/${todo.id}`,
    headers: { authorization: `Bearer ${viewToken}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('deleteTodo: edit 権限の共有ユーザーは削除できる', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const owner = { name: `tsa-d-${suffix}`, email: `tsa-d-${suffix}@test.local`, password: 'pass123' };
  const editUser = { name: `tsa-d-e-${suffix}`, email: `tsa-d-e-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: owner });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: editUser });
  const ownerLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: owner.email, password: owner.password } });
  const editLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: editUser.email, password: editUser.password } });
  const ownerToken = JSON.parse(ownerLogin.payload).token;
  const editToken = JSON.parse(editLogin.payload).token;
  const editId = tokenUserId(editToken);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'To delete by edit' },
  });
  const todo = JSON.parse(todoRes.payload);
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { sharedWithUserId: editId, permission: 'edit' },
  });
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/todos/${todo.id}`,
    headers: { authorization: `Bearer ${editToken}` },
  });
  assert.strictEqual(res.statusCode, 204);
});

test('toggleComplete: view 権限のみは 404', async (t) => {
  const app = await build(t);
  const { todo, viewToken } = await setupOwnerViewEditUnshared(t, app);
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todo.id}/toggle`,
    headers: { authorization: `Bearer ${viewToken}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('toggleComplete: edit 権限の共有ユーザーはトグルできる', async (t) => {
  const app = await build(t);
  const { todo, editToken } = await setupOwnerViewEditUnshared(t, app);
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todo.id}/toggle`,
    headers: { authorization: `Bearer ${editToken}` },
  });
  assert.strictEqual(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.strictEqual(body.completed, true);
});

test('addTagToTodo: view 権限のみは 404', async (t) => {
  const app = await build(t);
  const { todo, viewToken } = await setupOwnerViewEditUnshared(t, app);
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${viewToken}` },
    payload: { name: 'ViewTag' },
  });
  assert.strictEqual(tagRes.statusCode, 201);
  const tag = JSON.parse(tagRes.payload);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${viewToken}` },
    payload: { tagId: tag.id },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('addTagToTodo: edit 権限の共有ユーザーはタグ付けできる', async (t) => {
  const app = await build(t);
  const { todo, editToken } = await setupOwnerViewEditUnshared(t, app);
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${editToken}` },
    payload: { name: 'EditTag' },
  });
  assert.strictEqual(tagRes.statusCode, 201);
  const tag = JSON.parse(tagRes.payload);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${editToken}` },
    payload: { tagId: tag.id },
  });
  assert.strictEqual(res.statusCode, 204);
});

test('removeTagFromTodo: view 権限のみは 404', async (t) => {
  const app = await build(t);
  const { todo, ownerToken, viewToken } = await setupOwnerViewEditUnshared(t, app);
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { name: 'OwnerTag' },
  });
  const tag = JSON.parse(tagRes.payload);
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { tagId: tag.id },
  });
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/todos/${todo.id}/tags/${tag.id}`,
    headers: { authorization: `Bearer ${viewToken}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('removeTagFromTodo: edit 権限の共有ユーザーはタグ外しできる', async (t) => {
  const app = await build(t);
  const { todo, editToken } = await setupOwnerViewEditUnshared(t, app);
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${editToken}` },
    payload: { name: 'EditTag2' },
  });
  const tag = JSON.parse(tagRes.payload);
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${editToken}` },
    payload: { tagId: tag.id },
  });
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/todos/${todo.id}/tags/${tag.id}`,
    headers: { authorization: `Bearer ${editToken}` },
  });
  assert.strictEqual(res.statusCode, 204);
});
