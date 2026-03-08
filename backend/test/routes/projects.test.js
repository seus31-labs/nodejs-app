'use strict';

const crypto = require('node:crypto');
const { test } = require('node:test');
const assert = require('node:assert');
const { build } = require('../helper');

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

test('GET /api/v1/projects without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({ method: 'GET', url: '/api/v1/projects' });
  assert.strictEqual(res.statusCode, 401);
});

test('POST /api/v1/projects without auth returns 401', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    payload: { name: 'My Project' },
  });
  assert.strictEqual(res.statusCode, 401);
});

test('POST /api/v1/projects creates project and GET /projects returns it', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `proj-${suffix}`, email: `proj-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Work', description: 'Work items', color: '#ff0000' },
  });
  assert.strictEqual(createRes.statusCode, 201);
  const project = JSON.parse(createRes.payload);
  assert.strictEqual(project.name, 'Work');
  assert.strictEqual(project.description, 'Work items');
  assert.strictEqual(project.color, '#ff0000');
  assert.strictEqual(project.archived, false);
  assert(project.id != null);
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(listRes.statusCode, 200);
  const list = JSON.parse(listRes.payload);
  assert(list.some((p) => p.id === project.id && p.name === 'Work'));
});

test('POST /api/v1/projects duplicate name returns 409', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `projd-${suffix}`, email: `projd-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Same' },
  });
  const res2 = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Same' },
  });
  assert.strictEqual(res2.statusCode, 409);
});

test('GET /api/v1/projects/:id returns project', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `projg-${suffix}`, email: `projg-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Get me' },
  });
  const project = JSON.parse(createRes.payload);
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/v1/projects/${project.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(getRes.statusCode, 200);
  const got = JSON.parse(getRes.payload);
  assert.strictEqual(got.id, project.id);
  assert.strictEqual(got.name, 'Get me');
});

test('GET /api/v1/projects/:id for other user returns 404', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const userA = { name: `projA-${suffix}`, email: `projA-${suffix}@test.local`, password: 'pass123' };
  const userB = { name: `projB-${suffix}`, email: `projB-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA });
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB });
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } });
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } });
  const tokenA = JSON.parse(loginA.payload).token;
  const tokenB = JSON.parse(loginB.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { name: 'A project' },
  });
  const project = JSON.parse(createRes.payload);
  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/projects/${project.id}`,
    headers: { authorization: `Bearer ${tokenB}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

test('PUT /api/v1/projects/:id updates project', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `proju-${suffix}`, email: `proju-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Original' },
  });
  const project = JSON.parse(createRes.payload);
  const updateRes = await app.inject({
    method: 'PUT',
    url: `/api/v1/projects/${project.id}`,
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Updated', description: 'Desc', color: '#00ff00' },
  });
  assert.strictEqual(updateRes.statusCode, 200);
  const updated = JSON.parse(updateRes.payload);
  assert.strictEqual(updated.name, 'Updated');
  assert.strictEqual(updated.description, 'Desc');
  assert.strictEqual(updated.color, '#00ff00');
});

test('DELETE /api/v1/projects/:id deletes project', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `projdel-${suffix}`, email: `projdel-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'To delete' },
  });
  const project = JSON.parse(createRes.payload);
  const delRes = await app.inject({
    method: 'DELETE',
    url: `/api/v1/projects/${project.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(delRes.statusCode, 204);
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/v1/projects/${project.id}`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(getRes.statusCode, 404);
});

test('GET /api/v1/projects/:id/todos returns todos and 404 when project missing', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `projt-${suffix}`, email: `projt-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'With todos' },
  });
  const project = JSON.parse(createRes.payload);
  const todosRes = await app.inject({
    method: 'GET',
    url: `/api/v1/projects/${project.id}/todos`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(todosRes.statusCode, 200);
  const todos = JSON.parse(todosRes.payload);
  assert(Array.isArray(todos));
  assert.strictEqual(todos.length, 0);
  const notFoundRes = await app.inject({
    method: 'GET',
    url: '/api/v1/projects/999999/todos',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(notFoundRes.statusCode, 404);
});

test('GET /api/v1/projects/:id/progress returns progress and 404 when project missing', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `projp-${suffix}`, email: `projp-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Progress' },
  });
  const project = JSON.parse(createRes.payload);
  const progressRes = await app.inject({
    method: 'GET',
    url: `/api/v1/projects/${project.id}/progress`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(progressRes.statusCode, 200);
  const progress = JSON.parse(progressRes.payload);
  assert.strictEqual(progress.total, 0);
  assert.strictEqual(progress.completed, 0);
  const notFoundRes = await app.inject({
    method: 'GET',
    url: '/api/v1/projects/999999/progress',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(notFoundRes.statusCode, 404);
});

test('PATCH /api/v1/projects/:id/archive archives project', async (t) => {
  const app = await build(t);
  const suffix = uniqueSuffix();
  const user = { name: `proja-${suffix}`, email: `proja-${suffix}@test.local`, password: 'pass123' };
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user });
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } });
  const token = JSON.parse(loginRes.payload).token;
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'To archive' },
  });
  const project = JSON.parse(createRes.payload);
  const archiveRes = await app.inject({
    method: 'PATCH',
    url: `/api/v1/projects/${project.id}/archive`,
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(archiveRes.statusCode, 200);
  const archived = JSON.parse(archiveRes.payload);
  assert.strictEqual(archived.archived, true);
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/projects',
    headers: { authorization: `Bearer ${token}` },
  });
  const list = JSON.parse(listRes.payload);
  assert(!list.some((p) => p.id === project.id));
  const listWithArchived = await app.inject({
    method: 'GET',
    url: '/api/v1/projects?includeArchived=true',
    headers: { authorization: `Bearer ${token}` },
  });
  const listAll = JSON.parse(listWithArchived.payload);
  assert(listAll.some((p) => p.id === project.id && p.archived === true));
});
