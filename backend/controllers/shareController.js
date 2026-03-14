'use strict';

const shareService = require('../services/shareService');

function handleShareError(fastify, reply, error, clientMessage, statusCode = 500) {
  fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, clientMessage);
  reply.code(statusCode).send({ error: clientMessage });
}

function parseId(paramId) {
  const id = parseInt(paramId, 10);
  return Number.isNaN(id) ? null : id;
}

/**
 * POST /api/todos/:id/share 用。Todo を他ユーザーと共有する（所有者のみ）。
 */
async function shareTodo(fastify, req, reply) {
  try {
    const todoId = parseId(req.params.id);
    if (todoId === null) return reply.code(400).send({ error: 'Invalid todo id' });
    const { sharedWithUserId, permission } = req.body || {};
    const sharedWith = sharedWithUserId != null ? Number(sharedWithUserId) : null;
    if (!Number.isInteger(sharedWith) || sharedWith < 1) {
      return reply.code(400).send({ error: 'sharedWithUserId is required and must be a positive integer' });
    }
    const share = await shareService.shareTodo(fastify, todoId, sharedWith, permission ?? 'view', req.user.id);
    if (!share) return reply.code(404).send({ error: 'Not found' });
    reply.code(201).send(share.toJSON());
  } catch (error) {
    if (error.statusCode === 400) {
      return reply.code(400).send({ error: error.message });
    }
    handleShareError(fastify, reply, error, 'Share failed');
  }
}

/**
 * GET /api/todos/shared 用。自分に共有されている Todo 一覧を返す。
 */
async function getSharedTodos(fastify, req, reply) {
  try {
    const todos = await shareService.getTodosSharedWithUser(fastify, req.user.id);
    reply.code(200).send(todos);
  } catch (error) {
    handleShareError(fastify, reply, error, 'Failed to get shared todos');
  }
}

/**
 * DELETE /api/shares/:id 用。共有を解除する（Todo 所有者のみ）。
 */
async function deleteShare(fastify, req, reply) {
  try {
    const shareId = parseId(req.params.id);
    if (shareId === null) return reply.code(400).send({ error: 'Invalid share id' });
    const deleted = await shareService.deleteShareById(fastify, shareId, req.user.id);
    if (!deleted) return reply.code(404).send({ error: 'Not found' });
    reply.code(204).send();
  } catch (error) {
    handleShareError(fastify, reply, error, 'Failed to delete share');
  }
}

module.exports = {
  shareTodo,
  getSharedTodos,
  deleteShare,
};
