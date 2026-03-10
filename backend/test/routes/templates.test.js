'use strict';

const crypto = require('node:crypto');
const { test } = require('node:test');
const assert = require('node:assert');
const { build } = require('../helper');

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

test('GET /api/v1/templates without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({ method: 'GET', url: '/api/v1/templates' });
  assert.strictEqual(res.statusCode, 401);
});

test('POST /api/v1/templates without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    payload: { name: 'My Template', title: 'Todo title' },
  });
  assert.strictEqual(res.statusCode, 401);
});

test('POST /api/v1/templates creates template and GET /templates returns it', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmpl-${suffix}`, email: `tmpl-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Daily', title: 'Daily task', description: 'Repeat daily', priority: 'high' },
  });
  assert.strictEqual(createRes.statusCode, 201);
  const template = JSON.parse(createRes.payload);
  assert.strictEqual(template.name, 'Daily');
  assert.strictEqual(template.title, 'Daily task');
  assert.strictEqual(template.description, 'Repeat daily');
  assert.strictEqual(template.priority, 'high');
  assert(template.id != null);
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(listRes.statusCode, 200);
  const list = JSON.parse(listRes.payload);
  assert(list.some((item) => item.id === template.id && item.name === 'Daily'));
});

test('POST /api/v1/templates with empty name returns 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmpl-${suffix}`, email: `tmpl-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: '  ', title: 'Valid title' },
  });
  assert.strictEqual(res.statusCode, 400);
});

test('POST /api/v1/templates with empty title returns 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmpl-${suffix}`, email: `tmpl-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Valid name', title: '' },
  });
  assert.strictEqual(res.statusCode, 400);
});

test('GET /api/v1/templates/:id returns template (normal)', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmplg-${suffix}`, email: `tmplg-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Get me', title: 'Get me title' },
  });
  const template = JSON.parse(createRes.payload);
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/v1/templates/${template.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(getRes.statusCode, 200);
  const got = JSON.parse(getRes.payload);
  assert.strictEqual(got.id, template.id);
  assert.strictEqual(got.name, 'Get me');
  assert.strictEqual(got.title, 'Get me title');
});

test('GET /api/v1/templates/:id without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({ method: 'GET', url: '/api/v1/templates/1' });
  assert.strictEqual(res.statusCode, 401);
});

test('GET /api/v1/templates/:id for other user returns 404', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `tmplA-${suffix}`, email: `tmplA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `tmplB-${suffix}`, email: `tmplB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: 'A template', title: 'A title' },
  });
  const template = JSON.parse(createRes.payload);
  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/templates/${template.id}`,
    headers: { authorization: `Bearer ${tokenB}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('PUT /api/v1/templates/:id updates template (normal)', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmplput-${suffix}`, email: `tmplput-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Before', title: 'Before title' },
  });
  const template = JSON.parse(createRes.payload);
  const putRes = await app.inject({
    method: 'PUT',
    url: `/api/v1/templates/${template.id}`,
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'After', title: 'After title', priority: 'low' },
  });
  assert.strictEqual(putRes.statusCode, 200);
  const updated = JSON.parse(putRes.payload);
  assert.strictEqual(updated.id, template.id);
  assert.strictEqual(updated.name, 'After');
  assert.strictEqual(updated.title, 'After title');
  assert.strictEqual(updated.priority, 'low');
});

test('PUT /api/v1/templates/:id for other user returns 404', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `tmplputA-${suffix}`, email: `tmplputA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `tmplputB-${suffix}`, email: `tmplputB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: 'A template', title: 'A title' },
  });
  const template = JSON.parse(createRes.payload);
  const res = await app.inject({
    method: 'PUT',
    url: `/api/v1/templates/${template.id}`,
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { name: 'Hacked', title: 'Hacked title' },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('PUT /api/v1/templates/:id with empty string name returns 400', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmplput-${suffix}`, email: `tmplput-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Valid', title: 'Valid title' },
  });
  const template = JSON.parse(createRes.payload);
  const res = await app.inject({
    method: 'PUT',
    url: `/api/v1/templates/${template.id}`,
    headers: { authorization: `Bearer ${token}` },
    payload: { name: '' },
  });
  assert.strictEqual(res.statusCode, 400);
});

test('DELETE /api/v1/templates/:id deletes template (normal)', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmpldel-${suffix}`, email: `tmpldel-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'To delete', title: 'To delete title' },
  });
  const template = JSON.parse(createRes.payload);
  const delRes = await app.inject({
    method: 'DELETE',
    url: `/api/v1/templates/${template.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(delRes.statusCode, 204);
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/v1/templates/${template.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(getRes.statusCode, 404);
});

test('DELETE /api/v1/templates/:id for other user returns 404', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `tmpldelA-${suffix}`, email: `tmpldelA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `tmpldelB-${suffix}`, email: `tmpldelB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: 'A template', title: 'A title' },
  });
  const template = JSON.parse(createRes.payload);
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/templates/${template.id}`,
    headers: { authorization: `Bearer ${tokenB}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('POST /api/v1/templates/:id/create-todo creates todo from template (normal)', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmpltodo-${suffix}`, email: `tmpltodo-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Todo from me', title: 'Template title', description: 'Template desc', priority: 'high' },
  });
  const template = JSON.parse(createRes.payload);
  const todoRes = await app.inject({
    method: 'POST',
    url: `/api/v1/templates/${template.id}/create-todo`,
    headers: { authorization: `Bearer ${token}` },
    payload: {},
  });
  assert.strictEqual(todoRes.statusCode, 201);
  const todo = JSON.parse(todoRes.payload);
  assert.strictEqual(todo.title, 'Template title');
  assert.strictEqual(todo.description, 'Template desc');
  assert.strictEqual(todo.priority, 'high');
  assert(todo.id != null);
});

test('POST /api/v1/templates/:id/create-todo with overrides applies overrides', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmplov-${suffix}`, email: `tmplov-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Override me', title: 'Original title', priority: 'low' },
  });
  const template = JSON.parse(createRes.payload);
  const todoRes = await app.inject({
    method: 'POST',
    url: `/api/v1/templates/${template.id}/create-todo`,
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Overridden title', priority: 'high' },
  });
  assert.strictEqual(todoRes.statusCode, 201);
  const todo = JSON.parse(todoRes.payload);
  assert.strictEqual(todo.title, 'Overridden title');
  assert.strictEqual(todo.priority, 'high');
});

test('POST /api/v1/templates/:id/create-todo with tagIds associates tags', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `tmpltag-${suffix}`, email: `tmpltag-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const tag1Res = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'tag-for-tmpl-1', color: '#ff0000' },
  });
  const tag2Res = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'tag-for-tmpl-2', color: '#00ff00' },
  });
  const tag1 = JSON.parse(tag1Res.payload);
  const tag2 = JSON.parse(tag2Res.payload);
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Template with tags', title: 'Todo with tags', tagIds: [tag1.id, tag2.id] },
  });
  const template = JSON.parse(createRes.payload);
  const todoRes = await app.inject({
    method: 'POST',
    url: `/api/v1/templates/${template.id}/create-todo`,
    headers: { authorization: `Bearer ${token}` },
    payload: {},
  });
  assert.strictEqual(todoRes.statusCode, 201);
  const todo = JSON.parse(todoRes.payload);
  assert(todo.id != null);
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(getRes.statusCode, 200);
  const todoWithTags = JSON.parse(getRes.payload);
  assert(Array.isArray(todoWithTags.Tags));
  assert(todoWithTags.Tags.some((tag) => tag.id === tag1.id));
  assert(todoWithTags.Tags.some((tag) => tag.id === tag2.id));
});

test('POST /api/v1/templates/:id/create-todo for other user returns 404', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `tmpltodoA-${suffix}`, email: `tmpltodoA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `tmpltodoB-${suffix}`, email: `tmpltodoB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/templates',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: 'A template', title: 'A title' },
  });
  const template = JSON.parse(createRes.payload);
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/templates/${template.id}/create-todo`,
    headers: { authorization: `Bearer ${tokenB}` },
    payload: {},
  });
  assert.strictEqual(res.statusCode, 404);
});
