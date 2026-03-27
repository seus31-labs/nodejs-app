'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const attachmentService = require('../../services/AttachmentService')
const storageService = require('../../services/StorageService')
const todoService = require('../../services/todoService')
const shareService = require('../../services/shareService')

test('createAttachment: 所有者は添付を作成できる', async () => {
  const uploadResult = {
    originalFileName: 'image.png',
    fileSize: 1234,
    mimeType: 'image/png',
    fileUrl: '/uploads/10/uuid.png'
  }
  const created = { id: 1, todoId: 10, fileName: 'image.png' }
  const fastify = {
    models: {
      Attachment: {
        create: async (payload) => ({ ...created, ...payload })
      }
    }
  }

  todoService.getTodoById = async () => ({ id: 10, userId: 1 })
  storageService.uploadFile = async () => uploadResult

  const result = await attachmentService.createAttachment(fastify, 10, { file: { pipe: () => {} } }, 1)
  assert.strictEqual(result.todoId, 10)
  assert.strictEqual(result.fileName, 'image.png')
})

test('getAttachmentsByTodoId: 閲覧不可なら null', async () => {
  todoService.getTodoById = async () => null
  const fastify = { models: { Attachment: { findAll: async () => [] } } }

  const result = await attachmentService.getAttachmentsByTodoId(fastify, 10, 99)
  assert.strictEqual(result, null)
})

test('deleteAttachment: edit 権限があれば削除できる', async () => {
  let destroyed = false
  const fastify = {
    models: {
      Attachment: {
        findByPk: async () => ({
          id: 5,
          todoId: 10,
          fileUrl: '/uploads/10/file.png',
          destroy: async () => { destroyed = true }
        })
      }
    },
    log: { warn: () => {} }
  }

  todoService.getTodoById = async () => ({ id: 10, userId: 1 })
  shareService.canEdit = async () => true
  storageService.deleteFile = async () => true

  const result = await attachmentService.deleteAttachment(fastify, 5, 2)
  assert.strictEqual(result, true)
  assert.strictEqual(destroyed, true)
})
