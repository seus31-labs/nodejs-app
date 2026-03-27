'use strict'

const fp = require('fastify-plugin')
const multipart = require('@fastify/multipart')

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback
  return parsed
}

module.exports = fp(async function multipartPlugin(fastify) {
  const maxFileSize = parsePositiveInt(process.env.ATTACHMENT_MAX_FILE_SIZE, DEFAULT_MAX_FILE_SIZE)
  const allowedMimeTypes = (process.env.ATTACHMENT_ALLOWED_MIME_TYPES || DEFAULT_ALLOWED_MIME_TYPES.join(','))
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)

  await fastify.register(multipart, {
    limits: {
      files: 1,
      fileSize: maxFileSize
    }
  })

  fastify.decorate('attachmentUploadConfig', {
    maxFileSize,
    allowedMimeTypes
  })

  fastify.decorate('isAllowedAttachmentMimeType', (mimeType) => {
    return allowedMimeTypes.includes(mimeType)
  })
})

