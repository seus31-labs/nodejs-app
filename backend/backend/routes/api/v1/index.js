'use strict'

const { getUsers, getUser, updateUser, deleteUser } = require('../../../controllers/userController');
const { createTask, getTasks } = require('../../../controllers/taskController');
const { register, login } = require('../../../controllers/authController');

module.exports = async function (fastify, opts) {
  /**
   * Auth
   */
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {type: 'string'},
          email: {type: 'string', format: 'email'},
          password: {type: 'string'},
        }
      }
    },
    handler: async (request, reply) => register(fastify, request, reply)
  });
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {type: 'string', format: 'email'},
          password: {type: 'string'},
        }
      }
    },
    handler: async (request, reply) => login(fastify, request, reply)
  });

  /**
   * users CRUD API routes.
   */
  fastify.get('/users', { preHandler: [fastify.authenticate] }, async (request, reply)=> getUsers(fastify, request, reply));
  fastify.get('/users/:id', { preHandler: [fastify.authenticate] }, async (request, reply)=> getUser(fastify, request, reply));
  fastify.put('/users/:id', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: {type: 'string'},
          email: {type: 'string', format: 'email'},
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply)=> updateUser(fastify, request, reply)
  });
  fastify.delete('/users/:id', { preHandler: [fastify.authenticate] }, async (request, reply)=> deleteUser(fastify, request, reply));

  /**
   * tasks CRUD API routes.
   */
  fastify.get('/tasks', { preHandler: [fastify.authenticate]}, async (request, reply) => getTasks(fastify, request, reply));
  fastify.post('/tasks', {
    schema: {
      body: {
        type: 'object',
        required: ['taskName', 'status'],
        properties: {
          taskName: {type: 'string'},
          status: {type: 'number'},
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => createTask(fastify, request, reply)
  });
}
