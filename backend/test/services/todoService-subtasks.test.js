'use strict'

const { test } = require('node:test')
const assert = require('node:assert')

const todoService = require('../../services/todoService')

function buildFastifyMock() {
  return {
    models: {
      Todo: {
        findOne: async () => null,
        findByPk: async () => null,
        findAll: async () => [],
        create: async () => null,
        count: async () => 0,
      },
      Tag: {},
      Project: {},
      TodoShare: {
        findOne: async () => null,
      },
    },
  }
}

test('getSubtasks: parent todo が見つからない場合は null', async () => {
  const fastify = buildFastifyMock()
  const res = await todoService.getSubtasks(fastify, 9999, 1)
  assert.strictEqual(res, null)
})

test('getSubtasks: parent todo が存在する場合はサブタスク配列を返す', async () => {
  const fastify = buildFastifyMock()
  fastify.models.Todo.findOne = async ({ where }) => ({ id: where.id, userId: where.id === 1 ? 10 : undefined })
  fastify.models.Todo.findAll = async ({ where }) => [
    { id: 11, parentId: where.parentId, archived: false },
    { id: 12, parentId: where.parentId, archived: false },
  ]

  const res = await todoService.getSubtasks(fastify, 1, 10)
  assert(Array.isArray(res))
  assert.strictEqual(res.length, 2)
  assert.strictEqual(res[0].parentId, 1)
  assert.strictEqual(res[1].parentId, 1)
})

test('createSubtask: parent todo が見つからない場合は null', async () => {
  const fastify = buildFastifyMock()
  const created = await todoService.createSubtask(fastify, 9999, 1, { title: 'child' })
  assert.strictEqual(created, null)
})

test('createSubtask: parent todo が存在する場合は作成して返す', async () => {
  const fastify = buildFastifyMock()
  fastify.models.Todo.findOne = async ({ where }) => ({ id: where.id, userId: 10 })
  fastify.models.Todo.create = async (payload) => ({ id: 2, ...payload })

  const created = await todoService.createSubtask(fastify, 1, 10, {
    title: 'child',
    description: 'desc',
    priority: 'high',
  })
  assert(created != null)
  assert.strictEqual(created.parentId, 1)
  assert.strictEqual(created.userId, 10)
  assert.strictEqual(created.title, 'child')
  assert.strictEqual(created.priority, 'high')
})

test('getProgress: parent todo が見つからない場合は null', async () => {
  const fastify = buildFastifyMock()
  const progress = await todoService.getProgress(fastify, 9999, 1)
  assert.strictEqual(progress, null)
})

test('getProgress: completed/total を返す', async () => {
  const fastify = buildFastifyMock()
  fastify.models.Todo.findOne = async ({ where }) => ({ id: where.id, userId: 10 })
  const counts = [3, 2]
  fastify.models.Todo.count = async () => counts.shift()

  const progress = await todoService.getProgress(fastify, 1, 10)
  assert.deepStrictEqual(progress, { completed: 2, total: 3 })
})

