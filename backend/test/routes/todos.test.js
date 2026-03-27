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

test('GET /api/v1/todos/:id/subtasks without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/1/subtasks'
  })
  assert.strictEqual(res.statusCode, 401)
})

test('POST /api/v1/todos/:id/subtasks without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/1/subtasks',
    payload: { title: 'child' }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('GET /api/v1/todos/:id/progress without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/1/progress'
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

test('POST /api/v1/todos recurrence validation returns 400/201 as expected', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `recur-create-${suffix}`, email: `recur-create-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const cases = [
    { payload: { title: 'ng1', isRecurring: 'true' }, status: 400 },
    { payload: { title: 'ng2', isRecurring: true, recurrencePattern: 'yearly' }, status: 400 },
    { payload: { title: 'ng3', isRecurring: true, recurrencePattern: 'daily', recurrenceInterval: 0 }, status: 400 },
    { payload: { title: 'ng4', isRecurring: true, recurrencePattern: 'daily', recurrenceInterval: -1 }, status: 400 },
    { payload: { title: 'ng5', isRecurring: true, recurrencePattern: 'daily', recurrenceInterval: 1.5 }, status: 400 },
    { payload: { title: 'ng6', isRecurring: true, recurrencePattern: 'daily', recurrenceEndDate: '2026-13-01' }, status: 400 },
    { payload: { title: 'ng7', isRecurring: true, recurrencePattern: 'daily', recurrenceEndDate: 'abc' }, status: 400 },
    { payload: { title: 'ng8', isRecurring: false, recurrencePattern: 'daily' }, status: 400 },
    { payload: { title: 'ng9', isRecurring: true }, status: 400 },
    {
      payload: {
        title: 'ok1',
        isRecurring: true,
        recurrencePattern: 'weekly',
        recurrenceInterval: 2,
        recurrenceEndDate: '2026-12-31',
      },
      status: 201
    },
  ]

  for (const c of cases) {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/todos',
      headers: { authorization: `Bearer ${token}` },
      payload: c.payload
    })
    assert.strictEqual(res.statusCode, c.status)
  }
})

test('PUT /api/v1/todos recurrence validation returns 400 as expected', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `recur-put-${suffix}`, email: `recur-put-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const created = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'target todo' }
  })
  assert.strictEqual(created.statusCode, 201)
  const todoId = JSON.parse(created.payload).id

  const cases = [
    { isRecurring: 'not-bool' },
    { recurrencePattern: 'yearly' },
    { recurrenceInterval: 0 },
    { recurrenceInterval: -1 },
    { recurrenceInterval: 1.5 },
    { recurrenceEndDate: '2026-13-01' },
    { recurrenceEndDate: 'abc' },
    { isRecurring: false, recurrencePattern: 'daily' },
    { isRecurring: false, recurrenceInterval: 2 },
  ]

  for (const payload of cases) {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/todos/${todoId}`,
      headers: { authorization: `Bearer ${token}` },
      payload
    })
    assert.strictEqual(res.statusCode, 400)
  }
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

test('GET /api/v1/todos/search with completed=true returns only completed todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `comp-${suffix}`, email: `comp-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const doneRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'done task' }
  })
  assert.strictEqual(doneRes.statusCode, 201)
  const doneTodo = JSON.parse(doneRes.payload)
  const toggleRes = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${doneTodo.id}/toggle`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(toggleRes.statusCode, 200)
  const openRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'open task' }
  })
  assert.strictEqual(openRes.statusCode, 201)
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'task', completed: 'true' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(todos.length >= 1)
  assert(todos.every((todo) => todo.completed === true))
  assert(todos.some((todo) => todo.id === doneTodo.id))
})

test('GET /api/v1/todos/search with completed=false returns only incomplete todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `open-${suffix}`, email: `open-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const openRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'open only' }
  })
  assert.strictEqual(openRes.statusCode, 201)
  const openTodo = JSON.parse(openRes.payload)
  const doneRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'done only' }
  })
  assert.strictEqual(doneRes.statusCode, 201)
  const doneTodo = JSON.parse(doneRes.payload)
  const toggleRes = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${doneTodo.id}/toggle`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(toggleRes.statusCode, 200)
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'only', completed: 'false' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(todos.length >= 1)
  assert(todos.every((todo) => todo.completed === false))
  assert(todos.some((todo) => todo.id === openTodo.id))
})

test('GET /api/v1/todos/search with q and completed and priority returns combined filter', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `combo-${suffix}`, email: `combo-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const matchRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'combo-target', priority: 'high' }
  })
  assert.strictEqual(matchRes.statusCode, 201)
  const matchTodo = JSON.parse(matchRes.payload)
  const searchRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/search',
    headers: { authorization: `Bearer ${token}` },
    query: { q: 'combo-target', completed: 'false', priority: 'high' }
  })
  assert.strictEqual(searchRes.statusCode, 200)
  const todos = JSON.parse(searchRes.payload)
  assert(todos.some((t) => t.id === matchTodo.id))
  const found = todos.find((t) => t.id === matchTodo.id)
  assert.strictEqual(found.priority, 'high')
  assert.strictEqual(found.completed, false)
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

test('GET /api/v1/todos/:id/subtasks with unknown id returns 404', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `sub404-${suffix}`, email: `sub404-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/99999999/subtasks',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.strictEqual(res.statusCode, 404)
})

test('GET /api/v1/todos/:id/subtasks returns empty list when no subtasks', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `subok-${suffix}`, email: `subok-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const parentRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Parent only todo' }
  })
  assert.strictEqual(parentRes.statusCode, 201)
  const parent = JSON.parse(parentRes.payload)

  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${token}` },
  })
  assert.strictEqual(res.statusCode, 200)
  const subtasks = JSON.parse(res.payload)
  assert(Array.isArray(subtasks))
  assert.strictEqual(subtasks.length, 0)
})

test('POST /api/v1/todos/:id/subtasks creates subtask', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `subcreate-${suffix}`, email: `subcreate-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const parentRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Parent todo for child' }
  })
  assert.strictEqual(parentRes.statusCode, 201)
  const parent = JSON.parse(parentRes.payload)

  const createRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Child todo' }
  })
  assert.strictEqual(createRes.statusCode, 201)
  const subtask = JSON.parse(createRes.payload)
  assert.strictEqual(subtask.parentId, parent.id)
  assert.strictEqual(subtask.title, 'Child todo')
})

test('POST /api/v1/todos/:id/subtasks with unknown id returns 404', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `subcreate404-${suffix}`, email: `subcreate404-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const createRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/99999999/subtasks',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Child todo' }
  })
  assert.strictEqual(createRes.statusCode, 404)
})

test('GET /api/v1/todos/:id/progress with unknown id returns 404', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `prog404-${suffix}`, email: `prog404-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const progressRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/99999999/progress',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.strictEqual(progressRes.statusCode, 404)
})

test('GET /api/v1/todos/:id/progress returns completed/total/percentage', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `prog-${suffix}`, email: `prog-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const parentRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Parent progress todo' }
  })
  assert.strictEqual(parentRes.statusCode, 201)
  const parent = JSON.parse(parentRes.payload)

  const child1Res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Child done' }
  })
  assert.strictEqual(child1Res.statusCode, 201)
  const child1 = JSON.parse(child1Res.payload)

  const child2Res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Child open' }
  })
  assert.strictEqual(child2Res.statusCode, 201)

  const toggleRes = await app.inject({
    method: 'PATCH',
    url: `/api/v1/todos/${child1.id}/toggle`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(toggleRes.statusCode, 200)

  const progressRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${parent.id}/progress`,
    headers: { authorization: `Bearer ${token}` },
  })
  assert.strictEqual(progressRes.statusCode, 200)
  const progress = JSON.parse(progressRes.payload)
  assert.strictEqual(progress.completed, 1)
  assert.strictEqual(progress.total, 2)
  assert.strictEqual(progress.percentage, 50)
})

test('GET /api/v1/todos/:id/progress returns 0 when no subtasks', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `prog0-${suffix}`, email: `prog0-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const parentRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Parent without children' }
  })
  assert.strictEqual(parentRes.statusCode, 201)
  const parent = JSON.parse(parentRes.payload)

  const progressRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${parent.id}/progress`,
    headers: { authorization: `Bearer ${token}` },
  })
  assert.strictEqual(progressRes.statusCode, 200)
  const progress = JSON.parse(progressRes.payload)
  assert.strictEqual(progress.completed, 0)
  assert.strictEqual(progress.total, 0)
  assert.strictEqual(progress.percentage, 0)
})

test('GET /api/v1/todos does not include subtasks (parentId not null)', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `sublist-${suffix}`, email: `sublist-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const parentRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Parent todo' }
  })
  assert.strictEqual(parentRes.statusCode, 201)
  const parent = JSON.parse(parentRes.payload)

  // Task 5.4.2 実装後はサブタスク作成API経由で準備する。
  const subtaskRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${parent.id}/subtasks`,
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Child todo' }
  })
  assert.strictEqual(subtaskRes.statusCode, 201)
  const subtask = JSON.parse(subtaskRes.payload)

  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(listRes.statusCode, 200)
  const todos = JSON.parse(listRes.payload)
  assert(todos.some((todo) => todo.id === parent.id), 'parent todo must be included')
  assert(!todos.some((todo) => todo.id === subtask.id), 'subtask must not be included')
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

test('GET /api/v1/todos with startDate and endDate returns todos in range', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `dr-${suffix}`, email: `dr-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'in-range', dueDate: '2026-03-15' }
  })
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'out-of-range', dueDate: '2026-04-01' }
  })

  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    query: { startDate: '2026-03-01', endDate: '2026-03-31' }
  })
  assert.strictEqual(res.statusCode, 200)
  const todos = JSON.parse(res.payload)
  assert(todos.some((todo) => todo.title === 'in-range'))
  assert(!todos.some((todo) => todo.title === 'out-of-range'))
})

test('GET /api/v1/todos with startDate > endDate returns 400', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `drinv-${suffix}`, email: `drinv-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token

  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    query: { startDate: '2026-04-01', endDate: '2026-03-01' }
  })
  assert.strictEqual(res.statusCode, 400)
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

test('POST /api/v1/todos/bulk-add-tag without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-add-tag',
    payload: { todoIds: [1], tagId: 1 }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('POST /api/v1/todos/bulk-add-tag with empty todoIds returns 400', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulktag-${suffix}`, email: `bulktag-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-add-tag',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [], tagId: 1 }
  })
  assert.strictEqual(res.statusCode, 400)
})

test('POST /api/v1/todos/bulk-add-tag adds tag to selected todos and returns added count', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulktag2-${suffix}`, email: `bulktag2-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'bulk-tag', color: '#ff0000' }
  })
  const tag = JSON.parse(tagRes.payload)
  const todo1Res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Todo 1' }
  })
  const todo2Res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Todo 2' }
  })
  const todo1 = JSON.parse(todo1Res.payload)
  const todo2 = JSON.parse(todo2Res.payload)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-add-tag',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [todo1.id, todo2.id], tagId: tag.id }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.added, 2)
  const get1 = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo1.id}`,
    headers: { authorization: `Bearer ${token}` }
  })
  const get2 = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todo2.id}`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(get1.statusCode, 200)
  assert.strictEqual(get2.statusCode, 200)
  assert(JSON.parse(get1.payload).Tags.some((tg) => tg.id === tag.id))
  assert(JSON.parse(get2.payload).Tags.some((tg) => tg.id === tag.id))
})

test('POST /api/v1/todos/bulk-add-tag when tag already on some todos returns only newly added count', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `bulktag3-${suffix}`, email: `bulktag3-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const tagRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'existing-tag', color: '#00ff00' }
  })
  const tag = JSON.parse(tagRes.payload)
  const todo1Res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Todo with tag' }
  })
  const todo2Res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Todo without tag' }
  })
  const todo1 = JSON.parse(todo1Res.payload)
  const todo2 = JSON.parse(todo2Res.payload)
  await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todo1.id}/tags`,
    headers: { authorization: `Bearer ${token}` },
    payload: { tagId: tag.id }
  })
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-add-tag',
    headers: { authorization: `Bearer ${token}` },
    payload: { todoIds: [todo1.id, todo2.id], tagId: tag.id }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.added, 1)
})

test('bulk-add-tag with other user todo ids returns added 0 and does not add tag to other user todo', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const userA = { name: `bulktagA-${suffix}`, email: `bulktagA-${suffix}@test.local`, password: 'pass123' }
  const userB = { name: `bulktagB-${suffix}`, email: `bulktagB-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userA })
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: userB })
  const loginA = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userA.email, password: userA.password } })
  const loginB = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: userB.email, password: userB.password } })
  const tokenA = JSON.parse(loginA.payload).token
  const tokenB = JSON.parse(loginB.payload).token
  const todoARes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${tokenA}` },
    payload: { title: 'A todo' }
  })
  const tagBRes = await app.inject({
    method: 'POST',
    url: '/api/v1/tags',
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { name: 'B tag' }
  })
  const todoA = JSON.parse(todoARes.payload)
  const tagB = JSON.parse(tagBRes.payload)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/bulk-add-tag',
    headers: { authorization: `Bearer ${tokenB}` },
    payload: { todoIds: [todoA.id], tagId: tagB.id }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.added, 0)
  const getA = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todoA.id}`,
    headers: { authorization: `Bearer ${tokenA}` }
  })
  assert.strictEqual(getA.statusCode, 200)
  assert.strictEqual((JSON.parse(getA.payload).Tags || []).length, 0)
})

// --- Export / Import (17.9) ---
test('GET /api/v1/todos/export without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/export'
  })
  assert.strictEqual(res.statusCode, 401)
})

test('GET /api/v1/todos/export with auth returns JSON with todos array', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `ex-${suffix}`, email: `ex-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Export todo' }
  })
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/export',
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.ok(Array.isArray(body.todos))
  assert.ok(body.todos.length >= 1)
  assert.ok(body.todos.some((row) => row.title === 'Export todo'))
})

test('GET /api/v1/todos/export?format=csv with auth returns CSV', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `csv-${suffix}`, email: `csv-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/export',
    headers: { authorization: `Bearer ${token}` },
    query: { format: 'csv' }
  })
  assert.strictEqual(res.statusCode, 200)
  assert.ok(res.payload.includes('title,description,completed,priority,dueDate,tagIds,projectId'))
})

test('POST /api/v1/todos/import without auth returns 401', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/import',
    payload: { format: 'json', data: { todos: [] } }
  })
  assert.strictEqual(res.statusCode, 401)
})

test('POST /api/v1/todos/import with json format creates todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `im-${suffix}`, email: `im-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/import',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      format: 'json',
      data: {
        todos: [
          { title: 'Imported one' },
          { title: 'Imported two', priority: 'high', completed: true }
        ]
      }
    }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.created, 2)
  assert.strictEqual(body.failed, 0)
  const listRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` }
  })
  const list = JSON.parse(listRes.payload)
  assert.ok(list.some((todo) => todo.title === 'Imported one'))
  assert.ok(list.some((todo) => todo.title === 'Imported two' && todo.completed === true))
})

test('POST /api/v1/todos/import with csv format creates todos', async (t) => {
  const app = await build(t)
  const suffix = uniqueSuffix()
  const user = { name: `imcsv-${suffix}`, email: `imcsv-${suffix}@test.local`, password: 'pass123' }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const loginRes = await app.inject({ method: 'POST', url: '/api/v1/login', payload: { email: user.email, password: user.password } })
  const token = JSON.parse(loginRes.payload).token
  const csv = 'title,description,completed,priority,dueDate\nA task,,false,medium,\nB task,desc,true,high,'
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/import',
    headers: { authorization: `Bearer ${token}` },
    payload: { format: 'csv', data: csv }
  })
  assert.strictEqual(res.statusCode, 200)
  const body = JSON.parse(res.payload)
  assert.strictEqual(body.created, 2)
  assert.strictEqual(body.failed, 0)
})
