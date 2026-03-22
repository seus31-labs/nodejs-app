'use strict'

const fp = require('fastify-plugin')
const User = require('./user')
const Todo = require('./todo')
const Tag = require('./tag')
const TodoTag = require('./todoTag')
const Project = require('./project')
const TodoTemplate = require('./todoTemplate')
const TodoShare = require('./todoShare')
const Comment = require('./comment')

module.exports = fp(async function (fastify, opts) {
  const sequelize = fastify.sequelize

  const models = {
    User: User(sequelize),
    Todo: Todo(sequelize),
    Tag: Tag(sequelize),
    TodoTag: TodoTag(sequelize),
    Project: Project(sequelize),
    TodoTemplate: TodoTemplate(sequelize),
    TodoShare: TodoShare(sequelize),
    Comment: Comment(sequelize),
  }

  Object.keys(models).forEach((name) => {
    if (models[name].associate) {
      models[name].associate(models)
    }
  })

  fastify.decorate('models', models)
}, { dependencies: ['dbConnector'] })
