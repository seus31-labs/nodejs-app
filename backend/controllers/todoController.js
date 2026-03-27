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

function isDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

function validateRecurrencePayload(body, { requirePatternWhenRecurring = false } = {}) {
  if (body == null || typeof body !== 'object') return null;

  if (body.isRecurring !== undefined && typeof body.isRecurring !== 'boolean') {
    return 'isRecurring must be boolean';
  }

  if (
    body.recurrencePattern !== undefined &&
    body.recurrencePattern !== null &&
    !['daily', 'weekly', 'monthly'].includes(body.recurrencePattern)
  ) {
    return 'recurrencePattern must be one of daily, weekly, monthly';
  }

  if (
    body.recurrenceInterval !== undefined &&
    (!Number.isInteger(body.recurrenceInterval) || body.recurrenceInterval <= 0)
  ) {
    return 'recurrenceInterval must be a positive integer';
  }

  if (
    body.recurrenceEndDate !== undefined &&
    body.recurrenceEndDate !== null &&
    !isDateOnly(body.recurrenceEndDate)
  ) {
    return 'recurrenceEndDate must be date format (YYYY-MM-DD)';
  }

  if (body.isRecurring === false) {
    if (body.recurrencePattern !== undefined && body.recurrencePattern !== null) {
      return 'recurrencePattern must be null when isRecurring is false';
    }
    if (body.recurrenceInterval !== undefined && body.recurrenceInterval !== 1) {
      return 'recurrenceInterval must be 1 when isRecurring is false';
    }
    if (body.recurrenceEndDate !== undefined && body.recurrenceEndDate !== null) {
      return 'recurrenceEndDate must be null when isRecurring is false';
    }
  }

  if (body.isRecurring === true && requirePatternWhenRecurring && body.recurrencePattern == null) {
    return 'recurrencePattern is required when isRecurring is true';
  }

  return null;
}

async function createTodo(fastify, req, reply) {
  try {
    const recurrenceError = validateRecurrencePayload(req.body, { requirePatternWhenRecurring: true });
    if (recurrenceError) {
      return reply.code(400).send({ error: recurrenceError });
    }
    const userId = req.user.id;
    const todo = await todoService.createTodo(fastify, userId, req.body);
    reply.code(201).send(todo.toJSON());
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Todo creation failed');
  }
}

function parseTagIdsQuery(q) {
  if (q == null || q === '') return undefined;
  const ids = String(q).split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n) && n > 0);
  return ids.length > 0 ? ids : undefined;
}

async function getTodos(fastify, req, reply) {
  try {
    const userId = req.user.id;
    if (req.query.startDate && req.query.endDate && req.query.startDate > req.query.endDate) {
      return reply.code(400).send({ error: 'startDate must be less than or equal to endDate' });
    }
    const options = {
      completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
      priority: req.query.priority,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      tagIds: parseTagIdsQuery(req.query.tags),
      projectId: req.query.projectId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
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

async function getSubtasks(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const subtasks = await todoService.getSubtasks(fastify, todoId, req.user.id);
    if (!subtasks) {
      return reply.code(404).send({ error: 'Not found' });
    }
    reply.code(200).send(subtasks.map((t) => t.toJSON()));
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to get subtasks');
  }
}

async function createSubtask(fastify, req, reply) {
  try {
    const parentId = parseTodoId(req.params.id);
    if (parentId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const subtask = await todoService.createSubtask(fastify, parentId, req.user.id, req.body);
    if (!subtask) {
      return reply.code(404).send({ error: 'Not found' });
    }
    reply.code(201).send(subtask.toJSON());
  } catch (error) {
    if (error?.code === 'CIRCULAR_REFERENCE') {
      return reply.code(400).send({ error: error.message });
    }
    handleTodoError(fastify, reply, error, 'Failed to create subtask');
  }
}

async function getProgress(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const progress = await todoService.getProgress(fastify, todoId, req.user.id);
    if (!progress) {
      return reply.code(404).send({ error: 'Not found' });
    }
    const { completed, total } = progress;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    reply.code(200).send({ completed, total, percentage });
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to get progress');
  }
}

async function updateTodo(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const recurrenceError = validateRecurrencePayload(req.body);
    if (recurrenceError) {
      return reply.code(400).send({ error: recurrenceError });
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
      tagIds: parseTagIdsQuery(req.query.tags),
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

async function bulkComplete(fastify, req, reply) {
  try {
    const todoIds = req.body.todoIds;
    const updated = await todoService.bulkComplete(fastify, todoIds, req.user.id);
    reply.code(200).send({ updated });
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Bulk complete failed');
  }
}

async function bulkDelete(fastify, req, reply) {
  try {
    const todoIds = req.body.todoIds;
    const deleted = await todoService.bulkDelete(fastify, todoIds, req.user.id);
    reply.code(200).send({ deleted });
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Bulk delete failed');
  }
}

async function bulkArchive(fastify, req, reply) {
  try {
    const todoIds = req.body.todoIds;
    const updated = await todoService.bulkArchive(fastify, todoIds, req.user.id);
    reply.code(200).send({ updated });
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Bulk archive failed');
  }
}

async function bulkAddTag(fastify, req, reply) {
  try {
    const todoIds = req.body.todoIds;
    const tagId = req.body.tagId != null ? Number(req.body.tagId) : null;
    if (tagId == null || !Number.isInteger(tagId) || tagId <= 0) {
      return reply.code(400).send({ error: 'Invalid tag id' });
    }
    const added = await todoService.bulkAddTag(fastify, todoIds, tagId, req.user.id);
    reply.code(200).send({ added });
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Bulk add tag failed');
  }
}

async function addTagToTodo(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.todoId);
    const tagId = parseTodoId(req.body?.tagId);
    if (todoId === null || tagId === null) {
      return reply.code(400).send({ error: 'Invalid todo id or tag id' });
    }
    const ok = await todoService.addTagToTodo(fastify, todoId, tagId, req.user.id);
    if (!ok) return reply.code(404).send({ error: 'Not found' });
    reply.code(204).send();
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Add tag to todo failed');
  }
}

async function removeTagFromTodo(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.todoId);
    const tagId = parseTodoId(req.params.tagId);
    if (todoId === null || tagId === null) {
      return reply.code(400).send({ error: 'Invalid todo id or tag id' });
    }
    const ok = await todoService.removeTagFromTodo(fastify, todoId, tagId, req.user.id);
    if (!ok) return reply.code(404).send({ error: 'Not found' });
    reply.code(204).send();
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Remove tag from todo failed');
  }
}

async function getDueSoonTodos(fastify, req, reply) {
  try {
    const todos = await todoService.getDueSoonTodos(fastify, req.user.id);
    reply.code(200).send(todos.map((t) => t.toJSON()));
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to get due soon todos');
  }
}

async function toggleReminder(fastify, req, reply) {
  try {
    const todoId = parseTodoId(req.params.id);
    if (todoId === null) {
      return reply.code(400).send({ error: 'Invalid todo id' });
    }
    const enabled = !!req.body?.enabled;
    const todo = await todoService.toggleReminder(fastify, todoId, req.user.id, enabled);
    if (!todo) return reply.code(404).send({ error: 'Not found' });
    reply.code(200).send(todo.toJSON());
  } catch (error) {
    handleTodoError(fastify, reply, error, 'Failed to toggle reminder');
  }
}

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  getSubtasks,
  createSubtask,
  getProgress,
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
  bulkAddTag,
  addTagToTodo,
  removeTagFromTodo,
  getDueSoonTodos,
  toggleReminder,
};
