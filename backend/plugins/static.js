'use strict'

const fp = require('fastify-plugin')
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

module.exports = fp(async function staticUploadPlugin(fastify) {
  await fastify.register(fastifyStatic, {
    root: getUploadRootDir(),
    prefix: '/uploads/'
  })
})
