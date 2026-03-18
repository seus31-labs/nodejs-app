'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const { Op } = require('sequelize')

const todoService = require('../../services/todoService')

function mockDate(fixedIso) {
  const RealDate = Date
  const fixedNow = new RealDate(fixedIso)

  // eslint-disable-next-line no-global-assign
  global.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) return super(fixedNow)
      return super(...args)
    }

    static now() {
      return fixedNow.getTime()
    }
  }

  return () => {
    // eslint-disable-next-line no-global-assign
    global.Date = RealDate
  }
}

test('getDueSoonTodos: dueDate/riminder flags filter is applied', async () => {
  const restore = mockDate('2026-03-18T12:00:00.000Z')

  const captured = { args: null }
  const fastify = {
    models: {
      Todo: {
        findAll: async (args) => {
          captured.args = args
          return ['ok']
        },
      },
      Tag: {},
      Project: {},
    },
  }

  const res = await todoService.getDueSoonTodos(fastify, 123)
  assert.deepStrictEqual(res, ['ok'])

  assert(captured.args != null)
  assert.strictEqual(captured.args.where.userId, 123)
  assert.strictEqual(captured.args.where.archived, false)
  assert.strictEqual(captured.args.where.completed, false)
  assert.strictEqual(captured.args.where.reminderEnabled, true)

  const expectedStartDate = new Date('2026-03-17T12:00:00.000Z').toISOString().slice(0, 10)
  const expectedEndDate = new Date('2026-03-19T12:00:00.000Z').toISOString().slice(0, 10)

  assert(Array.isArray(captured.args.where.dueDate[Op.between]))
  assert.deepStrictEqual(captured.args.where.dueDate[Op.between], [expectedStartDate, expectedEndDate])
  assert.strictEqual(captured.args.where.reminderSentAt[Op.is], null)

  assert(Array.isArray(captured.args.include))
  assert.strictEqual(captured.args.include.length, 2)

  restore()
})

test('toggleReminder: disable reminder resets reminderSentAt and saves', async () => {
  const todo = {
    id: 1,
    userId: 10,
    reminderEnabled: true,
    reminderSentAt: new Date('2026-03-01T00:00:00.000Z'),
    save: async () => {},
  }

  let didSave = false
  let capturedTodo = null
  const fastify = {
    models: {
      Todo: {
        findOne: async () => {
          const t = { ...todo }
          t.save = async () => {
            didSave = true
            capturedTodo = t
          }
          return t
        }
      },
    },
  }

  const res = await todoService.toggleReminder(fastify, 1, 10, false)
  assert(res != null)
  assert.strictEqual(res.reminderEnabled, false)
  assert.strictEqual(res.reminderSentAt, null)
  assert.strictEqual(didSave, true)
  assert(capturedTodo != null, 'save() should have been called')
  assert.strictEqual(capturedTodo.reminderEnabled, false)
  assert.strictEqual(capturedTodo.reminderSentAt, null)
  assert.strictEqual(res, capturedTodo)
})

test('toggleReminder: enable reminder keeps reminderSentAt and saves', async () => {
  const todo = {
    id: 1,
    userId: 10,
    reminderEnabled: false,
    reminderSentAt: null,
    save: async () => {},
  }

  let didSave = false
  const fastify = {
    models: {
      Todo: {
        findOne: async () => ({
          ...todo,
          save: async () => {
            didSave = true
          },
        }),
      },
    },
  }

  const res = await todoService.toggleReminder(fastify, 1, 10, true)
  assert(res != null)
  assert.strictEqual(res.reminderEnabled, true)
  assert.strictEqual(res.reminderSentAt, null)
  assert.strictEqual(didSave, true)
})

test('toggleReminder: missing todo returns null', async () => {
  const fastify = {
    models: {
      Todo: { findOne: async () => null },
    },
  }

  const res = await todoService.toggleReminder(fastify, 1, 10, false)
  assert.strictEqual(res, null)
})

test('markReminderSent: sets reminderSentAt and returns true', async () => {
  const restore = mockDate('2026-03-18T12:00:00.000Z')

  const todo = {
    id: 1,
    userId: 10,
    reminderSentAt: null,
    save: async () => {},
  }

  let didSave = false
  let capturedTodo = null
  const fastify = {
    models: {
      Todo: {
        findOne: async () => {
          const t = { ...todo }
          t.save = async () => {
            didSave = true
            capturedTodo = t
          }
          return t
        }
      },
    },
  }

  const res = await todoService.markReminderSent(fastify, 1, 10)
  assert.strictEqual(res, true)
  assert.strictEqual(didSave, true)
  assert(capturedTodo != null, 'save() should have been called')
  assert(capturedTodo.reminderSentAt instanceof Date, 'reminderSentAt should be set to a Date')
  assert.strictEqual(capturedTodo.reminderSentAt.toISOString(), '2026-03-18T12:00:00.000Z')

  restore()
})

test('markReminderSent: missing todo returns false', async () => {
  const fastify = {
    models: {
      Todo: { findOne: async () => null },
    },
  }

  const res = await todoService.markReminderSent(fastify, 1, 10)
  assert.strictEqual(res, false)
})

