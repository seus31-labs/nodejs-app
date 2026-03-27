'use strict'

const attachmentService = require('../services/AttachmentService')

function parseId(value) {
  const id = Number.parseInt(value, 10)
  return Number.isInteger(id) && id > 0 ? id : null
}

function toPlainAttachment(attachment) {
  return typeof attachment?.toJSON === 'function' ? attachment.toJSON() : attachment
}

async function uploadAttachment(fastify, req, reply) {
  try {
    const todoId = parseId(req.params.todoId)
    if (todoId === null) return reply.code(400).send({ error: 'Invalid todo id' })

    const file = await req.file()
    if (!file) return reply.code(400).send({ error: 'File is required' })

    const isAllowedMimeType = typeof fastify.isAllowedAttachmentMimeType === 'function'
      ? fastify.isAllowedAttachmentMimeType(file.mimetype)
      : true
    if (!isAllowedMimeType) {
      return reply.code(400).send({ error: 'Unsupported mime type' })
    }

    const created = await attachmentService.createAttachment(fastify, todoId, file, req.user.id)
    if (!created) return reply.code(403).send({ error: 'Forbidden' })
    return reply.code(201).send(toPlainAttachment(created))
  } catch (error) {
    if (error?.code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply.code(413).send({ error: 'File too large' })
    }
    fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, 'Failed to upload attachment')
    return reply.code(500).send({ error: 'Failed to upload attachment' })
  }
}

async function getAttachments(fastify, req, reply) {
  try {
    const todoId = parseId(req.params.todoId)
    if (todoId === null) return reply.code(400).send({ error: 'Invalid todo id' })

    const list = await attachmentService.getAttachmentsByTodoId(fastify, todoId, req.user.id)
    if (list === null) return reply.code(403).send({ error: 'Forbidden' })
    return reply.code(200).send(list.map(toPlainAttachment))
  } catch (error) {
    fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, 'Failed to get attachments')
    return reply.code(500).send({ error: 'Failed to get attachments' })
  }
}

async function deleteAttachment(fastify, req, reply) {
  try {
    const attachmentId = parseId(req.params.id)
    if (attachmentId === null) return reply.code(400).send({ error: 'Invalid attachment id' })

    const deleted = await attachmentService.deleteAttachment(fastify, attachmentId, req.user.id)
    if (!deleted) return reply.code(404).send({ error: 'Not found' })
    return reply.code(204).send()
  } catch (error) {
    fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, 'Failed to delete attachment')
    return reply.code(500).send({ error: 'Failed to delete attachment' })
  }
}

module.exports = {
  uploadAttachment,
  getAttachments,
  deleteAttachment
}
