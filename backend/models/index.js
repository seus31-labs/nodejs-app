'use strict'

const fp = require('fastify-plugin')
const User = require('./user')
const Task = require('./task')

module.exports = fp(async function (fastify, opts) {
  const sequelize = fastify.sequelize

  const models = {
    User: User(sequelize),
    Task: Task(sequelize),
  }

  fastify.decorate('models', models)
}, { dependencies: ['dbConnector'] })
