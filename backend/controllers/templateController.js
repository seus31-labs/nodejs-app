'use strict';

const templateService = require('../services/templateService');

function handleTemplateError(fastify, reply, error, clientMessage, statusCode = 500) {
  fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, clientMessage);
  reply.code(statusCode).send({ error: clientMessage });
}

function parseTemplateId(paramId) {
  const id = parseInt(paramId, 10);
  return Number.isNaN(id) ? null : id;
}

async function getTemplates(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const templates = await templateService.getTemplatesByUserId(fastify, userId);
    reply.code(200).send(templates.map((t) => t.toJSON()));
  } catch (error) {
    handleTemplateError(fastify, reply, error, 'Failed to get templates');
  }
}

async function getTemplateById(fastify, req, reply) {
  try {
    const templateId = parseTemplateId(req.params.id);
    if (templateId === null) return reply.code(400).send({ error: 'Invalid template id' });
    const template = await templateService.getTemplateById(fastify, templateId, req.user.id);
    if (!template) return reply.code(404).send({ error: 'Not found' });
    reply.code(200).send(template.toJSON());
  } catch (error) {
    handleTemplateError(fastify, reply, error, 'Failed to get template');
  }
}

async function createTemplate(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const template = await templateService.createTemplate(fastify, userId, req.body);
    if (!template) {
      return reply.code(400).send({ error: 'name and title are required' });
    }
    reply.code(201).send(template.toJSON());
  } catch (error) {
    handleTemplateError(fastify, reply, error, 'Template creation failed');
  }
}

async function updateTemplate(fastify, req, reply) {
  try {
    const templateId = parseTemplateId(req.params.id);
    if (templateId === null) return reply.code(400).send({ error: 'Invalid template id' });
    const template = await templateService.updateTemplate(fastify, templateId, req.user.id, req.body);
    if (!template) return reply.code(404).send({ error: 'Not found' });
    reply.code(200).send(template.toJSON());
  } catch (error) {
    handleTemplateError(fastify, reply, error, 'Template update failed');
  }
}

async function deleteTemplate(fastify, req, reply) {
  try {
    const templateId = parseTemplateId(req.params.id);
    if (templateId === null) return reply.code(400).send({ error: 'Invalid template id' });
    const deleted = await templateService.deleteTemplate(fastify, templateId, req.user.id);
    if (!deleted) return reply.code(404).send({ error: 'Not found' });
    reply.code(204).send();
  } catch (error) {
    handleTemplateError(fastify, reply, error, 'Template delete failed');
  }
}

async function createTodoFromTemplate(fastify, req, reply) {
  try {
    const templateId = parseTemplateId(req.params.id);
    if (templateId === null) return reply.code(400).send({ error: 'Invalid template id' });
    const todo = await templateService.createTodoFromTemplate(
      fastify,
      templateId,
      req.user.id,
      req.body || {}
    );
    if (!todo) return reply.code(404).send({ error: 'Template not found or invalid' });
    reply.code(201).send(todo.toJSON());
  } catch (error) {
    handleTemplateError(fastify, reply, error, 'Failed to create todo from template');
  }
}

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createTodoFromTemplate,
};
