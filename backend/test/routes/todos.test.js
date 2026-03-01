'use strict'

const crypto = require('node:crypto')
const { test } = require('node:test')
const assert = require('node:assert')
const { build } = require('../helper')

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
}

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

test('GET /api/v1/todos/search without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    query: { q: 'test' }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('GET /api/v1/todos/search with empty q returns 400', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `u-${suffix}`, email: `u-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const resEmpty = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: '' }
  })
  assert.strictEqual(resEmpty.statusCode, 400)
  const resMissing = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(resMissing.statusCode, 400)
})

test('GET /api/v1/todos/search with auth returns matching todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `search-${suffix}`, email: `search-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({
    method: 'POST',
    url: '/api/v1/login',
    payload: { email: user.email, password: user.password }
  })
  const token = JSON.parse(loginRes.payload).token
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: '買い物メモ', description: '牛乳を買う' }
  })
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: '買い物' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(Array.isArray(todos))
  assert(todos.length >= 1)
  assert(todos.some((todo) => todo.title.includes('買い物') || (todo.description && todo.description.includes('買い物'))))
})

test('GET /api/v1/todos/search returns empty array when no match', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `nomatch-${suffix}`, email: `nomatch-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'あいうえお', description: 'メモ' }
  })
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: '一致しないキーワードxyz' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(Array.isArray(todos))
  assert.strictEqual(todos.length, 0)
})

test('GET /api/v1/todos/search with priority filter returns filtered results', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `pf-${suffix}`, email: `pf-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: '重要タスク', priority: 'high' }
  })
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: '低優先タスク', priority: 'low' }
  })
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'タスク', priority: 'high' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(Array.isArray(todos))
  assert.strictEqual(todos.length, 1)
  assert.strictEqual(todos[0].title, '重要タスク')
  assert.strictEqual(todos[0].priority, 'high')
})

test('search returns only own todos (other user todos not included)', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const userA = { name: `searchA-${suffix}`, email: `searchA-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `searchB-${suffix}`, email: `searchB-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'userA only secret', description: 'A' }
  })
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { title: 'userB only secret', description: 'B' }
  })
  const searchAsB = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${tokenB}` },
    query: { q: 'secret' }
  })
  assert.strictEqual(searchAsB.statusCode, 200)
  const todosB = JSON.parse(searchAsB.payload)
  assert(Array.isArray(todosB))
  assert.strictEqual(todosB.length, 1)
  assert.strictEqual(todosB[0].title, 'userB only secret')
  assert(todosB.every((todo) => todo.userId === todosB[0].userId))
})

test('other user cannot access todo (GET) - 404', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
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
  const suffix = uniqueSuffix()
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
  const suffix = uniqueSuffix()
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

test('GET /api/v1/todos with sortBy and sortOrder returns sorted list', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `sort-${suffix}`, email: `sort-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'First' }
  })
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Second' }
  })
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    query: { sortBy: 'createdAt', sortOrder: 'desc' }
  })
  assert.strictEqual(listRes.statusCode, 200)
  const todos = JSON.parse(listRes.payload)
  assert(Array.isArray(todos) && todos.length >= 2)
  const created = todos.map((todo) => new Date(todo.createdAt).getTime())
  for (let i = 1; i < created.length; i++) {
    assert(created[i] <= created[i - 1], 'desc order: newer first')
  }
})

test('PUT /api/v1/todos/reorder without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'PUT',
    url: '/api/v1/todos/reorder',
    payload: { todoIds: [1, 2, 3] }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('PUT /api/v1/todos/reorder with empty todoIds returns 400', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `reorder-${suffix}`, email: `reorder-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const res = await app.inject({
    method: 'PUT',
    url: '/api/v1/todos/reorder',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [] }
  })
  assert.strictEqual(res.statusCode, 400)
})

test('PUT /api/v1/todos/reorder updates order and GET sortBy=sortOrder returns new order', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `reorder2-${suffix}`, email: `reorder2-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const c1 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'A' }
  })
  const c2 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'B' }
  })
  const c3 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'C' }
  })
  const idA = JSON.parse(c1.payload).id
  const idB = JSON.parse(c2.payload).id
  const idC = JSON.parse(c3.payload).id
  const reorderRes = await app.inject({
    method: 'PUT',
    url: '/api/v1/todos/reorder',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [idC, idA, idB] }
  })
  assert.strictEqual(reorderRes.statusCode, 204)
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    query: { sortBy: 'sortOrder', sortOrder: 'asc' }
  })
  assert.strictEqual(listRes.statusCode, 200)
  const todos = JSON.parse(listRes.payload)
  const titles = todos.map((todo) => todo.title)
  assert.strictEqual(titles[0], 'C')
  assert.strictEqual(titles[1], 'A')
  assert.strictEqual(titles[2], 'B')
})
