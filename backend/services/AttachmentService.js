'use strict'

const storageService = require('./StorageService')
const todoService = require('./todoService')
const shareService = require('./shareService')

async function canEditTodo(fastify, todo, userId) {
  if (!todo) return false
  if (todo.userId === userId) return true
  return shareService.canEdit(fastify, todo.id, userId)
}

/**
 * 添付ファイルを保存し、attachments テーブルにメタ情報を作成する。
 * @param {object} fastify
 * @param {number} todoId
 * @param {object} fileData - @fastify/multipart の file オブジェクト
 * @param {number} userId
 * @returns {Promise<object|null>}
 */
async function createAttachment(fastify, todoId, fileData, userId) {
  const todo = await todoService.getTodoById(fastify, todoId, userId)
  if (!(await canEditTodo(fastify, todo, userId))) return null

  const uploaded = await storageService.uploadFile(fileData, todoId)
  try {
    return await fastify.models.Attachment.create({
      todoId: Number(todoId),
      fileName: uploaded.originalFileName,
      fileSize: uploaded.fileSize,
      mimeType: uploaded.mimeType,
      fileUrl: uploaded.fileUrl
    })
  } catch (error) {
    await storageService.deleteFile(uploaded.fileUrl)
    throw error
  }
}

/**
 * 指定 Todo の添付一覧を取得する（所有者または view/edit 共有先）。
 * @param {object} fastify
 * @param {number} todoId
 * @param {number} userId
 * @returns {Promise<object[]|null>}
 */
async function getAttachmentsByTodoId(fastify, todoId, userId) {
  const todo = await todoService.getTodoById(fastify, todoId, userId)
  if (!todo) return null

  return fastify.models.Attachment.findAll({
    where: { todoId: Number(todoId) },
    order: [['createdAt', 'DESC']]
  })
}

/**
 * 添付ファイルを削除する（所有者または edit 共有先）。
 * @param {object} fastify
 * @param {number} attachmentId
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
async function deleteAttachment(fastify, attachmentId, userId) {
  const attachment = await fastify.models.Attachment.findByPk(attachmentId)
  if (!attachment) return false

  const todo = await todoService.getTodoById(fastify, attachment.todoId, userId)
  if (!(await canEditTodo(fastify, todo, userId))) return false

  await attachment.destroy()
  try {
    await storageService.deleteFile(attachment.fileUrl)
  } catch (error) {
    fastify.log?.warn(error, '添付ファイルの物理削除に失敗しました')
  }
  return true
}

module.exports = {
  createAttachment,
  getAttachmentsByTodoId,
  deleteAttachment
}
