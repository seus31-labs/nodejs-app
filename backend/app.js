'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
require('dotenv').config()
const cors = require('@fastify/cors');

const options = {}

module.exports = async function (fastify, opts) {
  const corsOriginEnv = process.env.CORS_ORIGIN
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction && !corsOriginEnv) {
    throw new Error('CORS_ORIGIN must be set in production')
  }
  let corsOrigins = corsOriginEnv ? corsOriginEnv.split(',').map((s) => s.trim()) : true
  if (!isProduction && Array.isArray(corsOrigins)) {
    const extra = ['http://localhost:4200', 'http://localhost:4242'].filter(
      (o) => !corsOrigins.includes(o)
    )
    corsOrigins = [...corsOrigins, ...extra]
  }

  fastify.register(cors, {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  fastify.register(require('./models'))

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}

module.exports.options = options
