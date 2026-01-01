'use strict'

const fp = require('fastify-plugin')
const { Sequelize } = require('sequelize')

async function dbConnector(fastify, options) {
  const {
    DATABASE_URL,
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_HOST = 'db',
    DATABASE_PORT = '3306',
  } = process.env

  let connectionUrl = DATABASE_URL

  if (!connectionUrl) {
    if (!DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD) {
      throw new Error('Missing DATABASE_URL or DATABASE_NAME/DATABASE_USER/DATABASE_PASSWORD env vars.')
    }

    const encodedUser = encodeURIComponent(DATABASE_USER)
    const encodedPassword = encodeURIComponent(DATABASE_PASSWORD)
    connectionUrl = `mysql://${encodedUser}:${encodedPassword}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`
  }

  const sequelize = new Sequelize(connectionUrl, {
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
