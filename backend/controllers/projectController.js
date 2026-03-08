'use strict';

const projectService = require('../services/projectService');
const todoService = require('../services/todoService');

function handleProjectError(fastify, reply, error, clientMessage, statusCode = 500) {
  fastify.log.error({ err: error, message: error?.message, stack: error?.stack }, clientMessage);
  reply.code(statusCode).send({ error: clientMessage });
}

function parseProjectId(paramId) {
  const id = parseInt(paramId, 10);
  return Number.isNaN(id) ? null : id;
}

async function createProject(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const project = await projectService.createProject(fastify, userId, req.body);
    if (!project) {
      return reply.code(400).send({ error: 'Project name is required' });
    }
    reply.code(201).send(project.toJSON());
  } catch (error) {
    handleProjectError(fastify, reply, error, 'Project creation failed');
  }
}

async function getProjects(fastify, req, reply) {
  try {
    const userId = req.user.id;
    const includeArchived = req.query.includeArchived === 'true';
    const projects = await projectService.getProjectsByUserId(fastify, userId, includeArchived);
    reply.code(200).send(projects.map((p) => p.toJSON()));
  } catch (error) {
    handleProjectError(fastify, reply, error, 'Failed to get projects');
  }
}

async function getProjectById(fastify, req, reply) {
  try {
    const projectId = parseProjectId(req.params.id);
    if (projectId === null) return reply.code(400).send({ error: 'Invalid project id' });
    const project = await projectService.getProjectById(fastify, projectId, req.user.id);
    if (!project) return reply.code(404).send({ error: 'Not found' });
    reply.code(200).send(project.toJSON());
  } catch (error) {
    handleProjectError(fastify, reply, error, 'Failed to get project');
  }
}

async function updateProject(fastify, req, reply) {
  try {
    const projectId = parseProjectId(req.params.id);
    if (projectId === null) return reply.code(400).send({ error: 'Invalid project id' });
    const project = await projectService.updateProject(fastify, projectId, req.user.id, req.body);
    if (!project) return reply.code(404).send({ error: 'Not found' });
    reply.code(200).send(project.toJSON());
  } catch (error) {
    handleProjectError(fastify, reply, error, 'Project update failed');
  }
}

async function deleteProject(fastify, req, reply) {
  try {
    const projectId = parseProjectId(req.params.id);
    if (projectId === null) return reply.code(400).send({ error: 'Invalid project id' });
    const deleted = await projectService.deleteProject(fastify, projectId, req.user.id);
    if (!deleted) return reply.code(404).send({ error: 'Not found' });
    reply.code(204).send();
  } catch (error) {
    handleProjectError(fastify, reply, error, 'Project delete failed');
  }
}

async function getProjectTodos(fastify, req, reply) {
  try {
    const projectId = parseProjectId(req.params.id);
    if (projectId === null) return reply.code(400).send({ error: 'Invalid project id' });
    const todos = await todoService.getTodosByProjectId(fastify, projectId, req.user.id);
    reply.code(200).send(todos.map((t) => t.toJSON()));
  } catch (error) {
    handleProjectError(fastify, reply, error, 'Failed to get project todos');
  }
}

async function getProjectProgress(fastify, req, reply) {
  try {
    const projectId = parseProjectId(req.params.id);
    if (projectId === null) return reply.code(400).send({ error: 'Invalid project id' });
    const progress = await projectService.getProjectProgress(fastify, projectId, req.user.id);
    reply.code(200).send(progress);
  } catch (error) {
    handleProjectError(fastify, reply, error, 'Failed to get project progress');
  }
}

async function archiveProject(fastify, req, reply) {
  try {
    const projectId = parseProjectId(req.params.id);
    if (projectId === null) return reply.code(400).send({ error: 'Invalid project id' });
    const project = await projectService.archiveProject(fastify, projectId, req.user.id);
    if (!project) return reply.code(404).send({ error: 'Not found' });
    reply.code(200).send(project.toJSON());
  } catch (error) {
    handleProjectError(fastify, reply, error, 'Project archive failed');
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectTodos,
  getProjectProgress,
  archiveProject,
};
