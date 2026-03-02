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

test('GET /api/v1/todos/search by tag name returns todos with that tag', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `tagsearch-${suffix}`, email: `tagsearch-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'urgent-work', color: '#ff0000' }
  })
  assert.strictEqual(tagRes.statusCode, 201)
  const tag = JSON.parse(tagRes.payload)
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Todo with tag only', description: 'no keyword' }
  })
  assert.strictEqual(todoRes.statusCode, 201)
  const todo = JSON.parse(todoRes.payload)
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${token}` },
    payload: { tagId: tag.id }
  })
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'urgent' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(Array.isArray(todos))
  assert(todos.some((t) => t.id === todo.id), 'search by tag name must return todo that has that tag')
})

test('GET /api/v1/todos/search title and tag name both hit returns deduplicated', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `dedup-${suffix}`, email: `dedup-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'work-keyword', color: '#0000ff' }
  })
  assert.strictEqual(tagRes.statusCode, 201)
  const tag = JSON.parse(tagRes.payload)
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'work-keyword in title', description: 'desc' }
  })
  assert.strictEqual(todoRes.statusCode, 201)
  const todo = JSON.parse(todoRes.payload)
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo.id}/tags`,
    headers: { authorization: `Bearer ${token}` },
    payload: { tagId: tag.id }
  })
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'work-keyword' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert.strictEqual(todos.length, 1, 'title and tag name both hit must be deduplicated to one')
  assert.strictEqual(todos[0].id, todo.id)
})

test('GET /api/v1/todos/search title only hit (no tag name match) returns todo', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `titleonly-${suffix}`, email: `titleonly-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'other-tag', color: '#00ff00' }
  })
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'only-in-title', description: 'no match' }
  })
  assert.strictEqual(todoRes.statusCode, 201)
  const todo = JSON.parse(todoRes.payload)
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'only-in-title' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(todos.some((t) => t.id === todo.id), 'title-only match must return todo')
})

test('GET /api/v1/todos/search with q and tagIds combined filters correctly', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `combo-${suffix}`, email: `combo-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const tagARes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'tagA', color: '#ff0000' }
  })
  const tagBRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'tagB', color: '#00ff00' }
  })
  const tagA = JSON.parse(tagARes.payload)
  const tagB = JSON.parse(tagBRes.payload)
  const todo1Res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'keyword', description: 'desc' }
  })
  const todo1 = JSON.parse(todo1Res.payload)
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo1.id}/tags`,
    headers: { authorization: `Bearer ${token}` },
    payload: { tagId: tagA.id }
  })
  const todo2Res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'keyword', description: 'desc' }
  })
  const todo2 = JSON.parse(todo2Res.payload)
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo2.id}/tags`,
    headers: { authorization: `Bearer ${token}` },
    payload: { tagId: tagB.id }
  })
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'keyword', tags: tagA.id }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert.strictEqual(todos.length, 1)
  assert.strictEqual(todos[0].id, todo1.id)
})

test('GET /api/v1/todos/search no match returns empty array', async (t) => {
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
    payload: { title: 'some todo', description: 'desc' }
  })
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'xyznonexistent' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(Array.isArray(todos))
  assert.strictEqual(todos.length, 0)
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

test('reorder with other user todo id returns 204 and does not change other user todo sort_order', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const userA = { name: `reorderA-${suffix}`, email: `reorderA-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `reorderB-${suffix}`, email: `reorderB-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token
  const createA1 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A1' }
  })
  const createA2 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A2' }
  })
  const createB = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { title: 'B1' }
  })
  const idA1 = JSON.parse(createA1.payload).id
  const idA2 = JSON.parse(createA2.payload).id
  const idB = JSON.parse(createB.payload).id
  const listBBefore = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenB}` },
    query: { sortBy: 'sortOrder', sortOrder: 'asc' }
  })
  const todoBBefore = JSON.parse(listBBefore.payload).find((todo) => todo.id === idB)
  assert(todoBBefore != null)
  const sortOrderBBefore = todoBBefore.sortOrder
  const reorderRes = await app.inject({
    method: 'PUT',
    url: '/api/v1/todos/reorder',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { todoIds: [idA2, idB, idA1] }
  })
  assert.strictEqual(reorderRes.statusCode, 204)
  const listBAfter = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenB}` },
    query: { sortBy: 'sortOrder', sortOrder: 'asc' }
  })
  const todoBAfter = JSON.parse(listBAfter.payload).find((todo) => todo.id === idB)
  assert(todoBAfter != null)
  assert.strictEqual(todoBAfter.sortOrder, sortOrderBBefore, 'other user todo sort_order must be unchanged')
  const listA = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    query: { sortBy: 'sortOrder', sortOrder: 'asc' }
  })
  const todosA = JSON.parse(listA.payload)
  const titlesA = todosA.map((todo) => todo.title)
  assert.strictEqual(titlesA[0], 'A2')
  assert.strictEqual(titlesA[1], 'A1')
})

test('PATCH /api/v1/todos/:id/archive without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'PATCH',
    url: '/api/v1/todos/1/archive'
  })
  assert.strictEqual(res.statusCode, 401)
})

test('PATCH /api/v1/todos/:id/archive archives todo and GET /todos excludes it', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `arch-${suffix}`, email: `arch-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'To archive' }
  })
  const todoId = JSON.parse(createRes.payload).id
  const archiveRes = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoId}/archive`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(archiveRes.statusCode, 200)
  const archived = JSON.parse(archiveRes.payload)
  assert.strictEqual(archived.archived, true)
  assert(archived.archivedAt != null)
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` }
  })
  const list = JSON.parse(listRes.payload)
  assert(!list.some((todo) => todo.id === todoId))
  const archivedListRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/archived',
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(archivedListRes.statusCode, 200)
  const archivedList = JSON.parse(archivedListRes.payload)
  assert(archivedList.some((todo) => todo.id === todoId))
})

test('PATCH /api/v1/todos/:id/unarchive restores todo to list', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `unarch-${suffix}`, email: `unarch-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Archived one' }
  })
  const todoId = JSON.parse(createRes.payload).id
  await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoId}/archive`,
    headers: { authorization: `Bearer ${token}` }
  })
  const unarchiveRes = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoId}/unarchive`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(unarchiveRes.statusCode, 200)
  const todo = JSON.parse(unarchiveRes.payload)
  assert.strictEqual(todo.archived, false)
  assert.strictEqual(todo.archivedAt, null)
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` }
  })
  assert(listRes.statusCode === 200 && JSON.parse(listRes.payload).some((todo) => todo.id === todoId))
})

test('DELETE /api/v1/todos/archived without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({ method: 'DELETE', url: '/api/v1/todos/archived' })
  assert.strictEqual(res.statusCode, 401)
})

test('DELETE /api/v1/todos/archived deletes all archived todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `delarch-${suffix}`, email: `delarch-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'One' }
  })
  const c2 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Two' }
  })
  const id2 = JSON.parse(c2.payload).id
  await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${id2}/archive`,
    headers: { authorization: `Bearer ${token}` }
  })
  const delRes = await app.inject({
    method: 'DELETE',
    url: '/api/v1/todos/archived',
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(delRes.statusCode, 204)
  const archivedRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/archived',
    headers: { authorization: `Bearer ${token}` }
  })
  const archived = JSON.parse(archivedRes.payload)
  assert.strictEqual(archived.length, 0)
})

test('other user cannot archive my todo (404)', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const userA = { name: `archA-${suffix}`, email: `archA-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `archB-${suffix}`, email: `archB-${suffix}@test.local`, password: 'pass123' }
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
  const archiveAsB = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoId}/archive`,
    headers: { authorization: `Bearer ${tokenB}` }
  })
  assert.strictEqual(archiveAsB.statusCode, 404)
})

test('archived todo returns 404 for GET /todos/:id and PUT /todos/:id', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `getarch-${suffix}`, email: `getarch-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'To archive' }
  })
  const todoId = JSON.parse(createRes.payload).id
  await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoId}/archive`,
    headers: { authorization: `Bearer ${token}` }
  })
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todoId}`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(getRes.statusCode, 404)
  const putRes = await app.inject({
    method: 'PUT',
    url: `/api/v1/todos/${todoId}`,
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Updated' }
  })
  assert.strictEqual(putRes.statusCode, 404)
})

test('other user cannot unarchive my todo (404)', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const userA = { name: `unarchA-${suffix}`, email: `unarchA-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `unarchB-${suffix}`, email: `unarchB-${suffix}@test.local`, password: 'pass123' }
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
  await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoId}/archive`,
    headers: { authorization: `Bearer ${tokenA}` }
  })
  const unarchiveAsB = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${todoId}/unarchive`,
    headers: { authorization: `Bearer ${tokenB}` }
  })
  assert.strictEqual(unarchiveAsB.statusCode, 404)
})

test('POST /api/v1/todos/bulk-complete without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-complete',
    payload: { todoIds: [1, 2] }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('POST /api/v1/todos/bulk-delete without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-delete',
    payload: { todoIds: [1, 2] }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('POST /api/v1/todos/bulk-archive without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-archive',
    payload: { todoIds: [1, 2] }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('POST /api/v1/todos/bulk-complete with empty todoIds returns 400', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulk-${suffix}`, email: `bulk-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-complete',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [] }
  })
  assert.strictEqual(res.statusCode, 400)
})

test('POST /api/v1/todos/bulk-delete with empty todoIds returns 400', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulkdel-${suffix}`, email: `bulkdel-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-delete',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [] }
  })
  assert.strictEqual(res.statusCode, 400)
})

test('POST /api/v1/todos/bulk-archive with empty todoIds returns 400', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulkarch-${suffix}`, email: `bulkarch-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-archive',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [] }
  })
  assert.strictEqual(res.statusCode, 400)
})

test('POST /api/v1/todos/bulk-complete with todoIds exceeding maxItems returns 400', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulkmax-${suffix}`, email: `bulkmax-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const tooMany = Array.from({ length: 101 }, (_, i) => i + 1)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-complete',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: tooMany }
  })
  assert.strictEqual(res.statusCode, 400)
})

test('POST /api/v1/todos/bulk-complete marks selected todos completed', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulkc-${suffix}`, email: `bulkc-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const c1 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'One' }
  })
  const c2 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Two' }
  })
  const id1 = JSON.parse(c1.payload).id
  const id2 = JSON.parse(c2.payload).id
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-complete',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [id1, id2] }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.updated, 2)
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` }
  })
  const list = JSON.parse(listRes.payload)
  assert(list.every((todo) => todo.completed))
})

test('POST /api/v1/todos/bulk-delete deletes selected todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulkd-${suffix}`, email: `bulkd-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const c1 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'One' }
  })
  const id1 = JSON.parse(c1.payload).id
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-delete',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [id1] }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.deleted, 1)
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${id1}`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(getRes.statusCode, 404)
})

test('POST /api/v1/todos/bulk-archive archives selected todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulka-${suffix}`, email: `bulka-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const c1 = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'One' }
  })
  const id1 = JSON.parse(c1.payload).id
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-archive',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [id1] }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.updated, 1)
  const archivedRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/archived',
    headers: { authorization: `Bearer ${token}` }
  })
  const archived = JSON.parse(archivedRes.payload)
  assert(archived.some((todo) => todo.id === id1))
})

test('bulk-complete with other user todo ids returns updated 0 and does not change other user todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const userA = { name: `bulkA-${suffix}`, email: `bulkA-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `bulkB-${suffix}`, email: `bulkB-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token
  const createA = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A todo' }
  })
  const idA = JSON.parse(createA.payload).id
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-complete',
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { todoIds: [idA] }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.updated, 0)
  const getA = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${idA}`,
    headers: { authorization: `Bearer ${tokenA}` }
  })
  assert.strictEqual(getA.statusCode, 200)
  assert.strictEqual(JSON.parse(getA.payload).completed, false)
})

test('bulk-delete with other user todo ids returns deleted 0 and does not delete other user todo', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const userA = { name: `bulkdelA-${suffix}`, email: `bulkdelA-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `bulkdelB-${suffix}`, email: `bulkdelB-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token
  const createA = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A todo' }
  })
  const idA = JSON.parse(createA.payload).id
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-delete',
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { todoIds: [idA] }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.deleted, 0)
  const getA = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${idA}`,
    headers: { authorization: `Bearer ${tokenA}` }
  })
  assert.strictEqual(getA.statusCode, 200)
})

test('bulk-archive with other user todo ids returns updated 0 and does not archive other user todo', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const userA = { name: `bulkarchA-${suffix}`, email: `bulkarchA-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `bulkarchB-${suffix}`, email: `bulkarchB-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token
  const createA = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A todo' }
  })
  const idA = JSON.parse(createA.payload).id
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-archive',
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { todoIds: [idA] }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.updated, 0)
  const getA = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${idA}`,
    headers: { authorization: `Bearer ${tokenA}` }
  })
  assert.strictEqual(getA.statusCode, 200)
  assert.strictEqual(JSON.parse(getA.payload).archived, false)
})
