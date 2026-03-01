'use strict';

const todoService = require('../services/todoService');

async function createTodo(fastify, req, reply) {
  const userId = req.user.id;
  const todo = await todoService.createTodo(fastify, userId, req.body);
  reply.code(201).send(todo.toJSON());
}

async function getTodos(fastify, req, reply) {
  const userId = req.user.id;
  const filters = {
    completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
    priority: req.query.priority,
  };
  const todos = await todoService.getTodosByUserId(fastify, userId, filters);
  reply.code(200).send(todos.map((t) => t.toJSON()));
}

async function getTodoById(fastify, req, reply) {
  const userId = req.user.id;
  const todoId = parseInt(req.params.id, 10);
  if (Number.isNaN(todoId)) {
    return reply.code(400).send({ error: 'Invalid todo id' });
  }
  const todo = await todoService.getTodoById(fastify, todoId, userId);
  if (!todo) {
    return reply.code(404).send({ error: 'Not found' });
  }
  reply.code(200).send(todo.toJSON());
}

async function updateTodo(fastify, req, reply) {
  const userId = req.user.id;
  const todoId = parseInt(req.params.id, 10);
  if (Number.isNaN(todoId)) {
    return reply.code(400).send({ error: 'Invalid todo id' });
  }
  const todo = await todoService.updateTodo(fastify, todoId, userId, req.body);
  if (!todo) {
    return reply.code(404).send({ error: 'Not found' });
  }
  reply.code(200).send(todo.toJSON());
}

async function deleteTodo(fastify, req, reply) {
  const userId = req.user.id;
  const todoId = parseInt(req.params.id, 10);
  if (Number.isNaN(todoId)) {
    return reply.code(400).send({ error: 'Invalid todo id' });
  }
  const deleted = await todoService.deleteTodo(fastify, todoId, userId);
  if (!deleted) {
    return reply.code(404).send({ error: 'Not found' });
  }
  reply.code(204).send();
}

async function toggleComplete(fastify, req, reply) {
  const userId = req.user.id;
  const todoId = parseInt(req.params.id, 10);
  if (Number.isNaN(todoId)) {
    return reply.code(400).send({ error: 'Invalid todo id' });
  }
  const todo = await todoService.toggleComplete(fastify, todoId, userId);
  if (!todo) {
    return reply.code(404).send({ error: 'Not found' });
  }
  reply.code(200).send(todo.toJSON());
}

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleComplete,
};
