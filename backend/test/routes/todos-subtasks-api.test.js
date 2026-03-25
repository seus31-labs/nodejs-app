'use strict'

const crypto = require('node:crypto')
const { test } = require('node:test')
const assert = require('node:assert')
const { build } = require('../helper')

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
}

function tokenUserId(token) {
  const payload = token.split('.')[1]
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).id
}

async function setupOwnerViewEditUnshared(t, app) {
  const suffix = uniqueSuffix()
  const owner = { name: `tsa-owner-${suffix}`, email: `tsa-owner-${suffix}@test.local`, password: 'pass123' }
  const viewUser = { name: `tsa-view-${suffix}`, email: `tsa-view-${suffix}@test.local`, password: 'pass123' }
  const editUser = { name: `tsa-edit-${suffix}`, email: `tsa-edit-${suffix}@test.local`, password: 'pass123' }
  const unshared = { name: `tsa-out-${suffix}`, email: `tsa-out-${suffix}@test.local`, password: 'pass123' }

  for (const u of [owner, viewUser, editUser, unshared]) {
    await app.inject({ method: 'POST', url: '/api/v1/register', payload: u })
  }

  const ownerLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: owner.email, password: owner.password } })
  const viewLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: viewUser.email, password: viewUser.password } })
  const editLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: editUser.email, password: editUser.password } })
  const unsharedLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: unshared.email, password: unshared.password } })

  const ownerToken = JSON.parse(ownerLogin.payload).token
  const viewToken = JSON.parse(viewLogin.payload).token
  const editToken = JSON.parse(editLogin.payload).token
  const unsharedToken = JSON.parse(unsharedLogin.payload).token

  const viewId = tokenUserId(viewToken)
  const editId = tokenUserId(editToken)

  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'Shared parent todo' },
  })
  assert.strictEqual(todoRes.statusCode, 201)
  const todo = JSON.parse(todoRes.payload)

  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { sharedWithUserId: viewId, permission: 'view' },
  })
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/share`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { sharedWithUserId: editId, permission: 'edit' },
  })

  return { todo, ownerToken, viewToken, editToken, unsharedToken }
}

test('GET /api/v1/todos/:id/subtasks: view shared user はサブタスク一覧を取得できる', async (t) => {
  const app = await build(t)
  const { todo: parent, ownerToken, viewToken } = await setupOwnerViewEditUnshared(t, app)

  const subRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'child for view' },
  })
  assert.strictEqual(subRes.statusCode, 201)
  const subtask = JSON.parse(subRes.payload)

  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${viewToken}` },
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert(Array.isArray(body))
  assert(body.some((x) => x.id === subtask.id))
  assert(body.every((x) => x.parentId === parent.id))
})

test('POST /api/v1/todos/:id/subtasks: view shared user は作成できない（404）', async (t) => {
  const app = await build(t)
  const { todo: parent, viewToken } = await setupOwnerViewEditUnshared(t, app)

  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${viewToken}` },
    payload: { title: 'child by view should fail' },
  })
  assert.strictEqual(res.statusCode, 404)
})

test('POST /api/v1/todos/:id/subtasks: edit shared user は作成できる', async (t) => {
  const app = await build(t)
  const { todo: parent, editToken } = await setupOwnerViewEditUnshared(t, app)

  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${editToken}` },
    payload: { title: 'child by edit' },
  })
  assert.strictEqual(res.statusCode, 201)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.parentId, parent.id)
  assert.strictEqual(body.title, 'child by edit')
})

test('GET /api/v1/todos/:id/progress: view shared user は進捗率を取得できる', async (t) => {
  const app = await build(t)
  const { todo: parent, ownerToken, viewToken } = await setupOwnerViewEditUnshared(t, app)

  const child1Res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'child done' },
  })
  assert.strictEqual(child1Res.statusCode, 201)
  const child1 = JSON.parse(child1Res.payload)

  const child2Res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'child open' },
  })
  assert.strictEqual(child2Res.statusCode, 201)

  const toggleRes = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${child1.id}/toggle`,
    headers: { authorization: `Bearer ${ownerToken}` },
  })
  assert.strictEqual(toggleRes.statusCode, 200)

  const progressRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${parent.id}/progress`,
    headers: { authorization: `Bearer ${viewToken}` },
  })
  assert.strictEqual(progressRes.statusCode, 200)
  const progress = JSON.parse(progressRes.payload)
  assert.strictEqual(progress.completed, 1)
  assert.strictEqual(progress.total, 2)
  assert.strictEqual(progress.percentage, 50)
})

test('GET /api/v1/todos/:id/subtasks: unshared user は 404', async (t) => {
  const app = await build(t)
  const { todo: parent, ownerToken, unsharedToken } = await setupOwnerViewEditUnshared(t, app)

  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'child for unshared' },
  })

  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${unsharedToken}` },
  })
  assert.strictEqual(res.statusCode, 404)
})

test('GET /api/v1/todos/:id/progress: unshared user は 404', async (t) => {
  const app = await build(t)
  const { todo: parent, ownerToken, unsharedToken } = await setupOwnerViewEditUnshared(t, app)

  const child1Res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'child for unshared progress' },
  })
  assert.strictEqual(child1Res.statusCode, 201)

  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${parent.id}/progress`,
    headers: { authorization: `Bearer ${unsharedToken}` },
  })
  assert.strictEqual(res.statusCode, 404)
})

