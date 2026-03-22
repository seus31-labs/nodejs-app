'use strict';

const commentService = require('../services/commentService');

function handleError(fastify, reply, error, clientMessage, statusCode = 500) {
  fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, clientMessage);
  reply.code(statusCode).send({ error: clientMessage });
}

function parseId(param) {
  const id = parseInt(param, 10);
  return Number.isNaN(id) ? null : id;
}

async function getCommentsForTodo(fastify, req, reply) {
  try {
    const todoId = parseId(req.params.todoId);
    if (todoId === null) return reply.code(400).send({ error: 'Invalid todo id' });
    const list = await commentService.getCommentsByTodoId(fastify, todoId, req.user.id);
    if (list === null) return reply.code(403).send({ error: 'Forbidden' });
    reply.code(200).send(list);
  } catch (error) {
    handleError(fastify, reply, error, 'Failed to get comments');
  }
}

async function postComment(fastify, req, reply) {
  try {
    const todoId = parseId(req.params.todoId);
    if (todoId === null) return reply.code(400).send({ error: 'Invalid todo id' });
    const result = await commentService.createComment(fastify, todoId, req.user.id, req.body.content);
    if (result === null) return reply.code(403).send({ error: 'Forbidden' });
    if (result.invalid) return reply.code(400).send({ error: result.message });
    reply.code(201).send(result);
  } catch (error) {
    handleError(fastify, reply, error, 'Failed to create comment');
  }
}

async function putComment(fastify, req, reply) {
  try {
    const commentId = parseId(req.params.id);
    if (commentId === null) return reply.code(400).send({ error: 'Invalid comment id' });
    const result = await commentService.updateComment(fastify, commentId, req.user.id, req.body.content);
    if (result === null) return reply.code(404).send({ error: 'Not found' });
    if (result === false) return reply.code(403).send({ error: 'Forbidden' });
    if (result.invalid) return reply.code(400).send({ error: result.message });
    reply.code(200).send(result);
  } catch (error) {
    handleError(fastify, reply, error, 'Failed to update comment');
  }
}

async function deleteComment(fastify, req, reply) {
  try {
    const commentId = parseId(req.params.id);
    if (commentId === null) return reply.code(400).send({ error: 'Invalid comment id' });
    const result = await commentService.deleteComment(fastify, commentId, req.user.id);
    if (result === null) return reply.code(404).send({ error: 'Not found' });
    if (result === false) return reply.code(403).send({ error: 'Forbidden' });
    reply.code(204).send();
  } catch (error) {
    handleError(fastify, reply, error, 'Failed to delete comment');
  }
}

module.exports = {
  getCommentsForTodo,
  postComment,
  putComment,
  deleteComment,
};
