'use strict'

const {
  uploadAttachment,
  getAttachments,
  deleteAttachment
} = require('../../../controllers/AttachmentController')

module.exports = async function attachmentRoutes(fastify) {
  fastify.post('/todos/:todoId/attachments', {
    schema: {
      params: {
        type: 'object',
        required: ['todoId'],
        properties: { todoId: { type: 'string', pattern: '^[0-9]+$' } }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => uploadAttachment(fastify, request, reply)
  })

  fastify.get('/todos/:todoId/attachments', {
    schema: {
      params: {
        type: 'object',
        required: ['todoId'],
        properties: { todoId: { type: 'string', pattern: '^[0-9]+$' } }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getAttachments(fastify, request, reply)
  })

  fastify.delete('/attachments/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => deleteAttachment(fastify, request, reply)
  })
}
