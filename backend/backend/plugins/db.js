'use strict'

const fp = require('fastify-plugin')
const { Sequelize } = require('sequelize')

async function dbConnector(fastify, options) {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    define: {
      underscored: true,
    },
  })

  try {
    await sequelize.authenticate()
    fastify.log.info('Database connection has been established successfully.')
  } catch (error) {
    fastify.log.error('Unable to connect to the database:', error)
    throw error
  }

  fastify.decorate('sequelize', sequelize)
  fastify.addHook('onClose', (instance, done) => {
    sequelize.close()
      .then(() => done())
      .catch(err => done(err))
  })
}

module.exports = fp(dbConnector, { name: 'dbConnector' })
