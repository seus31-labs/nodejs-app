'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
require('dotenv').config()
const cors = require('@fastify/cors');

const options = {}

module.exports = async function (fastify, opts) {
  const corsOrigins = process.env.CORS_ORIGIN.split(',')

  fastify.register(cors, {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
