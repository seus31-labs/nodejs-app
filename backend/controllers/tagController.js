'use strict';

const tagService = require('../services/tagService');
const { UniqueConstraintError } = require('sequelize');

function handleTagError(fastify, reply, error, clientMessage, statusCode = 500) {
  fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, clientMessage);
  reply.code(statusCode).send({ error: clientMessage });
}

function parseTagId(paramId) {
  const id = parseInt(paramId, 10);
  return Number.isNaN(id) ? null : id;
}

async function createTag(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const tag = await tagService.createTag(fastify, userId, req.body);
    if (!tag) {
      const empty = !req.body.name || String(req.body.name).trim() === '';
      return reply.code(empty ? 400 : 409).send({ error: empty ? 'Tag name is required' : 'Tag with this name already exists' });
    }
    reply.code(201).send(tag.toJSON());
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return reply.code(409).send({ error: 'Tag with this name already exists' });
    }
    handleTagError(fastify, reply, error, 'Tag creation failed');
  }
}

async function getTags(fastify, req, reply) {
  try {
    const tags = await tagService.getTagsByUserId(fastify, req.user.id);
    reply.code(200).send(tags.map((t) => t.toJSON()));
  } catch (error) {
    handleTagError(fastify, reply, error, 'Failed to get tags');
  }
}

async function getTagById(fastify, req, reply) {
  try {
    const tagId = parseTagId(req.params.id);
    if (tagId === null) return reply.code(400).send({ error: 'Invalid tag id' });
    const tag = await tagService.getTagById(fastify, tagId, req.user.id);
    if (!tag) return reply.code(404).send({ error: 'Not found' });
    reply.code(200).send(tag.toJSON());
  } catch (error) {
    handleTagError(fastify, reply, error, 'Failed to get tag');
  }
}

async function updateTag(fastify, req, reply) {
  try {
    const tagId = parseTagId(req.params.id);
    if (tagId === null) return reply.code(400).send({ error: 'Invalid tag id' });
    const result = await tagService.updateTag(fastify, tagId, req.user.id, req.body);
    if (result.duplicate) return reply.code(409).send({ error: 'Tag with this name already exists' });
    if (!result.updated) return reply.code(404).send({ error: 'Not found' });
    reply.code(200).send(result.updated.toJSON());
  } catch (error) {
    handleTagError(fastify, reply, error, 'Tag update failed');
  }
}

async function deleteTag(fastify, req, reply) {
  try {
    const tagId = parseTagId(req.params.id);
    if (tagId === null) return reply.code(400).send({ error: 'Invalid tag id' });
    const deleted = await tagService.deleteTag(fastify, tagId, req.user.id);
    if (!deleted) return reply.code(404).send({ error: 'Not found' });
    reply.code(204).send();
  } catch (error) {
    handleTagError(fastify, reply, error, 'Tag delete failed');
  }
}

module.exports = {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
};
