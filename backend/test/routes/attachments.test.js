'use strict'

const crypto = require('node:crypto')
const { test } = require('node:test')
const assert = require('node:assert')
const { build } = require('../helper')

function uniqueSuffix() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
}

function buildMultipartPayload(boundary, filename, mimeType, content) {
  const crlf = '\r\n'
  return Buffer.from(
    `--${boundary}${crlf}` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"${crlf}` +
    `Content-Type: ${mimeType}${crlf}${crlf}` +
    `${content}${crlf}` +
    `--${boundary}--${crlf}`
  )
}

async function setupUserAndTodo(app) {
  const suffix = uniqueSuffix()
  const user = {
    name: `att-${suffix}`,
    email: `att-${suffix}@test.local`,
    password: 'pass123'
  }
  await app.inject({ method: 'POST', url: '/api/v1/register', payload: user })
  const login = await app.inject({
    method: 'POST',
    url: '/api/v1/login',
    payload: { email: user.email, password: user.password }
  })
  const token = JSON.parse(login.payload).token
  const todoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos',
    headers: { authorization: `Bearer ${token}` },
    payload: { title: 'Attachment test todo' }
  })
  const todo = JSON.parse(todoRes.payload)
  return { token, todoId: todo.id }
}

test('attachments routes without auth return 401', async (t) => {
  const app = await build(t)

  const postRes = await app.inject({
    method: 'POST',
    url: '/api/v1/todos/1/attachments'
  })
  assert.strictEqual(postRes.statusCode, 401)

  const getRes = await app.inject({
    method: 'GET',
    url: '/api/v1/todos/1/attachments'
  })
  assert.strictEqual(getRes.statusCode, 401)

  const deleteRes = await app.inject({
    method: 'DELETE',
    url: '/api/v1/attachments/1'
  })
  assert.strictEqual(deleteRes.statusCode, 401)
})

test('POST /api/v1/todos/:todoId/attachments rejects unsupported mime type', async (t) => {
  const app = await build(t)
  const { token, todoId } = await setupUserAndTodo(app)
  const boundary = `----boundary-${crypto.randomUUID()}`
  const payload = buildMultipartPayload(boundary, 'bad.txt', 'text/plain', 'not allowed')

  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todoId}/attachments`,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': `multipart/form-data; boundary=${boundary}`
    },
    payload
  })

  assert.strictEqual(res.statusCode, 400)
  assert.strictEqual(JSON.parse(res.payload).error, 'Unsupported mime type')
})

test('attachments API: upload -> list -> delete works for owner', async (t) => {
  const app = await build(t)
  const { token, todoId } = await setupUserAndTodo(app)
  const boundary = `----boundary-${crypto.randomUUID()}`
  const payload = buildMultipartPayload(boundary, 'image.png', 'image/png', 'png-bytes')

  const uploadRes = await app.inject({
    method: 'POST',
    url: `/api/v1/todos/${todoId}/attachments`,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': `multipart/form-data; boundary=${boundary}`
    },
    payload
  })
  assert.strictEqual(uploadRes.statusCode, 201)
  const uploaded = JSON.parse(uploadRes.payload)
  assert.strictEqual(uploaded.todoId, todoId)
  assert.strictEqual(uploaded.mimeType, 'image/png')
  assert.ok(uploaded.fileUrl.startsWith(`/uploads/${todoId}/`))

  const listRes = await app.inject({
    method: 'GET',
    url: `/api/v1/todos/${todoId}/attachments`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(listRes.statusCode, 200)
  const list = JSON.parse(listRes.payload)
  assert.ok(Array.isArray(list))
  assert.ok(list.some((item) => item.id === uploaded.id))

  const deleteRes = await app.inject({
    method: 'DELETE',
    url: `/api/v1/attachments/${uploaded.id}`,
    headers: { authorization: `Bearer ${token}` }
  })
  assert.strictEqual(deleteRes.statusCode, 204)
})
