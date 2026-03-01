'use strict';

const crypto = require('node:crypto');
const { test } = require('node:test');
const assert = require('node:assert');
const { build } = require('../helper');

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

test('GET /api/v1/tags without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({ method: 'GET', url: '/api/v1/tags' });
  assert.strictEqual(res.statusCode, 401);
});

test('POST /api/v1/tags without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    payload: { name: 'work' },
  });
  assert.strictEqual(res.statusCode, 401);
});

test('POST /api/v1/tags creates tag and GET /tags returns it', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tag-${suffix}`, email: `tag-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'work', color: '#ff0000' },
  });
  assert.strictEqual(createRes.statusCode, 201);
  const tag = JSON.parse(createRes.payload);
  assert.strictEqual(tag.name, 'work');
  assert.strictEqual(tag.color, '#ff0000');
  assert(tag.id != null);
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(listRes.statusCode, 200);
  const list = JSON.parse(listRes.payload);
  assert(list.some((t) => t.id === tag.id && t.name === 'work'));
});

test('POST /api/v1/tags duplicate name returns 409', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tagd-${suffix}`, email: `tagd-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'same' },
  });
  const res2 = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'same' },
  });
  assert.strictEqual(res2.statusCode, 409);
});

test('POST /api/v1/todos/:todoId/tags adds tag and GET /todos/:id includes tags', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tagt-${suffix}`, email: `tagt-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'urgent', color: '#00ff00' },
  });
  const tag = JSON.parse(tagRes.payload);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'With tag' },
  });
  const todo = JSON.parse(todoRes.payload);
  const addRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${token}` },
    payload: { tagId: tag.id },
  });
  assert.strictEqual(addRes.statusCode, 204);
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(getRes.statusCode, 200);
  const todoWithTags = JSON.parse(getRes.payload);
  assert(Array.isArray(todoWithTags.Tags));
  assert(todoWithTags.Tags.some((t) => t.id === tag.id));
});

test('GET /api/v1/todos?tags= filters by tag', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tagf-${suffix}`, email: `tagf-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'filter-tag' },
  });
  const tag = JSON.parse(tagRes.payload);
  const todo1Res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Has tag' },
  });
  const todo1 = JSON.parse(todo1Res.payload);
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'No tag' },
  });
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo1.id}/tags`,
    headers: { authorization: `Bearer ${token}` },
    payload: { tagId: tag.id },
  });
  const listRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos?tags=${tag.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(listRes.statusCode, 200);
  const list = JSON.parse(listRes.payload);
  assert(list.length >= 1);
  assert(list.every((todo) => (todo.Tags || []).some((t) => t.id === tag.id)));
});

test('other user cannot update tag (PUT /tags/:id returns 404)', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `tagA-${suffix}`, email: `tagA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `tagB-${suffix}`, email: `tagB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: 'A tag' },
  });
  const tag = JSON.parse(createRes.payload);
  const res = await app.inject({
    method: 'PUT',
    url: `/api/v1/tags/${tag.id}`,
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { name: 'hacked' },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('other user cannot delete tag (DELETE /tags/:id returns 404)', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `tagdelA-${suffix}`, email: `tagdelA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `tagdelB-${suffix}`, email: `tagdelB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: 'A tag' },
  });
  const tag = JSON.parse(createRes.payload);
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/tags/${tag.id}`,
    headers: { authorization: `Bearer ${tokenB}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('other user cannot add tag to my todo (POST /todos/:id/tags returns 404)', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `todtagA-${suffix}`, email: `todtagA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `todtagB-${suffix}`, email: `todtagB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A todo' },
  });
  const todo = JSON.parse(todoRes.payload);
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { name: 'B tag' },
  });
  const tag = JSON.parse(tagRes.payload);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { tagId: tag.id },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('other user cannot remove tag from my todo (DELETE /todos/:id/tags/:tagId returns 404)', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `todtagdelA-${suffix}`, email: `todtagdelA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `todtagdelB-${suffix}`, email: `todtagdelB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const tagARes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: 'A tag' },
  });
  const tagA = JSON.parse(tagARes.payload);
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A todo' },
  });
  const todo = JSON.parse(todoRes.payload);
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { tagId: tagA.id },
  });
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/todos/${todo.id}/tags/${tagA.id}`,
    headers: { authorization: `Bearer ${tokenB}` },
  });
  assert.strictEqual(res.statusCode, 404);
});
