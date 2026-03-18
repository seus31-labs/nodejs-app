'use strict'

const crypto = require('node:crypto')
const { test } = require('node:test')
const assert = require('node:assert')
const { build } = require('../helper')

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
}

function ymd(d) {
  return d.toISOString().slice(0, 10)
}

async function registerAndLogin(app, suffix) {
  const user = { name: `rem-${suffix}`, email: `rem-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({
    method: 'POST',
    url: '/api/v1/login',
    payload: { email: user.email, password: user.password }
  })
  return JSON.parse(loginRes.payload).token
}

test('GET /api/v1/todos/due-soon without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({ method: 'GET', url: '/api/v1/todos/due-soon' })
  assert.strictEqual(res.statusCode, 401)
})

test('PATCH /api/v1/todos/:id/reminder without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'PATCH',
    url: '/api/v1/todos/1/reminder',
    payload: { enabled: false }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('GET /api/v1/todos/due-soon returns only due soon & reminder enabled todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const token = await registerAndLogin(app, suffix)

  const now = new Date()
  const in3days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  const todoSoonRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'due today', dueDate: ymd(now) }
  })
  assert.strictEqual(todoSoonRes.statusCode, 201)
  const todoSoon = JSON.parse(todoSoonRes.payload)

  const todoLaterRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'due later', dueDate: ymd(in3days) }
  })
  assert.strictEqual(todoLaterRes.statusCode, 201)

  const dueRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/due-soon',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.strictEqual(dueRes.statusCode, 200)
  const list = JSON.parse(dueRes.payload)
  assert(Array.isArray(list))
  assert(list.some((t) => t.id === todoSoon.id))
  assert(list.every((t) => t.title !== 'due later'))

  // disable reminder -> should be excluded
  const disableRes = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoSoon.id}/reminder`,
    headers: { authorization: `Bearer ${token}` },
    payload: { enabled: false }
  })
  assert.strictEqual(disableRes.statusCode, 200)
  const updated = JSON.parse(disableRes.payload)
  assert.strictEqual(updated.reminderEnabled, false)

  const dueRes2 = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/due-soon',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.strictEqual(dueRes2.statusCode, 200)
  const list2 = JSON.parse(dueRes2.payload)
  assert(list2.every((t) => t.id !== todoSoon.id))
})

test('PATCH /api/v1/todos/:id/reminder for missing todo returns 404', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const token = await registerAndLogin(app, suffix)

  const res = await app.inject({
    method: 'PATCH',
    url: '/api/v1/todos/999999/reminder',
    headers: { authorization: `Bearer ${token}` },
    payload: { enabled: false }
  })
  assert.strictEqual(res.statusCode, 404)
})

test('PATCH /api/v1/todos/:id/reminder cannot update other user todo (404)', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const owner = { name: `rmo-${suffix}`, email: `rmo-${suffix}@test.local`, password: 'pass123' }
  const other = { name: `rmb-${suffix}`, email: `rmb-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: owner })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: other })
  const ownerLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: owner.email, password: owner.password } })
  const otherLogin = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: other.email, password: other.password } })
  const ownerToken = JSON.parse(ownerLogin.payload).token
  const otherToken = JSON.parse(otherLogin.payload).token

  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${ownerToken}` },
    payload: { title: 'owner todo', dueDate: ymd(new Date()) }
  })
  assert.strictEqual(todoRes.statusCode, 201)
  const todo = JSON.parse(todoRes.payload)

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todo.id}/reminder`,
    headers: { authorization: `Bearer ${otherToken}` },
    payload: { enabled: false }
  })
  assert.strictEqual(res.statusCode, 404)
})

test('GET /api/v1/todos/due-soon excludes archived and completed todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const token = await registerAndLogin(app, suffix)

  const due = ymd(new Date())

  const todoActive = JSON.parse((await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'active', dueDate: due }
  })).payload)

  const todoDone = JSON.parse((await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'done', dueDate: due }
  })).payload)
  await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoDone.id}/toggle`,
    headers: { authorization: `Bearer ${token}` },
  })

  const todoArchived = JSON.parse((await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'archived', dueDate: due }
  })).payload)
  await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoArchived.id}/archive`,
    headers: { authorization: `Bearer ${token}` },
  })

  const dueRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/due-soon',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.strictEqual(dueRes.statusCode, 200)
  const list = JSON.parse(dueRes.payload)
  assert(list.some((t) => t.id === todoActive.id))
  assert(list.every((t) => t.id !== todoDone.id))
  assert(list.every((t) => t.id !== todoArchived.id))
})

