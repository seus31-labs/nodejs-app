'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const { build } = require('../helper')

test('GET /api/v1/todos without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos'
  })
  assert.strictEqual(res.statusCode, 401)
})

test('POST /api/v1/todos without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    payload: { title: 'test' }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('other user cannot access todo (GET) - 404', async (t) => {
  const app = await build(t)
  const suffix = Date.now()
  const userA = { name: `userA-${suffix}`, email: `a-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `userB-${suffix}`, email: `b-${suffix}@test.local`, password: 'pass123' }

  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })

  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  assert.strictEqual(loginA.statusCode, 200)
  assert.strictEqual(loginB.statusCode, 200)
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token

  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A private todo' }
  })
  assert.strictEqual(createRes.statusCode, 201)
  const todo = JSON.parse(createRes.payload)
  const todoId = todo.id

  const getAsB = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todoId}`,
    headers: { authorization: `Bearer ${tokenB}` }
  })
  assert.strictEqual(getAsB.statusCode, 404, 'user B must not see user A todo')
})

test('other user cannot update todo (PUT) - 404', async (t) => {
  const app = await build(t)
  const suffix = Date.now()
  const userA = { name: `userA2-${suffix}`, email: `a2-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `userB2-${suffix}`, email: `b2-${suffix}@test.local`, password: 'pass123' }

  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })

  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token

  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A todo' }
  })
  const todoId = JSON.parse(createRes.payload).id

  const putAsB = await app.inject({
    method: 'PUT',
    url: `/api/v1/todos/${todoId}`,
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { title: 'hacked' }
  })
  assert.strictEqual(putAsB.statusCode, 404)
})

test('other user cannot delete todo (DELETE) - 404', async (t) => {
  const app = await build(t)
  const suffix = Date.now()
  const userA = { name: `userA3-${suffix}`, email: `a3-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `userB3-${suffix}`, email: `b3-${suffix}@test.local`, password: 'pass123' }

  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })

  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token

  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A todo' }
  })
  const todoId = JSON.parse(createRes.payload).id

  const delAsB = await app.inject({
    method: 'DELETE',
    url: `/api/v1/todos/${todoId}`,
    headers: { authorization: `Bearer ${tokenB}` }
  })
  assert.strictEqual(delAsB.statusCode, 404)
})
