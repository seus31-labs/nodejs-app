'use strict';

const todoService = require('../services/todoService');

function handleTodoError(fastify, reply, error, clientMessage, statusCode = 500) {
  fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, clientMessage);
  reply.code(statusCode).send({ error: clientMessage });
}

function parseTodoId(paramId) {
  const id = parseInt(paramId, 10);
  return Number.isNaN(id) ? null : id;
}

async function createTodo(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const todo = await todoService.createTodo(fastify, userId, req.body);
    reply.code(201).send(todo.toJSON());
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Todo creation failed');
  }
}

async function getTodos(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const options = {
      completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
      priority: req.query.priority,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    const todos = await todoService.getTodosByUserId(fastify, userId, options);
    reply.code(200).send(todos.map((t) => t.toJSON()));
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to get todos');
  }
}

async function getTodoById(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const todo = await todoService.getTodoById(fastify, todoId, req.user.id);
    if (!todo) {
      return reply.code(404).send({ error: 'Not found' });
    }
    reply.code(200).send(todo.toJSON());
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to get todo');
  }
}

async function updateTodo(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const todo = await todoService.updateTodo(fastify, todoId, req.user.id, req.body);
    if (!todo) {
      return reply.code(404).send({ error: 'Not found' });
    }
    reply.code(200).send(todo.toJSON());
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to update todo');
  }
}

async function deleteTodo(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const deleted = await todoService.deleteTodo(fastify, todoId, req.user.id);
    if (!deleted) {
      return reply.code(404).send({ error: 'Not found' });
    }
    reply.code(204).send();
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to delete todo');
  }
}

async function toggleComplete(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const todo = await todoService.toggleComplete(fastify, todoId, req.user.id);
    if (!todo) {
      return reply.code(404).send({ error: 'Not found' });
    }
    reply.code(200).send(todo.toJSON());
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to toggle todo');
  }
}

async function searchTodos(fastify, req, reply) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      return reply.code(400).send({ error: 'Search query q is required and must be non-empty' });
    }
    const userId = req.user.id;
    const params = {
      query: q,
      priority: req.query.priority,
      completed:
        req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    const todos = await todoService.searchTodos(fastify, userId, params);
    reply.code(200).send(todos.map((t) => t.toJSON()));
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Search failed');
  }
}

async function reorderTodos(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const todoIds = req.body.todoIds;
    if (!Array.isArray(todoIds) || todoIds.length === 0) {
      return reply.code(400).send({ error: 'todoIds array is required and must be non-empty' });
    }
    await todoService.reorderTodos(fastify, userId, todoIds);
    reply.code(204).send();
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Reorder failed');
  }
}

async function archiveTodo(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const todo = await todoService.archiveTodo(fastify, todoId, req.user.id);
    if (!todo) {
      return reply.code(404).send({ error: 'Not found' });
    }
    reply.code(200).send(todo.toJSON());
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Archive failed');
  }
}

async function unarchiveTodo(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const todo = await todoService.unarchiveTodo(fastify, todoId, req.user.id);
    if (!todo) {
      return reply.code(404).send({ error: 'Not found' });
    }
    reply.code(200).send(todo.toJSON());
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Unarchive failed');
  }
}

async function getArchivedTodos(fastify, req, reply) {
  try {
    const todos = await todoService.getArchivedTodos(fastify, req.user.id);
    reply.code(200).send(todos.map((t) => t.toJSON()));
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to get archived todos');
  }
}

async function deleteArchivedTodos(fastify, req, reply) {
  try {
    await todoService.deleteArchivedTodos(fastify, req.user.id);
    reply.code(204).send();
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to delete archived todos');
  }
}

module.exports = {
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
};
