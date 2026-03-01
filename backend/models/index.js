'use strict'

const fp = require('fastify-plugin')
const User = require('./user')
const Todo = require('./todo')

module.exports = fp(async function (fastify, opts) {
  const sequelize = fastify.sequelize

  const models = {
    User: User(sequelize),
    Todo: Todo(sequelize),
  }

  Object.keys(models).forEach((name) => {
    if (models[name].associate) {
      models[name].associate(models)
    }
  })

  fastify.decorate('models', models)
}, { dependencies: ['dbConnector'] })
