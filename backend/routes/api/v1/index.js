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
  addTagToTodo,
  removeTagFromTodo,
} = require('../../../controllers/todoController');
const {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
} = require('../../../controllers/tagController');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectTodos,
  getProjectProgress,
  archiveProject,
} = require('../../../controllers/projectController');
const {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createTodoFromTemplate,
} = require('../../../controllers/templateController');

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
   * tags CRUD API routes (JWT 必須)
   */
  fastify.post('/tags', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          color: { type: 'string', maxLength: 7 },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => createTag(fastify, request, reply),
  });
  fastify.get('/tags', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getTags(fastify, request, reply),
  });
  fastify.get('/tags/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getTagById(fastify, request, reply),
  });
  fastify.put('/tags/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          color: { type: 'string', maxLength: 7 },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => updateTag(fastify, request, reply),
  });
  fastify.delete('/tags/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => deleteTag(fastify, request, reply),
  });

  /**
   * projects CRUD API routes (JWT 必須)
   */
  const projectIdParam = {
    params: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
    },
  };
  fastify.post('/projects', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string' },
          color: { type: 'string', maxLength: 7 },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => createProject(fastify, request, reply),
  });
  fastify.get('/projects', {
    schema: {
      querystring: {
        type: 'object',
        properties: { includeArchived: { type: 'string', enum: ['true', 'false'] } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getProjects(fastify, request, reply),
  });
  fastify.get('/projects/:id', {
    schema: { ...projectIdParam },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getProjectById(fastify, request, reply),
  });
  fastify.put('/projects/:id', {
    schema: {
      ...projectIdParam,
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string' },
          color: { type: 'string', maxLength: 7 },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => updateProject(fastify, request, reply),
  });
  fastify.delete('/projects/:id', {
    schema: { ...projectIdParam },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => deleteProject(fastify, request, reply),
  });
  fastify.get('/projects/:id/todos', {
    schema: { ...projectIdParam },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getProjectTodos(fastify, request, reply),
  });
  fastify.get('/projects/:id/progress', {
    schema: { ...projectIdParam },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getProjectProgress(fastify, request, reply),
  });
  fastify.patch('/projects/:id/archive', {
    schema: { ...projectIdParam },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => archiveProject(fastify, request, reply),
  });

  /**
   * templates CRUD API routes (JWT 必須)
   */
  fastify.get('/templates', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getTemplates(fastify, request, reply),
  });
  fastify.post('/templates', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'title'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          title: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          tagIds: { type: 'array', items: { type: 'integer' } },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => createTemplate(fastify, request, reply),
  });
  fastify.get('/templates/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => getTemplateById(fastify, request, reply),
  });
  fastify.put('/templates/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          title: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          tagIds: { type: 'array', items: { type: 'integer' } },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => updateTemplate(fastify, request, reply),
  });
  fastify.delete('/templates/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9]+$' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => deleteTemplate(fastify, request, reply),
  });
  fastify.post('/templates/:id/create-todo', {
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
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => createTodoFromTemplate(fastify, request, reply),
  });

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
          projectId: { type: 'integer' },
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
          tags: { type: 'string' },
          projectId: { type: 'string', pattern: '^[0-9]+$' },
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
          tags: { type: 'string' },
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
        maxItems: 100,
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
  fastify.post('/todos/:todoId/tags', {
    schema: {
      params: {
        type: 'object',
        required: ['todoId'],
        properties: { todoId: { type: 'string', pattern: '^[0-9]+$' } },
      },
      body: {
        type: 'object',
        required: ['tagId'],
        properties: { tagId: { type: 'integer' } },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => addTagToTodo(fastify, request, reply),
  });
  fastify.delete('/todos/:todoId/tags/:tagId', {
    schema: {
      params: {
        type: 'object',
        required: ['todoId', 'tagId'],
        properties: {
          todoId: { type: 'string', pattern: '^[0-9]+$' },
          tagId: { type: 'string', pattern: '^[0-9]+$' },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => removeTagFromTodo(fastify, request, reply),
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
          projectId: { type: ['integer', 'null'] },
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
