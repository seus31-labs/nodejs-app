'use strict'

const { test } = require('node:test')
const assert = require('node:assert')

const todoService = require('../../services/todoService')

function buildFastifyMock() {
  return {
    log: {
      error: () => {},
    },
    models: {
      Todo: {
        findOne: async () => null,
        create: async () => null,
      },
      Tag: {},
      Project: {},
      TodoShare: {
        findOne: async () => null,
      },
    },
  }
}

test('createTodo: 繰り返し設定を保存する', async () => {
  const fastify = buildFastifyMock()
  let payload = null
  fastify.models.Todo.create = async (data) => {
    payload = data
    return { id: 1, ...data }
  }

  const created = await todoService.createTodo(fastify, 10, {
    title: '定期タスク',
    isRecurring: true,
    recurrencePattern: 'weekly',
    recurrenceInterval: 2,
    recurrenceEndDate: '2026-12-31',
  })

  assert(created != null)
  assert.strictEqual(payload.isRecurring, true)
  assert.strictEqual(payload.recurrencePattern, 'weekly')
  assert.strictEqual(payload.recurrenceInterval, 2)
  assert.strictEqual(payload.recurrenceEndDate, '2026-12-31')
})

test('createTodo: isRecurring が false の場合は繰り返しフィールドをクリアする', async () => {
  const fastify = buildFastifyMock()
  let payload = null
  fastify.models.Todo.create = async (data) => {
    payload = data
    return { id: 2, ...data }
  }

  await todoService.createTodo(fastify, 10, {
    title: '通常タスク',
    isRecurring: false,
    recurrencePattern: 'daily',
    recurrenceInterval: 3,
    recurrenceEndDate: '2026-12-31',
  })

  assert(payload != null)
  assert.strictEqual(payload.isRecurring, false)
  assert.strictEqual(payload.recurrencePattern, null)
  assert.strictEqual(payload.recurrenceInterval, 1)
  assert.strictEqual(payload.recurrenceEndDate, null)
})

test('toggleComplete: 繰り返しタスクを完了にしたとき次回 Todo を生成する', async () => {
  const fastify = buildFastifyMock()
  const createdPayloads = []
  const todo = {
    id: 5,
    userId: 10,
    title: '毎日タスク',
    description: null,
    priority: 'medium',
    dueDate: '2026-03-25',
    projectId: null,
    reminderEnabled: true,
    completed: false,
    archived: false,
    isRecurring: true,
    recurrencePattern: 'daily',
    recurrenceInterval: 1,
    recurrenceEndDate: '2026-12-31',
    originalTodoId: null,
    save: async () => {},
  }

  fastify.models.Todo.findOne = async ({ where }) => {
    if (where.id === 5) return todo
    return null
  }
  fastify.models.Todo.create = async (data) => {
    createdPayloads.push(data)
    return { id: 6, ...data }
  }

  const updated = await todoService.toggleComplete(fastify, 5, 10)
  assert(updated != null)
  assert.strictEqual(updated.completed, true)
  assert.strictEqual(createdPayloads.length, 1)
  assert.strictEqual(createdPayloads[0].dueDate, '2026-03-26')
  assert.strictEqual(createdPayloads[0].originalTodoId, 5)
})

test('toggleComplete: isRecurring が false の通常 Todo は次回生成しない', async () => {
  const fastify = buildFastifyMock()
  const todo = {
    id: 6,
    userId: 10,
    title: '通常タスク',
    completed: false,
    isRecurring: false,
    save: async () => {},
  }

  let createCalled = false
  fastify.models.Todo.findOne = async ({ where }) => {
    if (where.id === 6) return todo
    return null
  }
  fastify.models.Todo.create = async () => {
    createCalled = true
    return null
  }

  const updated = await todoService.toggleComplete(fastify, 6, 10)
  assert(updated != null)
  assert.strictEqual(updated.completed, true)
  assert.strictEqual(createCalled, false)
})

test('toggleComplete: 終了日を超える場合は次回 Todo を生成しない', async () => {
  const fastify = buildFastifyMock()
  const todo = {
    id: 7,
    userId: 10,
    title: '最終日タスク',
    description: null,
    priority: 'medium',
    dueDate: '2026-03-25',
    projectId: null,
    reminderEnabled: true,
    completed: false,
    archived: false,
    isRecurring: true,
    recurrencePattern: 'daily',
    recurrenceInterval: 1,
    recurrenceEndDate: '2026-03-25',
    originalTodoId: null,
    save: async () => {},
  }

  let createCalled = false
  fastify.models.Todo.findOne = async ({ where }) => {
    if (where.id === 7) return todo
    return null
  }
  fastify.models.Todo.create = async () => {
    createCalled = true
    return null
  }

  const updated = await todoService.toggleComplete(fastify, 7, 10)
  assert(updated != null)
  assert.strictEqual(updated.completed, true)
  assert.strictEqual(createCalled, false)
})

test('toggleComplete: 次回生成が失敗しても完了操作は成功扱いにする', async () => {
  const fastify = buildFastifyMock()
  const todo = {
    id: 8,
    userId: 10,
    title: '毎週タスク',
    dueDate: '2026-03-25',
    completed: false,
    isRecurring: true,
    recurrencePattern: 'weekly',
    recurrenceInterval: 1,
    save: async () => {},
  }

  let logged = false
  fastify.log.error = () => {
    logged = true
  }
  fastify.models.Todo.findOne = async ({ where }) => {
    if (where.id === 8) return todo
    return null
  }
  fastify.models.Todo.create = async () => {
    throw new Error('db error')
  }

  const updated = await todoService.toggleComplete(fastify, 8, 10)
  assert(updated != null)
  assert.strictEqual(updated.completed, true)
  assert.strictEqual(logged, true)
})

