'use strict'

const { getUsers, getUser, updateUser, deleteUser } = require('../../../controllers/userController');
const { register, login } = require('../../../controllers/authController');
const {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleComplete,
  searchTodos,
  reorderTodos,
  archiveTodo,
  unarchiveTodo,
  getArchivedTodos,
  deleteArchivedTodos,
  bulkComplete,
  bulkDelete,
  bulkArchive,
} = require('../../../controllers/todoController');

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
   * todos CRUD API routes (JWT 必須)
   */
  fastify.post('/todos', {
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', maxLength: 255 },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', format: 'date' },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => createTodo(fastify, request, reply),
  });
  fastify.get('/todos', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          completed: { type: 'string', enum: ['true', 'false'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          sortBy: { type: 'string', enum: ['dueDate', 'priority', 'createdAt', 'updatedAt', 'sortOrder'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getTodos(fastify, request, reply),
  });
  fastify.put('/todos/reorder', {
    schema: {
      body: {
        type: 'object',
        required: ['todoIds'],
        properties: {
          todoIds: {
            type: 'array',
            items: { type: 'integer' },
            minItems: 1,
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => reorderTodos(fastify, request, reply),
  });
  fastify.get('/todos/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', maxLength: 255 },
          completed: { type: 'string', enum: ['true', 'false'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          sortBy: { type: 'string', enum: ['dueDate', 'priority', 'createdAt', 'updatedAt', 'sortOrder'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => searchTodos(fastify, request, reply),
  });
  fastify.get('/todos/archived', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getArchivedTodos(fastify, request, reply),
  });
  fastify.delete('/todos/archived', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => deleteArchivedTodos(fastify, request, reply),
  });
  const bulkBodySchema = {
    type: 'object',
    required: ['todoIds'],
    properties: {
      todoIds: {
        type: 'array',
        items: { type: 'integer' },
        minItems: 1,
      },
    },
  };
  fastify.post('/todos/bulk-complete', {
    schema: { body: bulkBodySchema },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => bulkComplete(fastify, request, reply),
  });
  fastify.post('/todos/bulk-delete', {
    schema: { body: bulkBodySchema },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => bulkDelete(fastify, request, reply),
  });
  fastify.post('/todos/bulk-archive', {
    schema: { body: bulkBodySchema },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => bulkArchive(fastify, request, reply),
  });
  fastify.get('/todos/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getTodoById(fastify, request, reply),
  });
  fastify.put('/todos/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', maxLength: 255 },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', format: 'date' },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => updateTodo(fastify, request, reply),
  });
  fastify.delete('/todos/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => deleteTodo(fastify, request, reply),
  });
  fastify.patch('/todos/:id/toggle', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => toggleComplete(fastify, request, reply),
  });
  fastify.patch('/todos/:id/archive', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => archiveTodo(fastify, request, reply),
  });
  fastify.patch('/todos/:id/unarchive', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => unarchiveTodo(fastify, request, reply),
  });
}
