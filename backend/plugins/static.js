'use strict'

const path = require('node:path')
const fastifyStatic = require('@fastify/static')

const DEFAULT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

function getUploadRootDir() {
  const configured = process.env.ATTACHMENT_UPLOAD_DIR
  if (configured && configured.trim().length > 0) {
    return path.resolve(configured.trim())
  }
  return DEFAULT_UPLOAD_DIR
}

module.exports = async function staticUploadPlugin(fastify) {
  fastify.addHook('preHandler', fastify.authenticate)

  await fastify.register(fastifyStatic, {
    root: getUploadRootDir(),
    prefix: '/uploads/'
  })
}
